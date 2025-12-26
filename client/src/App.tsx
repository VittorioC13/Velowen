import { useState } from "react";
import { Route, useLocation } from "wouter";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PointCloudScene } from "./components/PointCloudScene";
import { CameraController } from "./components/CameraController";
import { UIOverlay } from "./components/UIOverlay";
import ImageTo3DPage from "./pages/image-to-3d";
import "@fontsource/inter";

export type Season = "winter" | "spring";

function HomePage() {
  const [season, setSeason] = useState<Season>("winter");

  const winterBackground = 'linear-gradient(180deg, #93B7D7 0%, #C5D8E8 40%, #E8F0F5 100%)';
  const springBackground = '#000000';

  const winterCanvasBackground = '#C5D8E8';
  const springCanvasBackground = '#000000';

  const winterFog = '#C5D8E8';
  const springFog = '#000000';

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden', 
      background: season === 'winter' ? winterBackground : springBackground,
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
        <color attach="background" args={[season === 'winter' ? winterCanvasBackground : springCanvasBackground]} />
        <fog attach="fog" args={[season === 'winter' ? winterFog : springFog, 30, 120]} />
        
        {season === 'winter' ? (
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
            intensity={season === 'winter' ? 0.8 : 0.4}
            radius={0.8}
          />
        </EffectComposer>
      </Canvas>

      <UIOverlay season={season} onSeasonChange={setSeason} />
    </div>
  );
}

function App() {
  const [location] = useLocation();

  return (
    <>
      <Route path="/" component={HomePage} />
      <Route path="/image-to-3d" component={ImageTo3DPage} />
    </>
  );
}

export default App;
