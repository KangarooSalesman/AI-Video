import { useRef, useEffect, useState } from 'react'

interface ThreeJSApp {
  init: () => void
  cleanup: () => void
  switchScene: (state: string) => void
}

declare global {
  interface Window {
    THREE: any
  }
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const narrativeRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [narrativeIndex, setNarrativeIndex] = useState(-1)
  const threeAppRef = useRef<ThreeJSApp | null>(null)

  const narrativeStates = [
    {
      title: "How many images can possibly exist?",
      text: "What lies in the space between Order and Chaos?",
      state: 'quantum'
    },
    {
      title: "The Building Blocks",
      text: "Pixels are tiny tiles forming a mosaic. Each pixel is defined by numbers representing color and position.",
      state: 'pixels'
    },
    {
      title: "Mathematical Certainty",
      text: "Every possible combination of these numbers maps to exactly one unique image. Every image maps to exactly one unique combination of numbers.",
      state: 'coordinates'
    },
    {
      title: "The Scale",
      text: "16,777,216 colors per pixel. 1,048,576 pixels per image. This gives us a number with over 7.5 million digits.",
      state: 'scale'
    },
    {
      title: "Beyond Comprehension",
      text: "More combinations than atoms in the entire universe. Yet finite. Every photograph that could ever be taken already exists as coordinates.",
      state: 'infinite'
    },
    {
      title: "The Library of Babel",
      text: "Every frame of every possible film. Every face that could ever be seen. All waiting in mathematical space.",
      state: 'library'
    },
    {
      title: "Islands of Meaning",
      text: "Most of this space is noise. Natural images are extremely rare islands in a vast sea of randomness.",
      state: 'noise'
    },
    {
      title: "Time as Illusion",
      text: "Time becomes a set of ordered images. Each frame static and timeless. Motion is consciousness moving between coordinates.",
      state: 'time'
    },
    {
      title: "Navigation",
      text: "We don't create images. We navigate to their predetermined coordinates like travelers arriving at destinations that were always there.",
      state: 'navigation'
    },
    {
      title: "",
      text: "We are all navigators in this space. Each choice a coordinate, each moment a point in the mathematical sublime.",
      state: 'sublime'
    }
  ]

  useEffect(() => {
    // Load Three.js
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = () => {
      if (threeAppRef.current) return
      
      const threeApp = createThreeJSApp()
      threeAppRef.current = threeApp
      threeApp.init()
    }
    document.head.appendChild(script)

    return () => {
      if (threeAppRef.current) {
        threeAppRef.current.cleanup()
      }
    }
  }, [])

  const showNextLine = () => {
    console.log('showNextLine called, current narrativeIndex:', narrativeIndex, 'max:', narrativeStates.length - 1)
    
    if (narrativeIndex >= narrativeStates.length - 1) {
      console.log('Already at last narrative state')
      return
    }
    
    const newIndex = narrativeIndex + 1
    console.log('Advancing to narrative index:', newIndex)
    setNarrativeIndex(newIndex)
    
    if (narrativeRef.current) {
      narrativeRef.current.classList.remove('visible')
      setTimeout(() => {
        const currentState = narrativeStates[newIndex]
        console.log('Switching to state:', currentState.state)
        let content = ''
        if (currentState.title) {
          const titleClass = newIndex === 0 ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
          content += `<h2 class="${titleClass} font-bold text-white mb-3">${currentState.title}</h2>`
        }
        content += `<p class="text-lg md:text-xl text-gray-300">${currentState.text}</p>`
        narrativeRef.current!.innerHTML = content
        narrativeRef.current!.classList.add('visible')
        
        // Switch scene through the Three.js app
        if (threeAppRef.current && threeAppRef.current.switchScene) {
          console.log('Switching Three.js scene to:', currentState.state)
          threeAppRef.current.switchScene(currentState.state)
        } else {
          console.warn('Three.js app not ready for scene switching')
        }
      }, 500)
    }
  }

  const createThreeJSApp = (): ThreeJSApp => {
    let scene: any, camera: any, renderer: any
    let mouse = { x: 0, y: 0 }
    let animationState = 'quantum'
    let audioCtx: AudioContext, noise: AudioBufferSourceNode, filter: BiquadFilterNode, noiseGain: GainNode, oscillator: OscillatorNode, oscGain: GainNode

    const initAudio = async () => {
      if (audioCtx) return
      try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // Resume the context if it's suspended
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume()
        }
        
        noise = audioCtx.createBufferSource()
        const bufferSize = audioCtx.sampleRate * 2
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
        noise.buffer = buffer
        noise.loop = true
        
        filter = audioCtx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 20000
        noiseGain = audioCtx.createGain()
        noiseGain.gain.value = 0

        oscillator = audioCtx.createOscillator()
        oscillator.type = 'sine'
        oscillator.frequency.value = 150
        oscGain = audioCtx.createGain()
        oscGain.gain.value = 0

        noise.connect(filter).connect(noiseGain).connect(audioCtx.destination)
        oscillator.connect(oscGain).connect(audioCtx.destination)
        noise.start(0)
        oscillator.start(0)
      } catch (e) {
        console.warn("Web Audio API not supported:", e)
      }
    }

    const switchScene = (state: string) => {
      if (animationState === state) return
      animationState = state
      while(scene.children.length > 0) scene.remove(scene.children[0])
      const objects = sceneInitializers[state]()
      objects.forEach((obj: any) => scene.add(obj))

      if (!audioCtx) return
      const now = audioCtx.currentTime
      noiseGain.gain.cancelScheduledValues(now)
      oscGain.gain.cancelScheduledValues(now)
      filter.frequency.cancelScheduledValues(now)
      
      switch(state) {
        case 'quantum':
          noiseGain.gain.setTargetAtTime(0.01, now, 0.5)
          oscGain.gain.setTargetAtTime(0.02, now, 0.5)
          filter.frequency.setTargetAtTime(200, now, 0.5)
          break
        case 'pixels':
          noiseGain.gain.setTargetAtTime(0.01, now, 0.5)
          oscGain.gain.setTargetAtTime(0.0, now, 0.5)
          filter.frequency.setTargetAtTime(800, now, 0.5)
          break
        case 'coordinates':
          noiseGain.gain.setTargetAtTime(0.02, now, 0.5)
          oscGain.gain.setTargetAtTime(0.05, now, 0.5)
          filter.frequency.setTargetAtTime(500, now, 0.5)
          break
        case 'scale':
          noiseGain.gain.setTargetAtTime(0.01, now, 0.5)
          oscGain.gain.setTargetAtTime(0.1, now, 0.5)
          break
        case 'infinite':
          noiseGain.gain.setTargetAtTime(0.15, now, 0.5)
          oscGain.gain.setTargetAtTime(0.0, now, 0.5)
          filter.frequency.setTargetAtTime(10000, now, 0.5)
          break
        case 'library':
          noiseGain.gain.setTargetAtTime(0.03, now, 0.5)
          oscGain.gain.setTargetAtTime(0.2, now, 0.5)
          break
        case 'noise':
          noiseGain.gain.setTargetAtTime(0.2, now, 0.5)
          oscGain.gain.setTargetAtTime(0.15, now, 0.5)
          filter.frequency.setTargetAtTime(15000, now, 0.5)
          break
        case 'time':
          noiseGain.gain.setTargetAtTime(0.1, now, 0.5)
          oscGain.gain.setTargetAtTime(0.1, now, 0.5)
          break
        case 'navigation':
          noiseGain.gain.setTargetAtTime(0.05, now, 0.5)
          oscGain.gain.setTargetAtTime(0.15, now, 0.5)
          break
        case 'sublime':
          noiseGain.gain.setTargetAtTime(0, now, 1.0)
          oscGain.gain.setTargetAtTime(0, now, 1.0)
          break
      }
    }

    const sceneInitializers: { [key: string]: () => any[] } = {
      'quantum': () => {
        const count = 30000
        const geometry = new window.THREE.BufferGeometry()
        const positions = new Float32Array(count * 3)
        
        // Create human-like figure from particles
        const headRadius = 2.5
        for (let i = 0; i < count * 0.7; i++) {
          const i3 = i * 3
          const phi = Math.acos(-1 + (2 * i) / (count * 0.7))
          const theta = Math.sqrt((count * 0.7) * Math.PI) * phi
          positions[i3] = headRadius * Math.cos(theta) * Math.sin(phi)
          positions[i3+1] = headRadius * Math.sin(theta) * Math.sin(phi) + 1.0
          positions[i3+2] = headRadius * Math.cos(phi)
        }

        // Body/shoulders
        for (let i = Math.floor(count * 0.7); i < count; i++) {
          const i3 = i * 3
          positions[i3] = (Math.random() - 0.5) * 6
          positions[i3+1] = (Math.random() - 0.5) * 3 - 2.5
          positions[i3+2] = (Math.random() - 0.5) * 4
        }

        geometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3))
        const material = new window.THREE.PointsMaterial({ 
          color: 0xddddff, 
          size: 0.03, 
          transparent: true, 
          opacity: 0.7, 
          blending: window.THREE.AdditiveBlending 
        })
        const points = new window.THREE.Points(geometry, material)
        return [points]
      },

      'pixels': () => {
        const geometry = new window.THREE.BufferGeometry()
        const count = 10000
        const positions = new Float32Array(count * 3)
        
        // Create grid-like pixel structure
        const gridSize = 20
        for (let i = 0; i < count; i++) {
          const i3 = i * 3
          positions[i3] = ((i % gridSize) - gridSize/2) * 0.5
          positions[i3+1] = (Math.floor(i / gridSize) % gridSize - gridSize/2) * 0.5
          positions[i3+2] = (Math.floor(i / (gridSize * gridSize)) - 5) * 0.5
        }

        geometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3))
        const material = new window.THREE.PointsMaterial({ 
          color: 0xffffff, 
          size: 0.1, 
          transparent: true, 
          opacity: 0.6 
        })
        const points = new window.THREE.Points(geometry, material)
        return [points]
      },

      'coordinates': () => {
        const lineCount = 15000
        const geometry = new window.THREE.BufferGeometry()
        const positions = new Float32Array(lineCount * 2 * 3)
        
        const centralRadius = 4
        for (let i = 0; i < lineCount; i++) {
          const i6 = i * 6
          const radius = Math.random() * centralRadius
          const angle = Math.random() * Math.PI * 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          positions[i6] = x
          positions[i6+1] = y
          positions[i6+2] = 0
          positions[i6+3] = x
          positions[i6+4] = y
          positions[i6+5] = 0
        }
        
        geometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3))
        const material = new window.THREE.LineBasicMaterial({ 
          color: 0xffffff, 
          transparent: true, 
          opacity: 0.1, 
          blending: window.THREE.AdditiveBlending 
        })
        return [new window.THREE.LineSegments(geometry, material)]
      },

      'scale': () => {
        const geometry = new window.THREE.BufferGeometry()
        const count = 100000
        const positions = new Float32Array(count * 3)
        
        for (let i = 0; i < count; i++) {
          const i3 = i * 3
          positions[i3] = (Math.random() - 0.5) * 50
          positions[i3+1] = (Math.random() - 0.5) * 50
          positions[i3+2] = (Math.random() - 0.5) * 50
        }

        geometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3))
        const material = new window.THREE.PointsMaterial({ 
          color: 0xaaaaaa, 
          size: 0.02, 
          transparent: true, 
          opacity: 0.4 
        })
        return [new window.THREE.Points(geometry, material)]
      },

      'infinite': () => {
        const geometry = new window.THREE.BufferGeometry()
        const count = 200000
        const positions = new Float32Array(count * 3)
        
        for (let i = 0; i < count; i++) {
          const i3 = i * 3
          const radius = Math.random() * 100
          const theta = Math.random() * Math.PI * 2
          const phi = Math.random() * Math.PI
          positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
          positions[i3+1] = radius * Math.sin(phi) * Math.sin(theta)
          positions[i3+2] = radius * Math.cos(phi)
        }

        geometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3))
        const material = new window.THREE.PointsMaterial({ 
          color: 0x666666, 
          size: 0.01, 
          transparent: true, 
          opacity: 0.3 
        })
        return [new window.THREE.Points(geometry, material)]
      },

      'library': () => {
        const geometry = new window.THREE.BufferGeometry()
        const totalPoints = 100000
        const volumeSize = 50
        const positions = new Float32Array(totalPoints * 3)
        const colors = new Float32Array(totalPoints * 3)

        for (let i = 0; i < totalPoints; i++) {
          const i3 = i * 3
          const x = (Math.random() - 0.5) * volumeSize
          const y = (Math.random() - 0.5) * volumeSize
          const z = (Math.random() - 0.5) * volumeSize
          positions[i3] = x
          positions[i3 + 1] = y
          positions[i3 + 2] = z
          colors[i3] = (x / volumeSize) + 0.5
          colors[i3 + 1] = (y / volumeSize) + 0.5
          colors[i3 + 2] = (z / volumeSize) + 0.5
        }
        
        geometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('color', new window.THREE.BufferAttribute(colors, 3))
        const material = new window.THREE.PointsMaterial({ 
          size: 0.05, 
          vertexColors: true, 
          blending: window.THREE.AdditiveBlending, 
          transparent: true, 
          opacity: 0.7 
        })
        return [new window.THREE.Points(geometry, material)]
      },

      'noise': () => {
        const geometry = new window.THREE.BufferGeometry()
        const count = 100000
        const boxSize = 12
        const positions = new Float32Array(count * 3)
        
        for (let i = 0; i < count; i++) {
          const i3 = i * 3
          positions[i3] = (Math.random() - 0.5) * boxSize
          positions[i3+1] = (Math.random() - 0.5) * boxSize
          positions[i3+2] = (Math.random() - 0.5) * boxSize
        }
        
        geometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3))
        const material = new window.THREE.PointsMaterial({ 
          color: 0x888888, 
          size: 0.03 
        })
        return [new window.THREE.Points(geometry, material)]
      },

      'time': () => {
        const geometry = new window.THREE.BoxGeometry(1, 1, 0.1)
        const material = new window.THREE.MeshBasicMaterial({ 
          color: 0xffffff, 
          transparent: true, 
          opacity: 0.1,
          wireframe: true
        })
        
        const frames = []
        for (let i = 0; i < 24; i++) {
          const frame = new window.THREE.Mesh(geometry, material)
          frame.position.x = (i % 6 - 2.5) * 2
          frame.position.y = (Math.floor(i / 6) - 1.5) * 2
          frames.push(frame)
        }
        return frames
      },

      'navigation': () => {
        const geometry = new window.THREE.BufferGeometry()
        const count = 50000
        const positions = new Float32Array(count * 3)
        
        for (let i = 0; i < count; i++) {
          const i3 = i * 3
          const angle = (i / count) * Math.PI * 2 * 10
          const radius = i / count * 20
          positions[i3] = Math.cos(angle) * radius
          positions[i3+1] = Math.sin(angle) * radius
          positions[i3+2] = (i / count - 0.5) * 20
        }

        geometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3))
        const material = new window.THREE.PointsMaterial({ 
          color: 0xaaaaff, 
          size: 0.05, 
          transparent: true, 
          opacity: 0.6 
        })
        return [new window.THREE.Points(geometry, material)]
      },

      'sublime': () => {
        const geometry = new window.THREE.SphereGeometry(2, 64, 64)
        const material = new window.THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.1,
          wireframe: true
        })
        return [new window.THREE.Mesh(geometry, material)]
      }
    }

    const animate = () => {
      requestAnimationFrame(animate)
      const objects = scene.children
      const targetRot = { x: mouse.y * 0.1, y: mouse.x * 0.1 }
      
      scene.rotation.x += (targetRot.x - scene.rotation.x) * 0.02
      scene.rotation.y += (targetRot.y - scene.rotation.y) * 0.02

      // Animate based on current state
      switch(animationState) {
        case 'quantum':
          if (objects[0]) {
            objects[0].rotation.y += 0.0005
            const positions = objects[0].geometry.attributes.position
            const time = Date.now() * 0.0005
            for (let i = 0; i < positions.count; i++) {
              const i3 = i * 3
              const x = positions.array[i3]
              const y = positions.array[i3+1]
              positions.array[i3] += Math.sin(time + y) * 0.001
              positions.array[i3+1] += Math.cos(time + x) * 0.001
            }
            positions.needsUpdate = true
          }
          break
        case 'pixels':
          if (objects[0]) {
            objects[0].rotation.x += 0.01
            objects[0].rotation.y += 0.01
          }
          break
        case 'library':
          if (objects[0]) {
            objects[0].rotation.y += 0.0002
            objects[0].rotation.x += 0.0001
          }
          break
        case 'noise':
          if (objects[0]) {
            const positions = objects[0].geometry.attributes.position
            for (let i = 0; i < positions.count; i++) {
              const i3 = i * 3
              positions.array[i3] += (Math.random() - 0.5) * 0.01
              positions.array[i3+1] += (Math.random() - 0.5) * 0.01
              positions.array[i3+2] += (Math.random() - 0.5) * 0.01
            }
            positions.needsUpdate = true
          }
          break
        case 'navigation':
          if (objects[0]) {
            objects[0].rotation.z += 0.005
          }
          break
      }

      renderer.render(scene, camera)
    }



    return {
      init: () => {
        if (!canvasRef.current) return

        scene = new window.THREE.Scene()
        camera = new window.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.z = 10
        renderer = new window.THREE.WebGLRenderer({ canvas: canvasRef.current })
        renderer.setSize(window.innerWidth, window.innerHeight)

        // Initialize with quantum state
        const initialObjects = sceneInitializers.quantum()
        initialObjects.forEach(obj => scene.add(obj))

        // Mouse tracking
        const handleMouseMove = (e: MouseEvent) => {
          if (cursorRef.current) {
            cursorRef.current.style.left = `${e.clientX}px`
            cursorRef.current.style.top = `${e.clientY}px`
          }
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1
          mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
          
          if (!hasInteracted) {
            setHasInteracted(true)
            // Initialize audio after user gesture
            initAudio().then(() => {
              console.log('Audio initialized successfully')
            }).catch(err => {
              console.warn('Audio initialization failed:', err)
            })
            
            setTimeout(() => {
              showNextLine()
              if (scrollIndicatorRef.current) {
                scrollIndicatorRef.current.style.opacity = '1'
              }
            }, 500)
          }
        }

        let scrollTimeout: number | null = null
        const handleWheel = (e: WheelEvent) => {
          console.log('Wheel event:', { hasInteracted, narrativeIndex, deltaY: e.deltaY })
          
          if (!hasInteracted) return
          
          // Prevent multiple rapid scroll events
          if (scrollTimeout) {
            console.log('Scroll blocked by timeout')
            return
          }
          
          if (e.deltaY > 0) {
            console.log('Scrolling down, advancing narrative')
            scrollTimeout = window.setTimeout(() => {
              showNextLine()
              scrollTimeout = null
            }, 300)
          }
        }

        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
        }

        // Keyboard alternative for testing
        const handleKeyDown = (e: KeyboardEvent) => {
          console.log('Key pressed:', e.key)
          if (e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault()
            if (!hasInteracted) {
              setHasInteracted(true)
              initAudio().then(() => {
                console.log('Audio initialized via keyboard')
              }).catch(err => {
                console.warn('Audio initialization failed via keyboard:', err)
              })
              
              setTimeout(() => {
                showNextLine()
                if (scrollIndicatorRef.current) {
                  scrollIndicatorRef.current.style.opacity = '1'
                }
              }, 500)
            } else {
              showNextLine()
            }
          }
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('wheel', handleWheel, { passive: true })
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('resize', handleResize)

        animate()

        // Store event handlers for cleanup
        ;(window as any).threeEventHandlers = {
          handleMouseMove,
          handleWheel,
          handleKeyDown,
          handleResize
        }
      },

      switchScene: switchScene,

      cleanup: () => {
        const handlers = (window as any).threeEventHandlers
        if (handlers) {
          window.removeEventListener('mousemove', handlers.handleMouseMove)
          window.removeEventListener('wheel', handlers.handleWheel)
          window.removeEventListener('keydown', handlers.handleKeyDown)
          window.removeEventListener('resize', handlers.handleResize)
        }
      }
    }
  }

  return (
    <div className="bg-black text-gray-200 font-mono overflow-hidden h-screen w-screen cursor-none">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-10" />
      
      <div 
        ref={cursorRef}
        className="fixed w-10 h-10 border border-white/50 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 z-50"
      />

      <div className="fixed top-0 left-0 w-full h-full z-20 pointer-events-none flex flex-col justify-between p-8">
        <header>
          <h1 className="text-2xl font-bold text-white tracking-wider">TOTAL PIXEL SPACE</h1>
        </header>
        
        <footer className="text-center">
          <div 
            ref={narrativeRef}
            className="narrative-text max-w-2xl mx-auto text-gray-300"
            style={{ textShadow: '0 0 10px rgba(204, 204, 204, 0.3)' }}
          />
          
          <div 
            ref={scrollIndicatorRef}
            className="opacity-0 transition-opacity duration-1000 delay-1000 mt-16"
          >
            <div className="animate-bounce mb-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-gray-400 mx-auto" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 13l-7 7-7-7m14-4l-7 7-7-7"
                />
              </svg>
            </div>
            <div className="text-xs text-gray-500">
              Scroll or press Space/↓ to continue
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
