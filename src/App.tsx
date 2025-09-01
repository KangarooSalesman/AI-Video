import { useRef, useEffect, useState } from 'react'

interface ThreeJSApp {
  init: () => Promise<void>
  cleanup: () => void
  switchScene: (state: string) => Promise<void>
  updatePixelZoom: (zoomLevel: number) => void
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
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [pixelZoomLevel, setPixelZoomLevel] = useState(0) // 0 = single pixel, 1 = zoomed out to full image
  
  const threeAppRef = useRef<ThreeJSApp | null>(null)

  // Debug zoom level changes
  useEffect(() => {
    console.log('Pixel zoom level changed to:', pixelZoomLevel)
  }, [pixelZoomLevel])

  const narrativeStates = [
    {
      title: "What is an Image?",
      text: "Is it something we create, or something we discover in a space of infinite potential?",
      state: 'quantum'
    },
    {
      title: "The Building Blocks",
      text: "Pixels are tiny tiles forming a mosaic. Each pixel is defined by numbers representing color and position.",
      state: 'pixels'
    },
    {
      title: "Mathematical Certainty",
      text: "Every possible combination of these numbers maps to exactly one unique image. Every image has a unique coordinate.",
      state: 'coordinates'
    },
    {
      title: "The Scale",
      text: "With over 16.7 million colors per pixel and a million pixels per image, the total number of images that exists, has over 7.5 million digits.",
      state: 'scale'
    },
    {
      title: "Beyond Comprehension",
      text: "More combinations than atoms in the universe. Yet finite. Every photograph that could ever be taken already exists as coordinates.",
      state: 'infinite'
    },
    {
      title: "The Universal Archive",
      text: "Every frame of every possible film. Every face that could ever be seen. All waiting in a vast mathematical space to be discovered.",
      state: 'library'
    },
    {
      title: "Signal in the Noise",
      text: "Most of this space is visual static. Meaningful images are extremely rare in a vast sea of random noise.",
      state: 'noise'
    },
    {
      title: "A Search Through Static",
      text: "Locating these rare, structured images wasn’t something we could do by chance. Our tools were limited to coordinates we only found in the physical world or by arranging the pixels ourselves (painting)",
      state: 'time'
    },
    {
      title: "The Latent Compass",
      text: "Now, we have a new kind of compass. Artificial Intelligence learns the topography of this space, translating human intent into precise coordinates.",
      state: 'navigation'
    },
    {
      title: "Guided by Imagination",
      text: "We don't just wander. The AI acts as our guide, charting a course through the noise to the images we imagine.",
      state: 'sublime'
    },
    {
      title: "The Expansed Canvas",
      text: "This interface allows human language to act as the query language for the universe of all possible images 2) unlocking exploration across a previously unmappable visual expanse.",
      state: 'sublime'
    }
  ]

  // Simple advance function
  const advanceNarrative = async () => {
    console.log('advanceNarrative called, current index:', narrativeIndex, 'isTransitioning:', isTransitioning)
    
    if (isTransitioning || narrativeIndex >= narrativeStates.length - 1) {
      console.log('Blocked: transitioning or at end')
      return
    }
    
    setIsTransitioning(true)
    const newIndex = narrativeIndex + 1
    console.log('Advancing to index:', newIndex)
    setNarrativeIndex(newIndex)
    
    // Update content
    if (narrativeRef.current) {
      narrativeRef.current.classList.remove('visible')
      
      setTimeout(async () => {
        const currentState = narrativeStates[newIndex]
        let content = ''
        if (currentState.title) {
          const titleClass = newIndex === 0 ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
          content += `<h2 class="${titleClass} font-bold text-white mb-3">${currentState.title}</h2>`
        }
        content += `<p class="text-lg md:text-xl text-gray-300">${currentState.text}</p>`
        
        if (narrativeRef.current) {
          narrativeRef.current.innerHTML = content
          narrativeRef.current.classList.add('visible')
        }
        
        // Switch Three.js scene
        if (threeAppRef.current) {
          await threeAppRef.current.switchScene(currentState.state)
        }
        
        setIsTransitioning(false)
      }, 500)
    } else {
      setIsTransitioning(false)
    }
  }

  // Reset function
  const resetExperience = async () => {
    console.log('Resetting experience')
    setNarrativeIndex(-1)
    setHasInteracted(false)
    setIsTransitioning(false)
    
    if (narrativeRef.current) {
      narrativeRef.current.innerHTML = ''
      narrativeRef.current.classList.remove('visible')
    }
    
    if (scrollIndicatorRef.current) {
      scrollIndicatorRef.current.style.opacity = '0'
    }
    
    if (threeAppRef.current) {
      await threeAppRef.current.switchScene('quantum')
    }
  }

  // Global event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Global key:', e.key)
      
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        resetExperience()
        return
      }
      
      if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        
        if (!hasInteracted) {
          setHasInteracted(true)
          setTimeout(() => {
            advanceNarrative()
            if (scrollIndicatorRef.current) {
              scrollIndicatorRef.current.style.opacity = '1'
            }
          }, 500)
        } else {
          // Special handling for pixels phase - same as wheel handler
          if (narrativeIndex === 1) { // pixels phase
            console.log('Pixels phase key event, current zoom level:', pixelZoomLevel)
            
            // Use callback form to get the most current state
            setPixelZoomLevel(currentZoom => {
              console.log('Current zoom in key callback:', currentZoom)
              
              if (currentZoom < 1.19) { // Allow one extra step beyond 1.0
                const newZoomLevel = Math.min(1.2, currentZoom + 0.2) // 6 steps total
                console.log('Updating zoom level to:', newZoomLevel)
                
                // Update Three.js immediately with new value
                if (threeAppRef.current) {
                  threeAppRef.current.updatePixelZoom(newZoomLevel)
                }
                
                return newZoomLevel
              } else {
                // Only advance to next phase after the extra scroll
                console.log('Pixels zoom complete with full image shown, advancing to next phase')
          advanceNarrative()
                return 0 // Reset for next time
              }
            })
            return
          }
          
          advanceNarrative()
        }
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (!hasInteracted) return
      
      // Handle scrolling up to go back
      if (e.deltaY < 0) {
        // Scrolling up - go back
        if (narrativeIndex === 1 && pixelZoomLevel > 0) {
          // In pixels phase, zoom back in first
          setPixelZoomLevel(currentZoom => {
            const newZoomLevel = Math.max(0, currentZoom - 0.2) // 5 steps for going back
            if (threeAppRef.current) {
              threeAppRef.current.updatePixelZoom(newZoomLevel)
            }
            return newZoomLevel
          })
          return
        } else if (narrativeIndex > 0) {
          // Go back to previous narrative
          setIsTransitioning(true)
          const newIndex = narrativeIndex - 1
          setNarrativeIndex(newIndex)
          
          // Update content
          if (narrativeRef.current) {
            narrativeRef.current.classList.remove('visible')
            
            setTimeout(async () => {
              const currentState = narrativeStates[newIndex]
              let content = ''
              if (currentState.title) {
                const titleClass = newIndex === 0 ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
                content += `<h2 class="${titleClass} font-bold text-white mb-3">${currentState.title}</h2>`
              }
              content += `<p class="text-lg md:text-xl text-gray-300">${currentState.text}</p>`
              
              if (narrativeRef.current) {
                narrativeRef.current.innerHTML = content
                narrativeRef.current.classList.add('visible')
              }
              
              // Switch Three.js scene
              if (threeAppRef.current) {
                await threeAppRef.current.switchScene(currentState.state)
              }
              
              setIsTransitioning(false)
            }, 500)
          } else {
            setIsTransitioning(false)
          }
        }
        return
      }
      
      // Handle scrolling down (original behavior)
      if (e.deltaY <= 0) return
      
                // Special handling for pixels phase - zoom out instead of advancing
          if (narrativeIndex === 1) { // pixels phase
            console.log('Pixels phase wheel event, current zoom level:', pixelZoomLevel)
            
            // Use callback form to get the most current state
            setPixelZoomLevel(currentZoom => {
              console.log('Current zoom in callback:', currentZoom)
              
              if (currentZoom < 1.19) { // Allow one extra step beyond 1.0
                const newZoomLevel = Math.min(1.2, currentZoom + 0.2) // 6 steps total (0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2)
                console.log('Updating zoom level to:', newZoomLevel)
                
                // Update Three.js immediately with new value
                if (threeAppRef.current) {
                  threeAppRef.current.updatePixelZoom(newZoomLevel)
                }
                
                return newZoomLevel
              } else {
                // Only advance to next phase after the extra scroll
                console.log('Pixels zoom complete with full image shown, advancing to next phase')
                advanceNarrative()
                return 0 // Reset for next time
              }
            })
            return
          }
      
      console.log('Global wheel, advancing')
      advanceNarrative()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`
        cursorRef.current.style.top = `${e.clientY}px`
      }
      
      if (!hasInteracted) {
        console.log('First interaction via mouse')
        setHasInteracted(true)
        setTimeout(() => {
          advanceNarrative()
          if (scrollIndicatorRef.current) {
            scrollIndicatorRef.current.style.opacity = '1'
          }
        }, 500)
      }
    }

    // Add throttling to wheel - reduce throttle time for pixels phase
    let wheelTimeout: number | null = null
    const throttledWheel = (e: WheelEvent) => {
      if (wheelTimeout) return
      // Shorter throttle for pixels phase to allow smoother zoom progression
      const throttleTime = narrativeIndex === 1 ? 150 : 300
      wheelTimeout = window.setTimeout(() => {
        handleWheel(e)
        wheelTimeout = null
      }, throttleTime)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('wheel', throttledWheel, { passive: true })
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('wheel', throttledWheel)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [hasInteracted, narrativeIndex, isTransitioning])

  // Three.js initialization
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = () => {
      if (threeAppRef.current) return
      
      const threeApp = createThreeJSApp()
      threeAppRef.current = threeApp
      threeApp.init().catch(console.error)
    }
    document.head.appendChild(script)

    return () => {
      if (threeAppRef.current) {
        threeAppRef.current.cleanup()
      }
    }
  }, [])

  const createThreeJSApp = (): ThreeJSApp => {
    let scene: any, camera: any, renderer: any
    let mouse = { x: 0, y: 0 }
    let animationState = 'quantum'
    let pixelsCanvas: HTMLCanvasElement, pixelsCtx: CanvasRenderingContext2D, pixelsTexture: any
    let coordinatesCanvas: HTMLCanvasElement, coordinatesCtx: CanvasRenderingContext2D, coordinatesTexture: any
    let columns: number, rows: number
    const chars = '0123456789'
    const fontSize = 16

    let pixelGroup: any

    const setupPixelsTexture = () => {
      columns = Math.floor(window.innerWidth / fontSize)
      rows = Math.floor(window.innerHeight / fontSize)
      pixelsCanvas = document.createElement('canvas')
      pixelsCanvas.width = window.innerWidth
      pixelsCanvas.height = window.innerHeight
      pixelsCtx = pixelsCanvas.getContext('2d')!
      pixelsCtx.font = `${fontSize}px monospace`
      pixelsCtx.textAlign = 'center'
      pixelsCtx.textBaseline = 'middle'
      
      pixelsCtx.fillStyle = '#000000'
      pixelsCtx.fillRect(0, 0, pixelsCanvas.width, pixelsCanvas.height)
      
      pixelsTexture = new window.THREE.CanvasTexture(pixelsCanvas)
    }

    const setupCoordinatesTexture = () => {
      coordinatesCanvas = document.createElement('canvas')
      coordinatesCanvas.width = window.innerWidth
      coordinatesCanvas.height = window.innerHeight
      coordinatesCtx = coordinatesCanvas.getContext('2d')!
      coordinatesCtx.font = `${fontSize}px monospace`
      coordinatesCtx.textAlign = 'center'
      coordinatesCtx.textBaseline = 'middle'
      
      coordinatesCtx.fillStyle = '#000000'
      coordinatesCtx.fillRect(0, 0, coordinatesCanvas.width, coordinatesCanvas.height)
      
      // Add some sample image coordinates text
      coordinatesCtx.fillStyle = '#4a4a4a'
      coordinatesCtx.font = '12px monospace'
      coordinatesCtx.textAlign = 'left'
      coordinatesCtx.fillText('Image: landscape_sunset.jpg', 20, 30)
      coordinatesCtx.fillText('Coordinates: (127, 89, 45), (255, 201, 156), (34, 67, 123)', 20, 50)
      coordinatesCtx.fillText('Position: [0,0] [1,0] [2,0] [0,1] [1,1] [2,1]...', 20, 70)
      
      coordinatesTexture = new window.THREE.CanvasTexture(coordinatesCanvas)
    }

    const createSampleImageData = () => {
      // Create a 32x32 pixel art image - a simple smiley face
      const size = 32
      const imageData = new Uint8Array(size * size * 3) // RGB
      
      // Fill with background color (light blue sky)
      for (let i = 0; i < imageData.length; i += 3) {
        imageData[i] = 135     // R
        imageData[i + 1] = 206 // G  
        imageData[i + 2] = 235 // B (light blue)
      }
      
      const setPixel = (x: number, y: number, r: number, g: number, b: number) => {
        if (x >= 0 && x < size && y >= 0 && y < size) {
          const index = (y * size + x) * 3
          imageData[index] = r
          imageData[index + 1] = g
          imageData[index + 2] = b
        }
      }
      
      // Draw a simple smiley face
      const centerX = 16, centerY = 16
      
      // Face circle (yellow)
      for (let y = 6; y < 26; y++) {
        for (let x = 6; x < 26; x++) {
          const dx = x - centerX
          const dy = y - centerY
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance <= 9) {
            setPixel(x, y, 255, 255, 0) // Yellow
          }
        }
      }
      
      // Left eye (black)
      setPixel(12, 12, 0, 0, 0)
      setPixel(13, 12, 0, 0, 0)
      setPixel(12, 13, 0, 0, 0)
      setPixel(13, 13, 0, 0, 0)
      
      // Right eye (black)
      setPixel(18, 12, 0, 0, 0)
      setPixel(19, 12, 0, 0, 0)
      setPixel(18, 13, 0, 0, 0)
      setPixel(19, 13, 0, 0, 0)
      
      // Smile (black)
      setPixel(12, 20, 0, 0, 0)
      setPixel(13, 21, 0, 0, 0)
      setPixel(14, 22, 0, 0, 0)
      setPixel(15, 22, 0, 0, 0)
      setPixel(16, 22, 0, 0, 0)
      setPixel(17, 22, 0, 0, 0)
      setPixel(18, 21, 0, 0, 0)
      setPixel(19, 20, 0, 0, 0)
      
      // Make center pixel a specific known color for display (nose)
      setPixel(16, 16, 255, 192, 203) // Pink nose
      
      return { data: imageData, size }
    }

    // Alternative sample image - simple landscape
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const createLandscapeImageData = () => {
      const size = 32
      const imageData = new Uint8Array(size * size * 3) // RGB
      
      const setPixel = (x: number, y: number, r: number, g: number, b: number) => {
        if (x >= 0 && x < size && y >= 0 && y < size) {
          const index = (y * size + x) * 3
          imageData[index] = r
          imageData[index + 1] = g
          imageData[index + 2] = b
        }
      }
      
      // Sky (light blue gradient)
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < size; x++) {
          const intensity = 1 - (y / 20) * 0.3
          setPixel(x, y, Math.floor(135 * intensity), Math.floor(206 * intensity), 235)
        }
      }
      
      // Mountains (gray/brown)
      for (let x = 0; x < size; x++) {
        const mountainHeight = Math.floor(8 + 4 * Math.sin(x * 0.3) + 2 * Math.sin(x * 0.1))
        for (let y = 20 - mountainHeight; y < 20; y++) {
          setPixel(x, y, 101, 67, 33) // Brown mountains
        }
      }
      
      // Grass (green)
      for (let y = 20; y < size; y++) {
        for (let x = 0; x < size; x++) {
          setPixel(x, y, 34, 139, 34) // Forest green
        }
      }
      
      // Sun
      setPixel(6, 6, 255, 255, 0)
      setPixel(7, 6, 255, 255, 0)
      setPixel(6, 7, 255, 255, 0)
      setPixel(7, 7, 255, 255, 0)
      
      // Center pixel (tree trunk)
      setPixel(16, 16, 101, 67, 33) // Brown trunk
      
      return { data: imageData, size }
    }

    // Function to load an external image file
    const loadExternalImage = (imagePath: string): Promise<{data: Uint8Array, width: number, height: number}> => {
      return new Promise((resolve) => {
        console.log('Attempting to load image from:', imagePath)
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        img.onload = () => {
          console.log('Image loaded successfully! Dimensions:', img.width, 'x', img.height)
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          
          // Keep original dimensions (1622x1080 for Seurat painting)
          const targetWidth = img.width
          const targetHeight = img.height
          
          canvas.width = targetWidth
          canvas.height = targetHeight
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
          
          const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight)
          const rgbData = new Uint8Array(targetWidth * targetHeight * 3)
          
          for (let i = 0; i < imageData.data.length; i += 4) {
            const rgbIndex = (i / 4) * 3
            rgbData[rgbIndex] = imageData.data[i]     // R
            rgbData[rgbIndex + 1] = imageData.data[i + 1] // G
            rgbData[rgbIndex + 2] = imageData.data[i + 2] // B
          }
          
          console.log('Image processed successfully, dimensions:', targetWidth, 'x', targetHeight, 'RGB data length:', rgbData.length)
          resolve({ data: rgbData, width: targetWidth, height: targetHeight })
        }
        
        img.onerror = (error) => {
          console.error('Failed to load image from:', imagePath)
          console.error('Error details:', error)
          console.log('This is likely due to browser security restrictions for local files')
          console.log('Falling back to smiley face...')
          // Fallback to smiley face if image fails to load
          const sampleData = createSampleImageData()
          resolve({ data: sampleData.data, width: sampleData.size, height: sampleData.size })
        }
        
        img.src = imagePath
      })
    }

    // Alternative: Load image from file input (for user-selected files)
    const loadImageFromFile = (file: File): Promise<{data: Uint8Array, size: number}> => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            console.log('File image loaded successfully! Dimensions:', img.width, 'x', img.height)
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!
            
            canvas.width = 32
            canvas.height = 32
            ctx.drawImage(img, 0, 0, 32, 32)
            
            const imageData = ctx.getImageData(0, 0, 32, 32)
            const rgbData = new Uint8Array(32 * 32 * 3)
            
            for (let i = 0; i < imageData.data.length; i += 4) {
              const rgbIndex = (i / 4) * 3
              rgbData[rgbIndex] = imageData.data[i]
              rgbData[rgbIndex + 1] = imageData.data[i + 1]
              rgbData[rgbIndex + 2] = imageData.data[i + 2]
            }
            
            resolve({ data: rgbData, size: 32 })
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      })
    }

    const sceneInitializers: { [key: string]: () => any[] | Promise<any[]> } = {
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

      'pixels': async () => {
        // Create a simple plane with a shader that can zoom into pixels
        const geometry = new window.THREE.PlaneGeometry(10, 10)
        
        // Create image texture from our sample data
        // You can easily switch between different images:
        // const imageData = createSampleImageData()      // Smiley face (current)
        const imageData = await loadExternalImage('/ζζ.jpg') // Seurat painting (1622x1080)
        
        // For external images, you have these options:
        // 1. Put your image in the public folder and use: await loadExternalImage('/your-image.png')
        // 2. Use a web URL: await loadExternalImage('https://example.com/image.jpg')
        // 3. Local file paths don't work in browsers due to security restrictions
        
        // Example with web URL (uncomment to try):
        // const imageData = await loadExternalImage('https://picsum.photos/200/200')
        
        // Example with public folder (put image in public/ folder first):
        // const imageData = await loadExternalImage('/ζζ.png')
        
        // Suppress unused variable warnings
        void createLandscapeImageData
        void loadImageFromFile
        
        const canvas = document.createElement('canvas')
        canvas.width = imageData.width
        canvas.height = imageData.height
        const ctx = canvas.getContext('2d')!
        const imgData = ctx.createImageData(canvas.width, canvas.height)
        
        for (let i = 0; i < imageData.data.length; i++) {
          imgData.data[i * 4] = imageData.data[i * 3]     // R
          imgData.data[i * 4 + 1] = imageData.data[i * 3 + 1] // G
          imgData.data[i * 4 + 2] = imageData.data[i * 3 + 2] // B
          imgData.data[i * 4 + 3] = 255 // A
        }
        
        ctx.putImageData(imgData, 0, 0)
        const texture = new window.THREE.CanvasTexture(canvas)
        texture.magFilter = window.THREE.NearestFilter // Pixelated look
        texture.minFilter = window.THREE.NearestFilter
        
        const material = new window.THREE.ShaderMaterial({
          uniforms: {
            uTexture: { value: texture },
            uZoom: { value: 0.0 },
            uCenter: { value: new window.THREE.Vector2(0.5, 0.5) },
            uImageWidth: { value: imageData.width },
            uImageHeight: { value: imageData.height },
            uImageData: { value: imageData.data },
            uTime: { value: 0.0 }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D uTexture;
            uniform float uZoom;
            uniform vec2 uCenter;
            uniform float uImageWidth;
            uniform float uImageHeight;
            varying vec2 vUv;
            
            void main() {
              // Calculate the zoom level for 5 distinct steps
              float zoomLevel;
              
              if (uZoom >= 0.8) {
                // Step 5: Half resolution (811x540 for 1622x1080)
                zoomLevel = max(uImageWidth, uImageHeight) * 0.5;
              } else if (uZoom >= 0.6) {
                // Step 4: 100x100 pixels
                zoomLevel = 10000.0; // 100*100
              } else if (uZoom >= 0.4) {
                // Step 3: 10x10 pixels
                zoomLevel = 100.0; // 10*10
              } else if (uZoom >= 0.2) {
                // Step 2: 4x3 pixels (maintaining aspect ratio)
                zoomLevel = 12.0; // 4*3
              } else {
                // Step 1: 1x1 pixel
                zoomLevel = 1.0;
              }
              
              vec4 color;
              
              if (uZoom > 1.0) {
                // Extra scroll: Show full resolution smooth image
                color = texture2D(uTexture, vUv);
              } else {
                // Steps 1-5: Show pixelated version with specific resolutions
                float aspectRatio = uImageWidth / uImageHeight; // 1622/1080 ≈ 1.5
                
                vec2 pixelCount;
                
                if (uZoom < 0.2) {
                  // Step 1: 1x1 pixel
                  pixelCount = vec2(1.0, 1.0);
                } else if (uZoom < 0.4) {
                  // Step 2: 4x3 pixels
                  pixelCount = vec2(4.0, 3.0);
                } else if (uZoom < 0.6) {
                  // Step 3: 10x10 pixels
                  pixelCount = vec2(10.0, 10.0);
                } else if (uZoom < 0.8) {
                  // Step 4: 100x100 pixels
                  pixelCount = vec2(100.0, 100.0);
                } else {
                  // Step 5: Half resolution (811x540)
                  pixelCount = vec2(uImageWidth * 0.5, uImageHeight * 0.5);
                }
                
                // Map the current UV to the pixel grid
                vec2 pixelCoord = floor(vUv * pixelCount);
                vec2 pixelUV = (pixelCoord + 0.5) / pixelCount;
                
                // Sample the texture at the pixel center
                color = texture2D(uTexture, pixelUV);
                
                // For very zoomed in views (first two steps), darken specific pixels where text will be shown
                if (uZoom < 0.4) { // First two steps (0-0.2 and 0.2-0.4)
                  vec2 currentPixel = floor(vUv * pixelCount);
                  bool isTextPixel = false;
                  
                  if (uZoom < 0.2) {
                    // Step 1: Show text on 2 of the 4 pixels (top-left and bottom-right)
                    if ((currentPixel.x == 0.0 && currentPixel.y == 0.0) ||
                        (currentPixel.x == floor(pixelCount.x) - 1.0 && currentPixel.y == floor(pixelCount.y) - 1.0)) {
                      isTextPixel = true;
                    }
                  } else if (uZoom < 0.4) {
                    // Step 2: Show text on half of the visible pixels (checkerboard pattern)
                    float pixelIndex = mod(currentPixel.x + currentPixel.y, 2.0);
                    if (pixelIndex < 1.0) {
                      isTextPixel = true;
                    }
                  }
                  
                  if (isTextPixel) {
                    // Darken the pixel to make text more readable
                    color.rgb = mix(color.rgb, vec3(0.1), 0.5);
                  }
                }
                
                // Add subtle grid lines to show pixel boundaries
                vec2 grid = abs(fract(vUv * pixelCount) - 0.5);
                float gridStrength = smoothstep(0.45, 0.5, max(grid.x, grid.y));
                color.rgb = mix(color.rgb, vec3(0.2), gridStrength * 0.3);
              }
              
              gl_FragColor = color;
            }
          `
        })
        
        pixelGroup = new window.THREE.Mesh(geometry, material)
        return [pixelGroup]
      },

      'coordinates': () => {
        const vFOV = window.THREE.MathUtils.degToRad(camera.fov)
        const height = 2 * Math.tan(vFOV / 2) * camera.position.z
        const width = height * camera.aspect
        const geometry = new window.THREE.PlaneGeometry(width, height)
        const material = new window.THREE.MeshBasicMaterial({ 
          map: coordinatesTexture, 
          transparent: true, 
          opacity: 0.8 
        })
        const plane = new window.THREE.Mesh(geometry, material)
        return [plane]
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

    const updatePixelZoomInternal = (zoomLevel: number) => {
      if (!pixelGroup || !pixelGroup.material) return
      
      // Update shader uniform for zoom level
      pixelGroup.material.uniforms.uZoom.value = zoomLevel
      
      // Keep camera at consistent distance to maintain same viewport size
      // The shader handles the pixel density, not the camera distance
      camera.position.z = 10
    }

    const switchScene = async (state: string) => {
      console.log('Switching Three.js scene to:', state)
      if (animationState === state) return
      animationState = state
      while(scene.children.length > 0) scene.remove(scene.children[0])
      const result = sceneInitializers[state]()
      const objects = result instanceof Promise ? await result : result
      objects.forEach((obj: any) => scene.add(obj))
    }

    const animate = () => {
      requestAnimationFrame(animate)
      const objects = scene.children
      const targetRot = { x: mouse.y * 0.1, y: mouse.x * 0.1 }
      
      scene.rotation.x += (targetRot.x - scene.rotation.x) * 0.02
      scene.rotation.y += (targetRot.y - scene.rotation.y) * 0.02

      // Simple animations
      switch(animationState) {
        case 'quantum':
          if (objects[0]) {
            objects[0].rotation.y += 0.0005
          }
          break
        case 'pixels':
          // Pixel zoom animation is handled by updatePixelZoom
          // Update time uniform for any potential animations
          if (objects[0] && objects[0].material && objects[0].material.uniforms && objects[0].material.uniforms.uTime) {
            objects[0].material.uniforms.uTime.value = Date.now() * 0.001
          }
          break
        case 'coordinates':
          if (coordinatesCtx && Math.random() > 0.7) { 
            // Clear some areas and add new numbers
            for (let i = 0; i < 50; i++) { 
              const x = Math.floor(Math.random() * columns)
              const y = Math.floor(Math.random() * rows)
              coordinatesCtx.fillStyle = '#000000'
              coordinatesCtx.fillRect(x * fontSize, y * fontSize - fontSize, fontSize, fontSize * 1.1)
              coordinatesCtx.fillStyle = '#666666'
              coordinatesCtx.fillText(chars[Math.floor(Math.random() * chars.length)], x * fontSize, y * fontSize)
            }
            // Occasionally update the coordinate text
            if (Math.random() > 0.95) {
              coordinatesCtx.fillStyle = '#000000'
              coordinatesCtx.fillRect(20, 40, 600, 20)
              coordinatesCtx.fillStyle = '#4a4a4a'
              coordinatesCtx.font = '12px monospace'
              coordinatesCtx.textAlign = 'left'
              const r = Math.floor(Math.random() * 256)
              const g = Math.floor(Math.random() * 256)
              const b = Math.floor(Math.random() * 256)
              coordinatesCtx.fillText(`Coordinates: (${r}, ${g}, ${b}), (${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`, 20, 50)
            }
            if(coordinatesTexture) coordinatesTexture.needsUpdate = true
          }
          break
        case 'library':
          if (objects[0]) {
            objects[0].rotation.y += 0.0002
            objects[0].rotation.x += 0.0001
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
      init: async () => {
        if (!canvasRef.current) return

        scene = new window.THREE.Scene()
        camera = new window.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.z = 10
        renderer = new window.THREE.WebGLRenderer({ canvas: canvasRef.current })
        renderer.setSize(window.innerWidth, window.innerHeight)

        // Mouse tracking for 3D rotation
        const handleMouseMove = (e: MouseEvent) => {
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1
          mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
        }

        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
          // Re-setup textures on resize
          if(animationState === 'pixels' && scene.children.length > 0) {
            setupPixelsTexture()
            scene.children[0].material.map = pixelsTexture
          }
          if(animationState === 'coordinates' && scene.children.length > 0) {
            setupCoordinatesTexture()
            scene.children[0].material.map = coordinatesTexture
          }
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('resize', handleResize)

        // Setup initial textures
        setupPixelsTexture()
        setupCoordinatesTexture()

        // Initialize with quantum state
        const result = sceneInitializers.quantum()
        const initialObjects = result instanceof Promise ? await result : result
        initialObjects.forEach(obj => scene.add(obj))

        animate()

        // Store for cleanup
        ;(window as any).threeCleanup = () => {
          window.removeEventListener('mousemove', handleMouseMove)
          window.removeEventListener('resize', handleResize)
        }
      },

      switchScene: switchScene,
      
      updatePixelZoom: (zoomLevel: number) => {
        updatePixelZoomInternal(zoomLevel)
      },

      cleanup: () => {
        if ((window as any).threeCleanup) {
          ;(window as any).threeCleanup()
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
          <div className="mt-4 text-xs text-gray-500 pointer-events-auto">
            <div>Index: {narrativeIndex} | Interacted: {hasInteracted.toString()}</div>
            <button 
              onClick={resetExperience}
              className="mt-2 px-3 py-1 bg-gray-800 text-white rounded text-xs hover:bg-gray-700"
            >
              Reset (R)
            </button>
          </div>
        </header>
        
        <footer className="text-center">
          <div 
            ref={narrativeRef}
            className="narrative-text max-w-2xl mx-auto text-gray-300"
            style={{ textShadow: '0 0 10px rgba(204, 204, 204, 0.3)' }}
          />
          
          {/* RGB Values Overlay - Step 1 and 2 */}
          {narrativeIndex === 1 && pixelZoomLevel < 0.4 && (
            <>
                             {/* Step 1: Show RGB values on 2 of 4 pixels */}
               {pixelZoomLevel < 0.2 && (
                 <>
                   {/* Top-left pixel (first pixel in 2x2 grid) */}
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-x-[-25%] translate-y-[-25%] font-mono text-[8px] text-gray-400 text-center leading-tight opacity-70 pointer-events-none">
                     <div className="text-shadow-sm">135,206,235</div>
                     <div className="text-gray-600 text-[6px]">[0,0]</div>
                   </div>
                   {/* Bottom-right pixel (last pixel in 2x2 grid) */}
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-x-[25%] translate-y-[25%] font-mono text-[8px] text-gray-400 text-center leading-tight opacity-70 pointer-events-none">
                     <div className="text-shadow-sm">255,255,0</div>
                     <div className="text-gray-600 text-[6px]">[1,1]</div>
                   </div>
                 </>
               )}
              
              {/* Step 2: Show RGB values on half the pixels (4x3 grid, show checkerboard pattern) */}
              {pixelZoomLevel >= 0.2 && pixelZoomLevel < 0.4 && (
                <>
                  {/* Top-left pixel (0,0) */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-x-[-37.5%] translate-y-[-33%] font-mono text-[6px] text-gray-500 text-center leading-tight opacity-60 pointer-events-none">
                    <div>135,206,235</div>
                    <div className="text-gray-600 text-[5px]">[0,0]</div>
                  </div>
                  {/* Top-right pixel (1,0) - skip for checkerboard */}
                  {/* Middle-left pixel (0,1) - skip for checkerboard */}
                  {/* Middle-right pixel (1,1) */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-x-[37.5%] translate-y-[0%] font-mono text-[6px] text-gray-500 text-center leading-tight opacity-60 pointer-events-none">
                    <div>255,255,0</div>
                    <div className="text-gray-600 text-[5px]">[1,1]</div>
                  </div>
                  {/* Bottom-left pixel (0,2) */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-x-[-37.5%] translate-y-[33%] font-mono text-[6px] text-gray-500 text-center leading-tight opacity-60 pointer-events-none">
                    <div>135,206,235</div>
                    <div className="text-gray-600 text-[5px]">[0,2]</div>
                  </div>
                  {/* Bottom-right pixel (1,2) - skip for checkerboard */}
                </>
              )}
            </>
          )}
          
          {/* General pixel info for other zoom levels */}
          {narrativeIndex === 1 && pixelZoomLevel >= 0.4 && pixelZoomLevel < 0.8 && (
            <div className="absolute top-8 left-8 font-mono text-xs text-gray-400 space-y-1">
              <div className="text-gray-500">Pixel grid view</div>
              <div className="text-gray-600 text-xs">Zoom: {Math.floor(pixelZoomLevel * 100)}%</div>
            </div>
          )}
          
          {/* Full image with description - only on extra scroll */}
          {narrativeIndex === 1 && pixelZoomLevel > 1.0 && (
            <div className="absolute top-8 right-8 max-w-sm">
              <div className="bg-black bg-opacity-60 p-3 rounded text-right">
                <h3 className="text-sm font-mono text-gray-400 mb-1">A Sunday Afternoon</h3>
                <p className="text-xs text-gray-500 leading-tight">
                  Seurat, 1886<br/>
                  Pointillism - dots of color<br/>
                  like pixels forming images
                </p>
              </div>
            </div>
          )}
          
          {/* Zoom progress indicator */}
          {narrativeIndex === 1 && pixelZoomLevel > 0 && pixelZoomLevel <= 1.0 && (
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {[0, 0.2, 0.4, 0.6, 0.8].map((threshold, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    pixelZoomLevel > threshold ? 'bg-white' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          )}
          
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
              {narrativeIndex === 1 && pixelZoomLevel <= 1.0 ? 
                `Scroll to zoom out (${Math.floor(pixelZoomLevel * 5) + 1}/5) | R to reset` : 
                narrativeIndex === 1 && pixelZoomLevel > 1.0 ? 
                'Scroll to continue to next phase | R to reset' :
                'Scroll or press Space/↓ to continue | R to reset'
              }
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
