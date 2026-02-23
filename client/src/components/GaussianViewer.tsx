import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface GaussianViewerProps {
  modelUrl: string;
  modelType?: "ply" | "glb" | "gltf";
  className?: string;
}

export default function GaussianViewer({
  modelUrl,
  modelType = "ply",
  className,
}: GaussianViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<{ dispose: () => void } | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [renderQuality, setRenderQuality] = useState(0.05); // Start at 5% quality for dramatic reveal

  useEffect(() => {
    if (!containerRef.current || !modelUrl) return;


    let disposed = false;
    let animationFrameId: number;

    const initViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setLoadProgress(0);

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        if (modelType === "ply") {
          await initGaussianSplatViewer();
        } else if (modelType === "glb" || modelType === "gltf") {
          await initMeshViewer();
        }
      } catch (err) {
        if (!disposed) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          setError(`Failed to load 3D scene: ${errorMsg}`);
          setIsLoading(false);
        }
      }
    };

    const initGaussianSplatViewer = async () => {
      try {
        const GaussianSplats3D = await import("@mkkellogg/gaussian-splats-3d");

        if (disposed || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;


        // Create renderer - IMMERSIVE MODE (like Marble)
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: false,
          logarithmicDepthBuffer: true,  // Better depth precision
          powerPreference: "high-performance",  // Use dedicated GPU
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // IMMERSIVE BACKGROUND - subtle gradient for depth perception
        renderer.setClearColor(0x1a1a2e, 1); // Dark blue-grey (not pure black)

        // Enable additional quality features
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2; // Slightly brighter for immersion
        renderer.shadowMap.enabled = false; // 3DGS doesn't need shadows
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create camera - IMMERSIVE MODE (like Marble)
        // Start INSIDE the world, not looking at it from outside
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000);
        camera.position.set(0, 0, 0); // Start at origin (inside the world)
        camera.up.set(0, -1, 0); // Inverted Y axis (3DGS convention)
        camera.lookAt(0, 0, 1); // Look forward into the scene

        // Create controls - IMMERSIVE FLY MODE
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05; // Smoother
        controls.rotateSpeed = 0.5; // Slower, more deliberate
        controls.enableZoom = false; // Use WASD/wheel for movement
        controls.enablePan = false; // No panning, use WASD
        controls.target.set(0, 0, 1); // Look forward, not at center
        controls.minDistance = 0.1; // Allow getting very close
        controls.maxDistance = 100; // Allow moving far away
        controlsRef.current = controls;

        // Custom wheel handler for flying through
        const handleWheel = (e: WheelEvent) => {
          e.preventDefault();
          const dollySpeed = 0.002;
          const delta = e.deltaY * dollySpeed;
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          camera.position.addScaledVector(forward, -delta);
          controls.target.addScaledVector(forward, -delta);
        };

        renderer.domElement.addEventListener("wheel", handleWheel, { passive: false });

        // WASD keyboard controls for flying
        const keysPressed = new Set<string>();
        const moveSpeed = 0.1;

        const handleKeyDown = (e: KeyboardEvent) => {
          // Only handle if canvas is focused or if it's a movement key
          const key = e.key.toLowerCase();
          if (['w', 'a', 's', 'd', ' '].includes(key)) {
            keysPressed.add(key);
            e.preventDefault();
          }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
          const key = e.key.toLowerCase();
          keysPressed.delete(key);
        };

        // Add keyboard listeners to window (so it works even when canvas not focused)
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // Store cleanup function
        const cleanupKeyboard = () => {
          window.removeEventListener("keydown", handleKeyDown);
          window.removeEventListener("keyup", handleKeyUp);
        };

        // Create viewer - UPGRADED CONFIGURATION for better anime quality
        const viewer = new GaussianSplats3D.Viewer({
          renderer: renderer,
          camera: camera,
          selfDrivenMode: false,
          useBuiltInControls: false,
          sharedMemoryForWorkers: false,
          dynamicScene: false,
          sceneRevealMode: GaussianSplats3D.SceneRevealMode.Gradual,

          // QUALITY UPGRADES (inspired by Mip-Splatting concepts)
          antialiased: true,  // Enable built-in antialiasing
          focalAdjustment: 1.0,
          sphericalHarmonicsDegree: 2,  // Better lighting (0-3, higher = more accurate)
          enableOptionalEffects: true,  // Enable advanced rendering effects

          // Performance vs Quality trade-off (adjust if needed)
          halfPrecisionCovariancesOnGPU: false,  // Full precision = better quality, more VRAM
          devicePixelRatio: Math.min(window.devicePixelRatio, 2),  // Sharp on retina, balanced
        });

        viewerRef.current = { viewer, camera, renderer, controls };

        // Animation loop - Start IMMEDIATELY so we see point cloud as it loads (like Marble)
        const animate = () => {
          if (disposed) return;
          animationFrameId = requestAnimationFrame(animate);

          // Handle WASD movement - IMMERSIVE FLY MODE
          if (keysPressed.size > 0) {
            const forward = new THREE.Vector3();
            const right = new THREE.Vector3();
            const up = new THREE.Vector3(0, -1, 0); // Match camera.up for correct orientation

            camera.getWorldDirection(forward);
            right.crossVectors(forward, up).normalize(); // Right vector

            const moveVector = new THREE.Vector3();

            if (keysPressed.has('w')) {
              moveVector.addScaledVector(forward, moveSpeed);
            }
            if (keysPressed.has('s')) {
              moveVector.addScaledVector(forward, -moveSpeed);
            }
            if (keysPressed.has('a')) {
              moveVector.addScaledVector(right, -moveSpeed);
            }
            if (keysPressed.has('d')) {
              moveVector.addScaledVector(right, moveSpeed);
            }
            if (keysPressed.has(' ')) {
              moveVector.addScaledVector(up, -moveSpeed); // Move up (inverted Y)
            }

            if (moveVector.length() > 0) {
              camera.position.add(moveVector);
              controls.target.add(moveVector);
            }
          }

          controls.update();
          viewer.update();
          viewer.render();
        };

        // Start animation loop BEFORE loading PLY - shows black scene immediately
        animate();


        // Load the PLY file - progressive loading shows points as they come in
        // UPGRADED: Better quality settings for anime PLY files
        await viewer.addSplatScene(modelUrl, {
          splatAlphaRemovalThreshold: 5,  // Remove transparent splats (default: 5)
          showLoadingUI: false,
          progressiveLoad: true,

          // QUALITY IMPROVEMENTS
          rotation: [0, 0, 0, 1],  // No rotation (identity quaternion)
          position: [0, 0, 0],     // Centered
          scale: [1, 1, 1],        // No scaling

          // Anime-specific optimizations
          sphericalHarmonicsDegree: 2,  // Match viewer setting for consistent lighting

          onProgress: (progress: number) => {
            const clampedProgress = Math.min(100, Math.round(progress));
            setLoadProgress(clampedProgress);

            // Dramatic reveal: Start sparse (5%), gradually increase to full (100%)
            // Use easing function for smooth transition
            const normalizedProgress = clampedProgress / 100;
            const easedProgress = normalizedProgress * normalizedProgress; // Quadratic easing
            const quality = 0.05 + (0.95 * easedProgress); // 5% → 100%
            setRenderQuality(quality);
          },
        });


        if (disposed) return;

        // Loading complete - ensure full quality
        setRenderQuality(1.0);
        setLoadProgress(100);
        setIsLoading(false);

        // Handle resize
        const handleResize = () => {
          if (!containerRef.current || disposed) return;
          const newWidth = containerRef.current.clientWidth;
          const newHeight = containerRef.current.clientHeight;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener("resize", handleResize);

        // Store cleanup function in viewerRef for later cleanup
        viewerRef.current.cleanupKeyboard = cleanupKeyboard;
      } catch (err) {
        throw err;
      }
    };

    const initMeshViewer = async () => {
      try {
        const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");

        if (disposed || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Create renderer - same settings as Gaussian splat viewer
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: false,
          logarithmicDepthBuffer: true,
          powerPreference: "high-performance",
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x1a1a2e, 1);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create scene
        const scene = new THREE.Scene();

        // Create camera - INTERACTIVE MODE for 3D object exploration
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000);
        camera.position.set(0, 1, 3);
        camera.lookAt(0, 0, 0);

        // Create controls - ENHANCED ORBIT CONTROLS with free movement
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.8;
        controls.minDistance = 0.1; // Allow getting very close to the object
        controls.maxDistance = 50; // Allow zooming far out
        controls.enablePan = true;
        controls.panSpeed = 0.8;
        controls.target.set(0, 0, 0);
        controlsRef.current = controls;

        // WASD keyboard controls for exploring the 3D object
        const keysPressed = new Set<string>();
        const moveSpeed = 0.1;

        const handleKeyDown = (e: KeyboardEvent) => {
          const key = e.key.toLowerCase();
          if (['w', 'a', 's', 'd', 'q', 'e', ' ', 'shift'].includes(key)) {
            keysPressed.add(key);
            e.preventDefault();
          }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
          const key = e.key.toLowerCase();
          keysPressed.delete(key);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        const cleanupKeyboard = () => {
          window.removeEventListener("keydown", handleKeyDown);
          window.removeEventListener("keyup", handleKeyUp);
        };

        // Enhanced lighting for anime meshes (Hunyuan)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        // Key light (main light source)
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
        keyLight.position.set(5, 8, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 0.1;
        keyLight.shadow.camera.far = 50;
        keyLight.shadow.camera.left = -10;
        keyLight.shadow.camera.right = 10;
        keyLight.shadow.camera.top = 10;
        keyLight.shadow.camera.bottom = -10;
        scene.add(keyLight);

        // Fill light (soften shadows)
        const fillLight = new THREE.DirectionalLight(0xaaccff, 0.4);
        fillLight.position.set(-5, 3, -5);
        scene.add(fillLight);

        // Rim light (highlight edges for anime aesthetic)
        const rimLight = new THREE.DirectionalLight(0xffeecc, 0.3);
        rimLight.position.set(0, 5, -8);
        scene.add(rimLight);

        // Add subtle hemisphere light for natural ambient lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);

        // Load GLB model
        const loader = new GLTFLoader();

        loader.load(
          modelUrl,
          (gltf) => {
            if (disposed || !containerRef.current) return;

            const model = gltf.scene;

            // Enable shadows and enhance materials for anime look
            model.traverse((node: any) => {
              if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;

                // Enhance material for better anime rendering
                if (node.material) {
                  node.material.needsUpdate = true;
                  // Preserve original colors but enhance them slightly
                  if (node.material.metalness !== undefined) {
                    node.material.metalness = Math.min(0.3, node.material.metalness);
                  }
                  if (node.material.roughness !== undefined) {
                    node.material.roughness = Math.max(0.4, node.material.roughness);
                  }
                }
              }
            });

            // Center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;

            model.position.sub(center);
            model.scale.multiplyScalar(scale);

            scene.add(model);

            setIsLoading(false);
            setLoadProgress(100);
          },
          (progress) => {
            if (progress.total > 0) {
              const percent = (progress.loaded / progress.total) * 100;
              setLoadProgress(Math.min(95, percent));
            }
          },
          (error: any) => {
            if (!disposed) {
              setError(`Failed to load mesh: ${error.message || "Unknown error"}`);
              setIsLoading(false);
            }
          }
        );

        // Animation loop with WASD movement
        const animate = () => {
          if (disposed) return;

          animationFrameId = requestAnimationFrame(animate);

          // Handle WASD movement - orbit around object while allowing free camera movement
          if (keysPressed.size > 0) {
            const forward = new THREE.Vector3();
            const right = new THREE.Vector3();
            const worldUp = new THREE.Vector3(0, 1, 0);

            camera.getWorldDirection(forward);
            right.crossVectors(forward, worldUp).normalize();

            const moveVector = new THREE.Vector3();
            const targetMoveVector = new THREE.Vector3();

            if (keysPressed.has('w')) {
              // Move camera forward (closer to object)
              moveVector.addScaledVector(forward, moveSpeed);
            }
            if (keysPressed.has('s')) {
              // Move camera backward (away from object)
              moveVector.addScaledVector(forward, -moveSpeed);
            }
            if (keysPressed.has('a')) {
              // Move camera left (orbit left)
              moveVector.addScaledVector(right, -moveSpeed);
            }
            if (keysPressed.has('d')) {
              // Move camera right (orbit right)
              moveVector.addScaledVector(right, moveSpeed);
            }
            if (keysPressed.has(' ')) {
              // Move camera up
              moveVector.addScaledVector(worldUp, moveSpeed);
            }
            if (keysPressed.has('shift')) {
              // Move camera down
              moveVector.addScaledVector(worldUp, -moveSpeed);
            }
            if (keysPressed.has('q')) {
              // Rotate object or camera left around Y-axis
              targetMoveVector.addScaledVector(right, -moveSpeed);
            }
            if (keysPressed.has('e')) {
              // Rotate object or camera right around Y-axis
              targetMoveVector.addScaledVector(right, moveSpeed);
            }

            if (moveVector.length() > 0) {
              camera.position.add(moveVector);
            }

            if (targetMoveVector.length() > 0) {
              controls.target.add(targetMoveVector);
            }
          }

          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
          if (!containerRef.current) return;

          const newWidth = containerRef.current.clientWidth;
          const newHeight = containerRef.current.clientHeight;

          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener("resize", handleResize);

        // Store cleanup function
        viewerRef.current = {
          dispose: () => {
            window.removeEventListener("resize", handleResize);
            cleanupKeyboard();
            scene.clear();
          },
          cleanupKeyboard
        };
      } catch (err) {
        throw err;
      }
    };

    initViewer();

    return () => {
      disposed = true;

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      if (viewerRef.current?.viewer?.dispose) {
        viewerRef.current.viewer.dispose();
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      // Cleanup keyboard listeners
      if (viewerRef.current?.cleanupKeyboard) {
        viewerRef.current.cleanupKeyboard();
      }

      viewerRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
    };
  }, [modelUrl, modelType]);

  return (
    <div className={`relative w-full h-[60vh] bg-gray-900 rounded-lg overflow-hidden border border-gray-800 ${className || ""}`}>
      <div
        ref={containerRef}
        className="absolute inset-0"
      />

      {/* Control hints - only show for mesh viewer and after loading */}
      {!isLoading && !error && modelType === "glb" && (
        <div className="absolute top-4 right-4 px-4 py-3 bg-black/70 backdrop-blur-sm rounded-lg z-10 text-white/90">
          <div className="text-xs font-semibold mb-2 text-white">Controls</div>
          <div className="text-xs space-y-1 text-white/80">
            <div>🖱️ <span className="font-medium">Mouse</span>: Rotate view</div>
            <div>⌨️ <span className="font-medium">WASD</span>: Move camera</div>
            <div>⌨️ <span className="font-medium">Q/E</span>: Orbit around</div>
            <div>⌨️ <span className="font-medium">Space/Shift</span>: Up/Down</div>
            <div>🖱️ <span className="font-medium">Scroll</span>: Zoom in/out</div>
          </div>
        </div>
      )}

      {/* Control hints for PLY viewer - after loading */}
      {!isLoading && !error && modelType === "ply" && (
        <div className="absolute top-4 right-4 px-4 py-3 bg-black/70 backdrop-blur-sm rounded-lg z-10 text-white/90">
          <div className="text-xs font-semibold mb-2 text-white">Controls</div>
          <div className="text-xs space-y-1 text-white/80">
            <div>🖱️ <span className="font-medium">Mouse</span>: Look around</div>
            <div>⌨️ <span className="font-medium">WASD</span>: Fly through</div>
            <div>⌨️ <span className="font-medium">Space</span>: Move up</div>
            <div>🖱️ <span className="font-medium">Scroll</span>: Move forward/back</div>
          </div>
        </div>
      )}

      {/* Subtle corner loading indicator - doesn't block scene */}
      {isLoading && (
        <div className="absolute bottom-4 left-4 flex flex-col gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-lg z-10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-sm text-white/80">{loadProgress}%</span>
          </div>
          <div className="text-xs text-white/60">
            {loadProgress < 30
              ? "Building point cloud..."
              : loadProgress < 70
              ? "Filling details..."
              : "Finalizing..."}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-4 text-center z-10">
          <p className="text-lg font-semibold mb-2 text-red-400">Failed to load 3D scene</p>
          <p className="text-sm text-gray-300">{error}</p>
          <p className="text-xs mt-2 text-gray-500">Check browser console for details</p>
        </div>
      )}
    </div>
  );
}
