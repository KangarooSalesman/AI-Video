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
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const threeAppRef = useRef<ThreeJSApp | null>(null)

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
      text: "Most of this space is visual static. Meaningful images are extremely rare islands in a vast sea of randomness.",
      state: 'noise'
    },
    {
      title: "A Search Through Static",
      text: "Locating these rare, structured images in a sea of randomness is beyond human chance. Our tools were limited to coordinates we found in the physical world.",
      state: 'time'
    },
    {
      title: "The Latent Compass",
      text: "Now, we have a new kind of compass. Artificial Intelligence learns the topography of this space, translating human intent into precise coordinates.",
      state: 'navigation'
    },
    {
      title: "Guided by Imagination",
      text: "We don't just wander; we direct. The AI acts as our guide, charting a course through the noise to the images we imagine.",
      state: 'sublime'
    },
    {
      title: "The Expansed Canvas",
      text: "This interface allows human language to act as the query language for the universe of all possible images, unlocking exploration across a previously unmappable visual expanse.",
      state: 'sublime'
    }
  ]

  // Simple advance function
  const advanceNarrative = () => {
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
      
      setTimeout(() => {
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
          threeAppRef.current.switchScene(currentState.state)
        }
        
        setIsTransitioning(false)
      }, 500)
    } else {
      setIsTransitioning(false)
    }
  }

  // Reset function
  const resetExperience = () => {
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
      threeAppRef.current.switchScene('quantum')
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
          advanceNarrative()
        }
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (!hasInteracted || e.deltaY <= 0) return
      
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

    // Add throttling to wheel
    let wheelTimeout: number | null = null
    const throttledWheel = (e: WheelEvent) => {
      if (wheelTimeout) return
      wheelTimeout = window.setTimeout(() => {
        handleWheel(e)
        wheelTimeout = null
      }, 300)
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
      threeApp.init()
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

    const switchScene = (state: string) => {
      console.log('Switching Three.js scene to:', state)
      if (animationState === state) return
      animationState = state
      while(scene.children.length > 0) scene.remove(scene.children[0])
      const objects = sceneInitializers[state]()
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

        // Mouse tracking for 3D rotation
        const handleMouseMove = (e: MouseEvent) => {
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1
          mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
        }

        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('resize', handleResize)

        // Initialize with quantum state
        const initialObjects = sceneInitializers.quantum()
        initialObjects.forEach(obj => scene.add(obj))

        animate()

        // Store for cleanup
        ;(window as any).threeCleanup = () => {
          window.removeEventListener('mousemove', handleMouseMove)
          window.removeEventListener('resize', handleResize)
        }
      },

      switchScene: switchScene,

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
              Scroll or press Space/↓ to continue | R to reset
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App