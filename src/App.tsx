import { useRef, useEffect, useState } from 'react'

interface ThreeJSApp {
  init: () => Promise<void>
  cleanup: () => void
  switchScene: (state: string) => Promise<void>
  updatePixelZoom: (zoomLevel: number) => void
  updateImageZoom: (zoomLevel: number) => void
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
  const [imageZoomLevel, setImageZoomLevel] = useState(1.0) // 1.0 = normal, higher = zoomed in
  
  const threeAppRef = useRef<ThreeJSApp | null>(null)

  // Debug zoom level changes
  useEffect(() => {
    console.log('Pixel zoom level changed to:', pixelZoomLevel)
  }, [pixelZoomLevel])

  const narrativeStates = [
    {
      title: "What is an Image?",
      text: "Is it something we create, or something we discover ?",
      state: 'quantum'
    },
    {
      title: "If We Look Closer, What Do We Find?",
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
      text: "More combinations than atoms in the universe. Yet finite. The photo you took this morning and the one your grandchild will take in 50 years both already exist as coordinates.",
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
      title: "The Latent Space",
      text: "Now, we have a new kind of compass. Artificial Intelligence learns the topography of this space, translating human intent into precise coordinates.",
      state: 'navigation'
    },
    {
      title: "Guided by Imagination",
      text: "We don't just wander. The AI acts as our guide, charting a course through the noise to the images we imagine.",
      state: 'sublime'
    },
    {
      title: "The Expanded Canvas",
      text: "This interface allows human language to act as the query language for the universe of all possible images 2) unlocking exploration across a previously uncharted visual expanse.",
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
    setImageZoomLevel(1.0)
    
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

      // Image zoom controls for pixels phase (start from 4/5 step, disabled on last slide 6/6)
      if (narrativeIndex === 1 && pixelZoomLevel >= 0.6 && pixelZoomLevel < 1.0) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault()
          const maxZoom = pixelZoomLevel >= 0.8 ? 128.0 : 32.0
          const newZoom = Math.min(imageZoomLevel * 2.0, maxZoom)
          setImageZoomLevel(newZoom)
          if (threeAppRef.current) {
            threeAppRef.current.updateImageZoom(newZoom)
          }
          return
        }
        if (e.key === '-' || e.key === '_') {
          e.preventDefault()
          const newZoom = Math.max(imageZoomLevel / 2.0, 1.0)
          setImageZoomLevel(newZoom)
          if (threeAppRef.current) {
            threeAppRef.current.updateImageZoom(newZoom)
          }
          return
        }
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
              
              if (currentZoom < 0.99) { // 5 steps total  
                const newZoomLevel = Math.min(1.0, currentZoom + 0.2) // 5 steps: (0, 0.2, 0.4, 0.6, 0.8, 1.0)
                console.log('Updating zoom level to:', newZoomLevel)
                
                // Update Three.js immediately with new value
                if (threeAppRef.current) {
                  threeAppRef.current.updatePixelZoom(newZoomLevel)
                }
                
                return newZoomLevel
              } else {
                // Only advance to next phase after the extra scroll
                console.log('Pixels zoom complete with full image shown, advancing to next phase')
                // Reset image zoom when advancing
                setImageZoomLevel(1.0)
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
              
              if (currentZoom < 0.99) { // 5 steps total
                const newZoomLevel = Math.min(1.0, currentZoom + 0.2) // 5 steps: (0, 0.2, 0.4, 0.6, 0.8, 1.0)
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

  // Dynamic narrative updates during pixel phase based on zoom step
  useEffect(() => {
    if (narrativeIndex !== 1 || !narrativeRef.current) return
    
    // const paintingTitle = 'A Sunday Afternoon on the Island of La Grande Jatte by Georges Seurat, 1886'
    const paintingParagraph = 'Long before computers, artists were manually navigating the space of all possible images. Each of Seurat’s dots functioned like an early pixel, long before screens existed.'
    const titleClass = "text-2xl md:text-3xl"

    let title = narrativeStates[1].title
    let text = narrativeStates[1].text

    if (pixelZoomLevel >= 0.2 && pixelZoomLevel < 0.4) {
      // Step 2/6: explain the first pixel with pure white text
      title = ''
      text = 'in the first pixel for example, we enter 119 of red, 136 of green, and 85 of blue, and we tell it that it\'s on the top left corner 0,0.'
    } else if (pixelZoomLevel >= 0.4 && pixelZoomLevel < 0.6) {
      // Step 3/6: add transition text
      title = ''
      text = 'Now let\'s move back a little...'
    } else     if (pixelZoomLevel >= 0.8 && pixelZoomLevel < 1.0) {
      // Step 5/6: show painting title at top (not in bottom narrative)
      title = ''
      text = ''
    } else if (pixelZoomLevel >= 1.0) {
      // Step 6/6: show only paragraph details (remove title)
      title = ''
      text = paintingParagraph
    }

    let content = ''
    if (title) {
      content += `<h2 class="${titleClass} font-bold text-white mb-3">${title}</h2>`
    }
    if (text) {
      content += `<p class="text-lg md:text-xl text-gray-300">${text}</p>`
    }

    narrativeRef.current.innerHTML = content
  }, [pixelZoomLevel, narrativeIndex])

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

    // Coordinate animation state
    let coordinateFadeStates: { [key: string]: { alpha: number, x: number, y: number, type: string, content?: string } } = {}
    let lastCoordinateUpdate = 0
    let lastScatteredUpdate = 0

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

      // Add initial coordinate data with more variety - less bright
      coordinatesCtx.fillStyle = '#cccccc'
      coordinatesCtx.font = '20px monospace'
      coordinatesCtx.textAlign = 'left'
      coordinatesCtx.fillText('Image Database: 256^3 = 16,777,216 possible colors', 20, 30)
      coordinatesCtx.fillText('Coordinates: (127, 89, 45), (255, 201, 156), (34, 67, 123)', 20, 60)
      coordinatesCtx.fillText('Position: [0,0] [1,0] [2,0] [0,1] [1,1] [2,1]...', 20, 90)
      coordinatesCtx.fillText('RGB Values: Red=0-255, Green=0-255, Blue=0-255', 20, 120)
      coordinatesCtx.fillText('Total Combinations: 16,777,216 × image_size', 20, 150)

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
        // First phase - keep it simple and empty for now
        // Just a subtle ambient presence
        const geometry = new window.THREE.SphereGeometry(0.1, 8, 8)
        const material = new window.THREE.MeshBasicMaterial({
          color: 0x444444,
          transparent: true,
          opacity: 0.3
        })
        const sphere = new window.THREE.Mesh(geometry, material)
        return [sphere]
      },

      'pixels': async () => {
        // Create a plane with correct aspect ratio for the image
        const aspectRatio = 1622 / 1080 // 1.5
        const height = 10
        const width = height * aspectRatio // 15
        const geometry = new window.THREE.PlaneGeometry(width, height)
        
        // Create image texture from our sample data
        const imageData = await loadExternalImage('/ζζ.jpg') // Seurat painting (1622x1080)
        
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
        
        // Create text overlay canvas for RGB values
        const textCanvas = document.createElement('canvas')
        textCanvas.width = window.innerWidth
        textCanvas.height = window.innerHeight
        const textCtx = textCanvas.getContext('2d')!
        const textTexture = new window.THREE.CanvasTexture(textCanvas)
        
        const material = new window.THREE.ShaderMaterial({
          uniforms: {
            uTexture: { value: texture },
            uTextTexture: { value: textTexture },
            uZoom: { value: 0.0 },
            uImageZoom: { value: 1.0 },
            uCenter: { value: new window.THREE.Vector2(0.5, 0.5) },
            uImageWidth: { value: imageData.width },
            uImageHeight: { value: imageData.height },
            uImageData: { value: imageData.data },
            uTime: { value: 0.0 },
            uShowText: { value: 0.0 }
          },
          vertexShader: `
            varying vec2 vUv;
            varying vec2 vScreenPos;
            void main() {
              vUv = uv;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_Position = projectionMatrix * mvPosition;
              vScreenPos = (gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
            }
          `,
          fragmentShader: `
            uniform sampler2D uTexture;
            uniform sampler2D uTextTexture;
            uniform float uZoom;
            uniform float uImageZoom;
            uniform vec2 uCenter;
            uniform float uImageWidth;
            uniform float uImageHeight;
            uniform float uShowText;
            varying vec2 vUv;
            varying vec2 vScreenPos;
            
            void main() {
              vec4 color;
              
              // Apply image zoom transformation
              vec2 zoomedUV = vUv;
              if (uImageZoom > 1.0) {
                // Zoom in by scaling UV coordinates around center
                vec2 center = vec2(0.5, 0.5);
                zoomedUV = center + (vUv - center) / uImageZoom;
                
                // Clamp to prevent sampling outside texture bounds
                zoomedUV = clamp(zoomedUV, 0.0, 1.0);
              }
              
              if (uZoom >= 1.0) {
                // Step 5: Show full resolution smooth image
                color = texture2D(uTexture, zoomedUV);
              } else {
                // Steps 1-4: Show pixelated version with specific resolutions
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
                vec2 pixelCoord = floor(zoomedUV * pixelCount);
                vec2 pixelUV = (pixelCoord + 0.5) / pixelCount;
                
                // Sample the texture at the pixel center
                color = texture2D(uTexture, pixelUV);

                // Add subtle grid lines to show pixel boundaries (only for pixelated steps, not full resolution)
                if (uZoom < 1.0) {
                  vec2 grid = abs(fract(zoomedUV * pixelCount) - 0.5);
                  float gridStrength = smoothstep(0.45, 0.5, max(grid.x, grid.y));
                  color.rgb = mix(color.rgb, vec3(0.2), gridStrength * 0.3);
                }
              }
              
              // Overlay text for RGB values when appropriate (only steps 1-2)
              if (uShowText > 0.5 && uZoom < 0.4) {
                vec4 textColor = texture2D(uTextTexture, vScreenPos);
                color.rgb = mix(color.rgb, textColor.rgb, textColor.a);
              }
              
              gl_FragColor = color;
            }
          `
        })
        
        pixelGroup = new window.THREE.Mesh(geometry, material)
        
        // Store references for text updates
        pixelGroup.userData = {
          textCanvas: textCanvas,
          textCtx: textCtx,
          textTexture: textTexture,
          imageData: imageData
        }
        
        return [pixelGroup]
      },

      'coordinates': () => {
        // Use same dimensions as the previous image (Seurat painting)
        const aspectRatio = 1622 / 1080 // Same as pixels phase
        const height = 10 // Same height as pixels phase
        const width = height * aspectRatio // Same width as pixels phase
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
        // Neural Network Particle System - Moved to Latent Compass phase
        const neuronCount = 350 // More particles for richer visualization
        const maxConnections = 6 // Slightly fewer connections per neuron for performance

        // Create neurons (particles)
        const neuronGeometry = new window.THREE.BufferGeometry()
        const neuronPositions = new Float32Array(neuronCount * 3)
        const neuronColors = new Float32Array(neuronCount * 3)

        // Create connection lines
        const connectionGeometry = new window.THREE.BufferGeometry()
        const maxConnectionLines = neuronCount * maxConnections
        const connectionPositions = new Float32Array(maxConnectionLines * 6) // 2 points per line * 3 coords
        const connectionColors = new Float32Array(maxConnectionLines * 6)

        // Initialize neurons in a 3D brain-like structure
        for (let i = 0; i < neuronCount; i++) {
          const i3 = i * 3

          // Create brain-like distribution (more dense in center, thinning at edges)
          const radius = Math.pow(Math.random(), 0.7) * 4 // Bias toward center
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)

          neuronPositions[i3] = radius * Math.sin(phi) * Math.cos(theta)
          neuronPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + Math.random() * 2 - 1
          neuronPositions[i3 + 2] = radius * Math.cos(phi)

          // Color neurons based on "activation level" (brighter blue-cyan gradient)
          const activation = Math.random()
          neuronColors[i3] = 0.1 + activation * 0.4     // R: dark blue to bright cyan
          neuronColors[i3 + 1] = 0.3 + activation * 0.7 // G: blue to bright cyan
          neuronColors[i3 + 2] = 0.8 + activation * 0.2 // B: bright blue to white
        }

        neuronGeometry.setAttribute('position', new window.THREE.BufferAttribute(neuronPositions, 3))
        neuronGeometry.setAttribute('color', new window.THREE.BufferAttribute(neuronColors, 3))

        const neuronMaterial = new window.THREE.PointsMaterial({
          size: 0.12,
          vertexColors: true,
          transparent: true,
          opacity: 1.0,
          blending: window.THREE.AdditiveBlending
        })

        const neurons = new window.THREE.Points(neuronGeometry, neuronMaterial)

        // Create connection lines geometry
        connectionGeometry.setAttribute('position', new window.THREE.BufferAttribute(connectionPositions, 3))
        connectionGeometry.setAttribute('color', new window.THREE.BufferAttribute(connectionColors, 3))

        const connectionMaterial = new window.THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          blending: window.THREE.AdditiveBlending,
          linewidth: 2
        })

        const connections = new window.THREE.LineSegments(connectionGeometry, connectionMaterial)

        // Store neural network state
        neurons.userData = {
          neuronPositions,
          neuronColors,
          connections: [] as Array<{from: number, to: number, strength: number, firing: boolean}>,
          firingQueue: [] as Array<{neuron: number, timestamp: number}>,
          lastUpdate: 0,
          signalSpeed: 0.02,
          baseConnectionDistance: 3.2
        }

        // Initialize random connections between nearby neurons
        const initConnections = () => {
          const connections = []
          for (let i = 0; i < neuronCount; i++) {
            const connectionsForThisNeuron = Math.floor(Math.random() * maxConnections) + 1

            for (let c = 0; c < connectionsForThisNeuron; c++) {
              // Find a nearby neuron to connect to
              let targetNeuron = i
              let attempts = 0
              while (targetNeuron === i && attempts < 10) {
                targetNeuron = Math.floor(Math.random() * neuronCount)
                attempts++
              }

              if (targetNeuron !== i) {
                connections.push({
                  from: i,
                  to: targetNeuron,
                  strength: Math.random() * 0.8 + 0.2,
                  firing: false
                })
              }
            }
          }
          return connections
        }

        neurons.userData.connections = initConnections()

        return [neurons, connections]
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
      
      // Update text overlay based on zoom level (always update to ensure step 1 appears)
      if (pixelGroup.userData && pixelGroup.userData.textCtx) {
        updatePixelTextOverlay(zoomLevel)
      }
      
      // Control when instructional text is shown. For the first single pixel, render text after the pixel appears.
      if (pixelGroup.material.uniforms && pixelGroup.material.uniforms.uShowText) {
        if (zoomLevel >= 0.4) {
          // Hide text beyond the first two zoom levels
          pixelGroup.material.uniforms.uShowText.value = 0.0
          if (pixelGroup.userData) pixelGroup.userData.hasScheduledTextReveal = false
        } else if (zoomLevel < 0.2) {
          // Step 1: delay showing text by one frame
          pixelGroup.material.uniforms.uShowText.value = 0.0
          if (pixelGroup.userData && !pixelGroup.userData.hasScheduledTextReveal) {
            pixelGroup.userData.hasScheduledTextReveal = true
            requestAnimationFrame(() => {
              if (pixelGroup && pixelGroup.material && pixelGroup.material.uniforms) {
                pixelGroup.material.uniforms.uShowText.value = 1.0
              }
            })
          }
        } else {
          // Step 2: show text immediately
          pixelGroup.material.uniforms.uShowText.value = 1.0
          if (pixelGroup.userData) pixelGroup.userData.hasScheduledTextReveal = false
        }
      }
      
      // Keep camera at consistent distance to maintain same viewport size
      // The shader handles the pixel density, not the camera distance
      camera.position.z = 10
    }

    const updateImageZoomInternal = (zoomLevel: number) => {
      if (!pixelGroup || !pixelGroup.material) return
      
      // Update shader uniform for image zoom level
      pixelGroup.material.uniforms.uImageZoom.value = zoomLevel
      
      // Update text overlay to show individual pixel values when zoomed in
      if (pixelGroup.userData && pixelGroup.userData.textCtx) {
        updateZoomedPixelTextOverlay(zoomLevel)
      }
    }

    const updatePixelTextOverlay = (zoomLevel: number) => {
      const { textCtx, textTexture, imageData } = pixelGroup.userData
      
      // Clear canvas
      textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height)
      
      // Show text only for first two zoom levels (1 pixel and 4x3 pixels)
      if (zoomLevel >= 0.4) {
        textTexture.needsUpdate = true
        return
      }
      
      // Get the pixel grid dimensions
      let pixelCountX, pixelCountY
      if (zoomLevel < 0.2) {
        // Step 1: 1x1 pixel
        pixelCountX = 1
        pixelCountY = 1
      } else if (zoomLevel < 0.4) {
        // Step 2: 4x3 pixels
        pixelCountX = 4
        pixelCountY = 3
      } else {
        // Step 3 and beyond hidden here (handled by high-zoom overlay)
        pixelCountX = 10
        pixelCountY = 10
      }
      
      // Calculate screen dimensions and pixel positions
      const canvasWidth = textCtx.canvas.width
      const canvasHeight = textCtx.canvas.height
      
      // Calculate the size and position of the image plane on screen
      const aspectRatio = 1622 / 1080
      const planeHeight = 10
      const planeWidth = planeHeight * aspectRatio
      
      // Estimate screen projection (approximate)
      const fov = 75 * Math.PI / 180
      const distance = 10
      const screenHeight = 2 * Math.tan(fov / 2) * distance
      const screenWidth = screenHeight * (canvasWidth / canvasHeight)
      
      // Calculate pixel size on screen
      const pixelScreenWidth = (planeWidth / pixelCountX) * (canvasWidth / screenWidth)
      const pixelScreenHeight = (planeHeight / pixelCountY) * (canvasHeight / screenHeight)
      
      // Calculate starting position (center the grid)
      const startX = (canvasWidth - pixelCountX * pixelScreenWidth) / 2
      const startY = (canvasHeight - pixelCountY * pixelScreenHeight) / 2
      
      // Set up text styling based on zoom level
      let fontSize
      if (zoomLevel < 0.2) {
        // For single pixel, use larger, more readable text
        fontSize = Math.max(24, Math.min(48, pixelScreenWidth / 6, pixelScreenHeight / 8))
      } else if (zoomLevel < 0.4) {
        // For 4x3 grid, medium text
        fontSize = Math.min(pixelScreenWidth / 6, pixelScreenHeight / 3, 20)
      } else {
        // For 10x10 grid, small text
        fontSize = Math.min(pixelScreenWidth / 8, pixelScreenHeight / 4, 12)
      }
      
      textCtx.font = `${fontSize}px monospace`
      textCtx.textAlign = 'center'
      textCtx.textBaseline = 'middle'
      textCtx.fillStyle = 'rgba(255, 255, 255, 1.0)'
      textCtx.strokeStyle = 'rgba(0, 0, 0, 1.0)'
      textCtx.lineWidth = Math.max(1, fontSize / 12)
      
      console.log(`Drawing text overlay for zoom level ${zoomLevel}, grid ${pixelCountX}x${pixelCountY}, fontSize: ${fontSize}`)
      
      // Draw RGB values for each visible pixel
      for (let y = 0; y < pixelCountY; y++) {
        for (let x = 0; x < pixelCountX; x++) {
          // Calculate the center position of this pixel on screen
          const centerX = startX + (x + 0.5) * pixelScreenWidth
          const centerY = startY + (y + 0.5) * pixelScreenHeight
          
          // Get the corresponding pixel from the image data
          const imageX = Math.floor((x + 0.5) / pixelCountX * imageData.width)
          const imageY = Math.floor((y + 0.5) / pixelCountY * imageData.height)
          const pixelIndex = (imageY * imageData.width + imageX) * 3
          
          const r = imageData.data[pixelIndex] || 0
          const g = imageData.data[pixelIndex + 1] || 0
          const b = imageData.data[pixelIndex + 2] || 0
          
          // For the first pixel (1x1), show detailed explanation
          if (zoomLevel < 0.2) {
            const line1 = `Red: ${r} (0-255)`
            const line2 = `Green: ${g} (0-255)`
            const line3 = `Blue: ${b} (0-255)`
            const line4 = `Position: [${x}, ${y}]`
            const line5 = `Each pixel = Color + Location`
            
            const lineHeight = fontSize * 0.8
            const startOffset = -2 * lineHeight
            
            const lines = [line1, line2, line3, line4, line5]
            lines.forEach((line: string, i: number) => {
              const yPos = centerY + startOffset + (i * lineHeight)
              textCtx.strokeText(line, centerX, yPos)
              textCtx.fillText(line, centerX, yPos)
            })
                    } else {
            // For other zoom levels, show RGB and position (skip last row)
            if (y < pixelCountY - 1) {
              const rgbText = `${r},${g},${b}`
              const posText = `[${x},${y}]`

              textCtx.strokeText(rgbText, centerX, centerY - fontSize * 0.4)
              textCtx.fillText(rgbText, centerX, centerY - fontSize * 0.4)
              textCtx.strokeText(posText, centerX, centerY + fontSize * 0.4)
              textCtx.fillText(posText, centerX, centerY + fontSize * 0.4)
            }
          }
        }
      }
      
      textTexture.needsUpdate = true
    }

    const updateZoomedPixelTextOverlay = (imageZoomLevel: number) => {
      const { textCtx, textTexture, imageData } = pixelGroup.userData
      
      // Clear canvas
      textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height)
      
      // Only show zoomed pixel text when image is zoomed in significantly
      if (imageZoomLevel < 2.0) {
        textTexture.needsUpdate = true
        return
      }
      
      // No blur-in animation; show values immediately once >= 2x
      textCtx.save()
      textCtx.globalAlpha = 1
      textCtx.shadowColor = 'rgba(0,0,0,0.9)'
      textCtx.shadowBlur = 0

      // Calculate visible pixel grid based on zoom level
      const canvasWidth = textCtx.canvas.width
      const canvasHeight = textCtx.canvas.height
      
      // Estimate how many pixels are visible at this zoom level
      const pixelsPerScreenWidth = Math.floor(imageData.width / imageZoomLevel)
      const pixelsPerScreenHeight = Math.floor(imageData.height / imageZoomLevel)
      
      // Limit to reasonable numbers for performance
      const maxPixels = 20
      const visiblePixelsX = Math.min(pixelsPerScreenWidth, maxPixels)
      const visiblePixelsY = Math.min(pixelsPerScreenHeight, maxPixels)
      
      if (visiblePixelsX <= 0 || visiblePixelsY <= 0) return
      
      // Calculate pixel size on screen
      const pixelScreenWidth = canvasWidth / visiblePixelsX
      const pixelScreenHeight = canvasHeight / visiblePixelsY
      
      // Set up text styling
      const fontSize = Math.min(pixelScreenWidth / 8, pixelScreenHeight / 4, 16)
      textCtx.font = `${fontSize}px monospace`
      textCtx.textAlign = 'center'
      textCtx.textBaseline = 'middle'
      textCtx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      textCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)'
      textCtx.lineWidth = Math.max(1, fontSize / 10)
      
      // Calculate the center position of the zoomed area
      const centerImageX = imageData.width / 2
      const centerImageY = imageData.height / 2
      
      // Draw RGB values for visible pixels
      for (let y = 0; y < visiblePixelsY; y++) {
        for (let x = 0; x < visiblePixelsX; x++) {
          // Calculate screen position
          const screenX = (x + 0.5) * pixelScreenWidth
          const screenY = (y + 0.5) * pixelScreenHeight
          
          // Calculate corresponding image pixel
          const imageX = Math.floor(centerImageX + (x - visiblePixelsX/2))
          const imageY = Math.floor(centerImageY + (y - visiblePixelsY/2))
          
          // Ensure we're within image bounds
          if (imageX >= 0 && imageX < imageData.width && imageY >= 0 && imageY < imageData.height) {
            const pixelIndex = (imageY * imageData.width + imageX) * 3
            const r = imageData.data[pixelIndex] || 0
            const g = imageData.data[pixelIndex + 1] || 0
            const b = imageData.data[pixelIndex + 2] || 0
            
            // Draw RGB and position values
            textCtx.strokeText(`${r},${g},${b}`, screenX, screenY - fontSize * 0.35)
            textCtx.fillText(`${r},${g},${b}`, screenX, screenY - fontSize * 0.35)
            textCtx.strokeText(`[${imageX},${imageY}]`, screenX, screenY + fontSize * 0.35)
            textCtx.fillText(`[${imageX},${imageY}]`, screenX, screenY + fontSize * 0.35)
          }
        }
      }
      
      textCtx.restore()
      textTexture.needsUpdate = true
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
          // First phase - simple subtle animation
          if (objects[0]) {
            const sphere = objects[0]
            const time = Date.now() * 0.001
            // Subtle breathing effect
            const scale = 1 + Math.sin(time * 1.5) * 0.05
            sphere.scale.setScalar(scale)
            // Gentle rotation
            sphere.rotation.y += 0.001
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
          if (coordinatesCtx) {
            const currentTime = Date.now()

            // Faster scattered elements with fade-ins
            if (Math.random() > 0.4 || currentTime - lastScatteredUpdate > 200) {
              lastScatteredUpdate = currentTime
              const x = Math.floor(Math.random() * columns)
              const y = Math.floor(Math.random() * rows)
              const types = ['number', 'symbol', 'mini_coord', 'hex_value']
              const type = types[Math.floor(Math.random() * types.length)]
              const key = `${x}_${y}_${currentTime}`

              let content = ''
              // let fontSizeToUse = '20px'

              if (type === 'number') {
                content = chars[Math.floor(Math.random() * chars.length)]
              } else if (type === 'symbol') {
                const symbols = ['[', ']', '(', ')', ',', '.', ':', ';', '+', '-', '*', '/', '=', '<', '>', '{', '}', '|', '&', '%', '#', '@', '!', '?']
                content = symbols[Math.floor(Math.random() * symbols.length)]
              } else if (type === 'mini_coord') {
                content = `(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`
                // fontSizeToUse = '14px'
              } else if (type === 'hex_value') {
                content = Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
                // fontSizeToUse = '16px'
              }

              coordinateFadeStates[key] = {
                alpha: 0.0,
                x: x,
                y: y,
                type: type,
                content: content
              }
            }

            // Update all fading elements - faster fade-in
            Object.keys(coordinateFadeStates).forEach(key => {
              const state = coordinateFadeStates[key]

              // Faster fade-in
              state.alpha += 0.08
              if (state.alpha >= 1.0) {
                state.alpha = 1.0
              }

              // Clear and redraw
              coordinatesCtx.fillStyle = '#000000'
              coordinatesCtx.fillRect(state.x * fontSize, state.y * fontSize - fontSize, fontSize * 3, fontSize * 2)

              // Draw with alpha
              coordinatesCtx.save()
              coordinatesCtx.globalAlpha = state.alpha

              coordinatesCtx.fillStyle = '#ffffff'
              coordinatesCtx.font = `${state.type === 'mini_coord' ? '14px' : state.type === 'hex_value' ? '16px' : '20px'} monospace`

              if (state.content) {
                coordinatesCtx.fillText(state.content, state.x * fontSize, state.y * fontSize)
              }

              coordinatesCtx.restore()

              // Remove after full visibility for a bit
              if (state.alpha >= 1.0 && Math.random() > 0.98) {
                delete coordinateFadeStates[key]
              }
            })

            // Scatter main coordinate information around the screen - more detailed and larger
            if (currentTime - lastCoordinateUpdate > 3000) {
              lastCoordinateUpdate = currentTime

              // Choose random position on screen with larger regions
              const screenRegions = [
                { x: 20, y: 80, width: 550, height: 150 },     // Top left - larger
                { x: window.innerWidth - 570, y: 80, width: 550, height: 150 },     // Top right - larger
                { x: 20, y: window.innerHeight - 200, width: 550, height: 150 },    // Bottom left - larger
                { x: window.innerWidth - 570, y: window.innerHeight - 200, width: 550, height: 150 }, // Bottom right - larger
                { x: window.innerWidth / 2 - 275, y: window.innerHeight / 2 - 75, width: 550, height: 150 } // Center - larger
              ]

              const region = screenRegions[Math.floor(Math.random() * screenRegions.length)]

              // Clear larger area
              coordinatesCtx.fillStyle = '#000000'
              coordinatesCtx.fillRect(region.x - 15, region.y - 40, region.width + 30, region.height + 20)

              // Draw more detailed coordinate information
              coordinatesCtx.fillStyle = '#ffffff'
              coordinatesCtx.font = '20px monospace'
              coordinatesCtx.textAlign = 'left'

              // Generate RGB values for this block
              const r = Math.floor(Math.random() * 256)
              const g = Math.floor(Math.random() * 256)
              const b = Math.floor(Math.random() * 256)
              const rgbColor = `rgb(${r}, ${g}, ${b})`

              const detailedVariations = [
                {
                  title: `RGB Color Display`,
                  main: `RGB(${r}, ${g}, ${b})`,
                  detail1: `Position: [${Math.floor(Math.random() * 1920)}, ${Math.floor(Math.random() * 1080)}]`,
                  detail2: `Hex: #${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`,
                  showColorTile: true,
                  colorTileRGB: rgbColor
                },
                {
                  title: `Pixel Coordinate System`,
                  main: `Position: [${Math.floor(Math.random() * 1920)}, ${Math.floor(Math.random() * 1080)}]`,
                  detail1: `RGB Values: (${r}, ${g}, ${b})`,
                  detail2: `Hex Color: #${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`,
                  showColorTile: true,
                  colorTileRGB: rgbColor
                },
                {
                  title: `Color Space Mathematics`,
                  main: `HSV: (${Math.floor(Math.random() * 360)}°, ${Math.floor(Math.random() * 100)}%, ${Math.floor(Math.random() * 100)}%)`,
                  detail1: `RGB Equivalent: (${r}, ${g}, ${b})`,
                  detail2: `Color Theory: Hue × Saturation × Brightness`,
                  showColorTile: true,
                  colorTileRGB: rgbColor
                },
                {
                  title: `Digital Color Spectrum`,
                  main: `RGB(${r}, ${g}, ${b}) - 24-bit Color`,
                  detail1: `Red Channel: ${r}/255 (${Math.round(r/255*100)}%)`,
                  detail2: `Green: ${g}/255 (${Math.round(g/255*100)}%), Blue: ${b}/255 (${Math.round(b/255*100)}%)`,
                  showColorTile: true,
                  colorTileRGB: rgbColor
                },
                {
                  title: `Image Pixel Data`,
                  main: `Pixel at [${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}]`,
                  detail1: `RGB Values: (${r}, ${g}, ${b})`,
                  detail2: `Brightness: ${Math.round((r + g + b) / 3)}/255`,
                  showColorTile: true,
                  colorTileRGB: rgbColor
                },
                {
                  title: `Coordinate Mapping`,
                  main: `Screen Position: (${Math.floor(Math.random() * window.innerWidth)}, ${Math.floor(Math.random() * window.innerHeight)})`,
                  detail1: `RGB Color: (${r}, ${g}, ${b})`,
                  detail2: `Normalized: (${(Math.random()).toFixed(3)}, ${(Math.random()).toFixed(3)})`,
                  showColorTile: true,
                  colorTileRGB: rgbColor
                },
                {
                  title: `Binary Color Values`,
                  main: `Decimal: ${r * 65536 + g * 256 + b}`,
                  detail1: `RGB: (${r}, ${g}, ${b})`,
                  detail2: `Binary: ${r.toString(2).padStart(8,'0')} ${g.toString(2).padStart(8,'0')} ${b.toString(2).padStart(8,'0')}`,
                  showColorTile: true,
                  colorTileRGB: rgbColor
                },
                {
                  title: `Color Intensity Analysis`,
                  main: `RGB(${r}, ${g}, ${b})`,
                  detail1: `Max Channel: ${Math.max(r, g, b)}, Min Channel: ${Math.min(r, g, b)}`,
                  detail2: `Color Temperature: ${r > g && r > b ? 'Warm' : g > r && g > b ? 'Natural' : 'Cool'}`,
                  showColorTile: true,
                  colorTileRGB: rgbColor
                },
                {
                  title: `Digital Image Data`,
                  main: `Resolution: ${800 + Math.floor(Math.random() * 1280)} × ${600 + Math.floor(Math.random() * 720)} pixels`,
                  detail1: `Sample RGB: (${r}, ${g}, ${b})`,
                  detail2: `Data Size: ${Math.floor(Math.random() * 10)} MB uncompressed`,
                  showColorTile: false
                },
                {
                  title: `Image Mathematics`,
                  main: `Color Depth: 24-bit RGB (${Math.pow(2, 24)} colors)`,
                  detail1: `Pixel Neighbors: ±${Math.floor(Math.random() * 50)} RGB variation`,
                  detail2: `Gradient Magnitude: ${Math.floor(Math.random() * 255)} intensity units`,
                  showColorTile: false
                }
              ]

              const selectedInfo = detailedVariations[Math.floor(Math.random() * detailedVariations.length)]

              // Draw title
              coordinatesCtx.fillStyle = '#ffffff'
              coordinatesCtx.font = '22px monospace'
              coordinatesCtx.fillText(selectedInfo.title, region.x, region.y)

              // Draw main info
              coordinatesCtx.fillStyle = '#cccccc'
              coordinatesCtx.font = '18px monospace'
              coordinatesCtx.fillText(selectedInfo.main, region.x, region.y + 35)

              // Draw color tile with glow effect if enabled
              if (selectedInfo.showColorTile) {
                const tileX = region.x + region.width - 80
                const tileY = region.y + 10
                const tileSize = 60

                // Draw glow effect (multiple rectangles with decreasing opacity)
                coordinatesCtx.save()
                const tileColor = selectedInfo.colorTileRGB || '#ffffff'
                for (let i = 5; i >= 0; i--) {
                  coordinatesCtx.fillStyle = tileColor.replace('rgb', 'rgba').replace(')', `, ${0.1 - i * 0.015})`)
                  coordinatesCtx.fillRect(tileX - i * 2, tileY - i * 2, tileSize + i * 4, tileSize + i * 4)
                }

                // Draw main color tile
                coordinatesCtx.fillStyle = tileColor
                coordinatesCtx.fillRect(tileX, tileY, tileSize, tileSize)

                // Draw border
                coordinatesCtx.strokeStyle = '#ffffff'
                coordinatesCtx.lineWidth = 2
                coordinatesCtx.strokeRect(tileX, tileY, tileSize, tileSize)

                // Add TV-like scanlines effect
                coordinatesCtx.fillStyle = 'rgba(255, 255, 255, 0.1)'
                for (let y = tileY; y < tileY + tileSize; y += 3) {
                  coordinatesCtx.fillRect(tileX, y, tileSize, 1)
                }

                coordinatesCtx.restore()
              }

              // Draw detail lines
              coordinatesCtx.fillStyle = '#aaaaaa'
              coordinatesCtx.font = '16px monospace'
              coordinatesCtx.fillText(selectedInfo.detail1, region.x, region.y + 65)
              coordinatesCtx.fillText(selectedInfo.detail2, region.x, region.y + 90)

              // Add more context sometimes
              if (Math.random() > 0.6) {
                coordinatesCtx.fillStyle = '#888888'
                coordinatesCtx.font = '14px monospace'

                const contextInfo = [
                  'Every pixel = unique coordinate in 16.7 million color space',
                  'Image as mathematical function: f(x,y) → (r,g,b)',
                  'Digital representation of infinite analog possibilities',
                  'Coordinates map to exact color values in RGB space',
                  'Each position contains complete color information',
                  'Screen coordinate system: (0,0) to (width,height)',
                  'Color values range: 0-255 per channel (8-bit)',
                  'Total possible images: 256^(width×height×3)'
                ]

                coordinatesCtx.fillText(contextInfo[Math.floor(Math.random() * contextInfo.length)], region.x, region.y + 120)
              }
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
          // Neural Network animation - moved from quantum phase
          if (objects[0] && objects[1]) {
            const neurons = objects[0]
            const connections = objects[1]
            const userData = neurons.userData
            const time = Date.now() * 0.001
            const neuronPositions = userData.neuronPositions
            const neuronColors = userData.neuronColors

            // Update neural activity every 100ms for performance
            if (time - userData.lastUpdate > 0.1) {
              userData.lastUpdate = time

              // Randomly trigger neuron firings (increased frequency for more activity)
              if (Math.random() > 0.7) { // 30% chance per update for more activity
                const randomNeuron = Math.floor(Math.random() * (neuronPositions.length / 3))
                userData.firingQueue.push({
                  neuron: randomNeuron,
                  timestamp: time
                })
              }

              // Process firing queue
              userData.firingQueue = userData.firingQueue.filter((fire: {neuron: number, timestamp: number}) => {
                const elapsed = time - fire.timestamp

                if (elapsed < 0.3) { // Signal lasts 300ms
                  // Brighten firing neuron (white hot)
                  const i3 = fire.neuron * 3
                  neuronColors[i3] = 1.0     // Full red
                  neuronColors[i3 + 1] = 1.0 // Full green
                  neuronColors[i3 + 2] = 1.0 // Full blue (white)

                  // Propagate to connected neurons
                  userData.connections.forEach((conn: {from: number, to: number, strength: number, firing: boolean}) => {
                    if (conn.from === fire.neuron) {
                      const targetI3 = conn.to * 3
                      const intensity = Math.max(0, 1 - elapsed / 0.3)
                      neuronColors[targetI3] = Math.min(1.0, neuronColors[targetI3] + intensity * 0.5)
                      neuronColors[targetI3 + 1] = Math.min(1.0, neuronColors[targetI3 + 1] + intensity * 0.3)
                      neuronColors[targetI3 + 2] = Math.min(1.0, neuronColors[targetI3 + 2] + intensity * 0.2)
                    }
                  })

                  return true // Keep in queue
                } else {
                  // Reset neuron color to resting state (brighter)
                  const i3 = fire.neuron * 3
                  const restingActivation = Math.random()
                  neuronColors[i3] = 0.1 + restingActivation * 0.4
                  neuronColors[i3 + 1] = 0.3 + restingActivation * 0.7
                  neuronColors[i3 + 2] = 0.8 + restingActivation * 0.2
                  return false // Remove from queue
                }
              })
            }

            // Update connection lines
            const connectionPositions = connections.geometry.attributes.position.array
            const connectionColors = connections.geometry.attributes.color.array
            let connectionIndex = 0

            userData.connections.forEach((conn: {from: number, to: number, strength: number, firing: boolean}) => {
              const fromPos = [
                neuronPositions[conn.from * 3],
                neuronPositions[conn.from * 3 + 1],
                neuronPositions[conn.from * 3 + 2]
              ]
              const toPos = [
                neuronPositions[conn.to * 3],
                neuronPositions[conn.to * 3 + 1],
                neuronPositions[conn.to * 3 + 2]
              ]

              // Calculate distance for connection strength
              const distance = Math.sqrt(
                Math.pow(fromPos[0] - toPos[0], 2) +
                Math.pow(fromPos[1] - toPos[1], 2) +
                Math.pow(fromPos[2] - toPos[2], 2)
              )

              // Only show connections within range and with some probability
              if (distance < userData.baseConnectionDistance && Math.random() > 0.4) {
                // Set line positions (from -> to)
                connectionPositions[connectionIndex] = fromPos[0]
                connectionPositions[connectionIndex + 1] = fromPos[1]
                connectionPositions[connectionIndex + 2] = fromPos[2]
                connectionPositions[connectionIndex + 3] = toPos[0]
                connectionPositions[connectionIndex + 4] = toPos[1]
                connectionPositions[connectionIndex + 5] = toPos[2]

                // Set line colors based on connection strength and activity
                const baseOpacity = conn.strength * (1 - distance / userData.baseConnectionDistance)
                const isActive = userData.firingQueue.some((f: {neuron: number, timestamp: number}) => f.neuron === conn.from || f.neuron === conn.to)

                if (isActive) {
                  // Bright active connection (electric cyan)
                  connectionColors[connectionIndex] = 0.2
                  connectionColors[connectionIndex + 1] = 1.0
                  connectionColors[connectionIndex + 2] = 1.0
                  connectionColors[connectionIndex + 3] = 0.2
                  connectionColors[connectionIndex + 4] = 1.0
                  connectionColors[connectionIndex + 5] = 1.0
                } else {
                  // More visible inactive connection (bright blue-white)
                  const brightness = Math.max(0.3, baseOpacity * 1.2)
                  connectionColors[connectionIndex] = 0.3 * brightness
                  connectionColors[connectionIndex + 1] = 0.6 * brightness
                  connectionColors[connectionIndex + 2] = 0.9 * brightness
                  connectionColors[connectionIndex + 3] = 0.3 * brightness
                  connectionColors[connectionIndex + 4] = 0.6 * brightness
                  connectionColors[connectionIndex + 5] = 0.9 * brightness
                }

                connectionIndex += 6
              }
            })

            // Clear remaining connection slots
            for (let i = connectionIndex; i < connectionPositions.length; i++) {
              connectionPositions[i] = 0
              connectionColors[i] = 0
            }

            // More vibrant brain-like pulsing
            const pulse = Math.sin(time * 2) * 0.15 + 0.9
            neurons.material.opacity = 1.0 * pulse
            connections.material.opacity = 0.8 * pulse

            // Gentle rotation
            neurons.rotation.y += 0.0002
            connections.rotation.y += 0.0002

            // Mark geometries for update
            neurons.geometry.attributes.color.needsUpdate = true
            connections.geometry.attributes.position.needsUpdate = true
            connections.geometry.attributes.color.needsUpdate = true
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

      updateImageZoom: (zoomLevel: number) => {
        updateImageZoomInternal(zoomLevel)
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

          {/* Painting title overlay for steps 5/6 */}
          {narrativeIndex === 1 && pixelZoomLevel >= 0.8 && pixelZoomLevel <= 1.0 && (
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center z-30">
              <div className="text-sm font-normal text-white/60 tracking-normal">
                A Sunday Afternoon on the Island of La Grande Jatte
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Georges Seurat, 1886
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Seurat painted this artwork by placing thousands of individual dots of pure color
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Each dot blends optically in the viewer's eye to create the final image
              </div>
            </div>
          )}
        </header>
        
        <footer className="text-center">
          <div 
            ref={narrativeRef}
            className={`narrative-text max-w-2xl mx-auto text-gray-300 transition-opacity duration-500 ${narrativeIndex === 1 && pixelZoomLevel >= 0.6 && pixelZoomLevel < 0.8 ? 'opacity-0' : 'opacity-100'}`}
            style={{ textShadow: '0 0 10px rgba(204, 204, 204, 0.3)' }}
          />
          

          
          {/* General pixel info for other zoom levels (starts at 4/5) */}
          {narrativeIndex === 1 && pixelZoomLevel >= 0.6 && pixelZoomLevel < 0.8 && (
            <div className="absolute top-8 left-8 font-mono text-xs text-gray-400 space-y-1">
              <div className="text-gray-500">Pixel grid view</div>
              <div className="text-gray-600 text-xs">Zoom: {Math.floor(pixelZoomLevel * 100)}%</div>
            </div>
          )}
          
          {/* Zoom controls appear where old narrative titles were - center bottom */}
          {narrativeIndex === 1 && pixelZoomLevel >= 0.6 && pixelZoomLevel < 1.0 && (
            <div className="text-center pointer-events-auto mb-8">
              <div className="text-sm font-normal text-white/80 tracking-normal mb-3">
                Zoom in to see individual pixels
              </div>
              <div className="flex justify-center space-x-3 mb-2">
                <button
                  onClick={() => {
                    const maxZoom = pixelZoomLevel >= 0.8 ? 128.0 : 32.0
                    const newZoom = Math.min(imageZoomLevel * 2.0, maxZoom)
                    setImageZoomLevel(newZoom)
                    if (threeAppRef.current) {
                      threeAppRef.current.updateImageZoom(newZoom)
                    }
                  }}
                  className="px-4 py-1 bg-white/10 text-white/90 rounded text-sm hover:bg-white/20 transition-colors border border-white/20"
                >
                  +
                </button>
                <button
                  onClick={() => {
                    const newZoom = Math.max(imageZoomLevel / 2.0, 1.0)
                    setImageZoomLevel(newZoom)
                    if (threeAppRef.current) {
                      threeAppRef.current.updateImageZoom(newZoom)
                    }
                  }}
                  className="px-4 py-1 bg-white/10 text-white/90 rounded text-sm hover:bg-white/20 transition-colors border border-white/20"
                >
                  −
                </button>
              </div>
              <div className="text-xs text-white/60">
                {imageZoomLevel.toFixed(1)}x
              </div>
            </div>
          )}
          
          {/* Zoom progress indicator (6 steps including image load) */}
          {narrativeIndex === 1 && pixelZoomLevel > 0 && pixelZoomLevel <= 1.0 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    pixelZoomLevel >= threshold ? 'bg-white' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Simplified: rely on shader-driven text for step 1; remove extra overlay */}

          {/* Painting caption now appears in the main narrative area; removed bottom-left overlay */}
          
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
              {narrativeIndex === 1 && pixelZoomLevel < 1.0 ? 
                `Scroll to zoom (${Math.floor(pixelZoomLevel * 5) + 1}/6) | R to reset` : 
                narrativeIndex === 1 && pixelZoomLevel >= 1.0 ? 
                'Scroll to continue (6/6) | R to reset' :
                narrativeIndex === 1 && pixelZoomLevel >= 0.6 ?
                'Use +/- or click buttons to zoom image (2x steps, up to 32x/64x) | Scroll to continue | R to reset' :
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
