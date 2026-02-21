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
    <div className="relative w-full h-[60vh] bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      <div
        ref={containerRef}
        className="absolute inset-0"
      />

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
