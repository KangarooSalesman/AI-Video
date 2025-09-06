const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const ffmpegPath = require('ffmpeg-static')

const projectRoot = process.cwd()
const input = path.resolve(projectRoot, 'public', 'yessirz.mp4')
const output = path.resolve(projectRoot, 'public', 'yessirz_optimized.mp4')

if (!fs.existsSync(input)) {
  console.error('Input video not found:', input)
  process.exit(1)
}

console.log('Transcoding for instant seek...')
console.log('Input:', input)
console.log('Output:', output)

try {
  if (fs.existsSync(output)) fs.unlinkSync(output)
} catch {}

const args = [
  '-y',
  '-hide_banner',
  '-loglevel', 'error',
  '-i', input,
  // Video: H.264 with dense keyframes and faststart
  '-c:v', 'libx264',
  '-preset', 'veryfast',
  '-crf', '20',
  // Dense keyframes: every 0.1s and disable scene-cut keyframe choices
  '-g', '30',                 // GOP size ~30 frames (assumes ~30fps)
  '-keyint_min', '1',
  '-sc_threshold', '0',
  '-force_key_frames', 'expr:gte(t,n_forced*0.1)',
  // Web compatibility
  '-pix_fmt', 'yuv420p',
  // Move moov atom to front for progressive playback
  '-movflags', '+faststart',
  // No audio needed for scrubbing
  '-an',
  output
]

const proc = spawn(ffmpegPath, args, { stdio: 'inherit' })
proc.on('close', (code) => {
  if (code === 0) {
    console.log('Transcode complete:', output)
  } else {
    console.error('FFmpeg exited with code', code)
    process.exit(code)
  }
})


