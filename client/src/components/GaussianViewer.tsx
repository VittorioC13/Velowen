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
          // Use Gaussian Splats viewer for PLY files
          await initGaussianSplatViewer();
        }
      } catch (err) {
        console.error("Error initializing viewer:", err);
        if (!disposed) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          setError(`Failed to load 3D scene: ${errorMsg}`);
          setIsLoading(false);
        }
      }
    };

    const initGaussianSplatViewer = async () => {
      try {
        // Dynamically import the Gaussian Splats library
        const GaussianSplats3D = await import("@mkkellogg/gaussian-splats-3d");

        if (disposed || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

        // Create viewer
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

        // Handle blob URLs - convert to data URL if needed
        let urlToLoad = modelUrl;
        if (modelUrl.startsWith('blob:')) {
          // For blob URLs, we need to fetch and convert to data URL
          try {
            const response = await fetch(modelUrl);
            const blob = await response.blob();
            urlToLoad = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (err) {
            console.error('Error converting blob to data URL:', err);
            // Fall back to original URL
          }
        }

        await viewer.addSplatScene(urlToLoad, {
          splatAlphaRemovalThreshold: 5,
          showLoadingUI: false,
          progressiveLoad: true,
          onProgress: (progress: number) => {
            setLoadProgress(Math.min(100, Math.round(progress)));
          },
        });

        if (disposed) return;

        setIsLoading(false);

        // Animation loop
        const animate = () => {
          if (disposed) return;
          animationFrameId = requestAnimationFrame(animate);
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

      viewerRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
    };
  }, [modelUrl, modelType]);

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-900 relative">
      <div ref={containerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white text-sm">Loading 3D Scene</p>
          <p className="text-white/60 text-xs mt-2">{loadProgress}%</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
          <p>Drag to rotate • Scroll to fly through</p>
        </div>
      )}
    </div>
  );
}

