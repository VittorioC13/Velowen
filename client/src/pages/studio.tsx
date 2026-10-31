import { useState } from "react";
import { Link } from "wouter";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { ArrowLeft } from "lucide-react";
import { PointCloudScene } from "@/components/PointCloudScene";
import { CameraController } from "@/components/CameraController";
import { UIOverlay } from "@/components/UIOverlay";
import { useHtmlClass } from "@/lib/use-html-class";
import type { Season } from "@/lib/season";

// Velowen Studio: the original world-model landing scene, moved here unchanged
// from the old home page.
export default function StudioPage() {
  useHtmlClass("lab-fullscreen");
  const [season, setSeason] = useState<Season>("winter");

  const winterBackground = 'linear-gradient(180deg, #93B7D7 0%, #C5D8E8 40%, #E8F0F5 100%)';
  const springBackground = '#000000';

  const winterCanvasBackground = '#C5D8E8';
  const springCanvasBackground = '#000000';

  const winterFog = '#C5D8E8';
  const springFog = '#000000';

  const isWinter = season === 'winter';

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: isWinter ? winterBackground : springBackground,
      transition: 'background 0.5s ease'
    }}>
      <Canvas
        camera={{
          position: [25, 10, 0],
          fov: 55,
          near: 0.1,
          far: 200
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={[isWinter ? winterCanvasBackground : springCanvasBackground]} />
        <fog attach="fog" args={[isWinter ? winterFog : springFog, 30, 120]} />

        {isWinter ? (
          <>
            <ambientLight intensity={0.6} color="#E8F0F5" />
            <directionalLight position={[20, 30, 10]} intensity={0.8} color="#FFFFFF" />
            <hemisphereLight args={['#C5D8E8', '#6F8FA6', 0.5]} />
          </>
        ) : (
          <>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
          </>
        )}

        <PointCloudScene season={season} />
        <CameraController />

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            intensity={isWinter ? 0.8 : 0.4}
            radius={0.8}
          />
        </EffectComposer>
      </Canvas>

      <UIOverlay season={season} onSeasonChange={setSeason} />

      <Link
        href="/"
        className={`fixed bottom-6 left-6 z-20 flex items-center gap-2 rounded-full border px-4 py-2 text-[14px] font-medium backdrop-blur-[20px] transition-colors ${
          isWinter
            ? 'border-white/40 bg-white/50 text-black/70 hover:text-black/90'
            : 'border-white/15 bg-white/10 text-white/70 hover:text-white'
        }`}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Velowen
      </Link>
    </div>
  );
}
