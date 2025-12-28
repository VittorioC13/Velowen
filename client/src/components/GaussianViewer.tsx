import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface GaussianViewerProps {
  modelUrl: string;
  modelType?: "ply" | "glb" | "gltf";
}

export default function GaussianViewer({
  modelUrl,
  modelType = "ply",
}: GaussianViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !modelUrl) return;

    console.log('[GaussianViewer] Initializing with URL:', modelUrl);
    console.log('[GaussianViewer] Model type:', modelType);

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
        }
      } catch (err) {
        console.error("[GaussianViewer] Error initializing viewer:", err);
        if (!disposed) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error("[GaussianViewer] Full error:", errorMsg);
          setError(`Failed to load 3D scene: ${errorMsg}`);
          setIsLoading(false);
        }
      }
    };

    const initGaussianSplatViewer = async () => {
      try {
        console.log("[GaussianViewer] Importing Gaussian Splats library...");
        const GaussianSplats3D = await import("@mkkellogg/gaussian-splats-3d");
        console.log("[GaussianViewer] Library imported successfully");

        if (disposed || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        console.log("[GaussianViewer] Container size:", width, "x", height);

        // Create renderer with WHITE background (like SHARP-ML for progressive reveal effect)
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: false, // Opaque background for white reveal effect
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0xffffff, 1); // White background
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 500);
        camera.position.set(0, 0, -3);
        camera.up.set(0, -1, 0);
        camera.lookAt(0, 0, 0);

        // Create controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.rotateSpeed = 0.8;
        controls.enableZoom = false;
        controls.target.set(0, 0, 0);
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
          if (['w', 'a', 's', 'd', ' ', 'shift'].includes(key)) {
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

        // Create viewer - EXACT SHARP-ML CONFIGURATION
        const viewer = new GaussianSplats3D.Viewer({
          renderer: renderer,
          camera: camera,
          selfDrivenMode: false,
          useBuiltInControls: false,
          sharedMemoryForWorkers: false,
          dynamicScene: false,
          sceneRevealMode: GaussianSplats3D.SceneRevealMode.Gradual,
          antialiased: true,
          focalAdjustment: 1.0,
        });

        viewerRef.current = { viewer, camera, renderer, controls };

        console.log("[GaussianViewer] Loading PLY from URL:", modelUrl);
        console.log("[GaussianViewer] URL type:", modelUrl.startsWith('data:') ? 'data URL' : modelUrl.startsWith('blob:') ? 'blob URL' : 'HTTP URL');
        
        // Load the PLY file - EXACT SHARP-ML CALL
        await viewer.addSplatScene(modelUrl, {
          splatAlphaRemovalThreshold: 5,
          showLoadingUI: false,
          progressiveLoad: true,
          onProgress: (progress: number) => {
            const clampedProgress = Math.min(100, Math.round(progress));
            console.log("[GaussianViewer] Load progress:", clampedProgress + "%");
            setLoadProgress(clampedProgress);
          },
        });

        console.log("[GaussianViewer] PLY loaded successfully!");

        if (disposed) return;

        setIsLoading(false);

        // Animation loop - EXACT SHARP-ML LOOP with WASD movement
        const animate = () => {
          if (disposed) return;
          animationFrameId = requestAnimationFrame(animate);
          
          // Handle WASD movement
          if (keysPressed.size > 0) {
            const forward = new THREE.Vector3();
            const right = new THREE.Vector3();
            const up = new THREE.Vector3(0, 1, 0);
            
            camera.getWorldDirection(forward);
            right.crossVectors(forward, up).normalize();
            
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
              moveVector.addScaledVector(up, moveSpeed);
            }
            if (keysPressed.has('shift')) {
              moveVector.addScaledVector(up, -moveSpeed);
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
        animate();

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
        console.error("[GaussianViewer] Error in initGaussianSplatViewer:", err);
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
    <div className="relative w-full h-[60vh] bg-white rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div ref={containerRef} className="absolute inset-0" />

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
          <div className="w-12 h-12 border-4 border-gray-900 dark:border-gray-100 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-lg text-gray-900 dark:text-gray-100">Loading 3D Scene</p>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{loadProgress}%</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-4 text-center z-10">
          <p className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Failed to load 3D scene</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{error}</p>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Check browser console for details</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 text-xs z-10 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p>Drag to rotate • Scroll/WASD to fly • Space/Shift for up/down</p>
        </div>
      )}
    </div>
  );
}
