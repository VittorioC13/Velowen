import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Season } from '../App';

interface PointCloudSceneProps {
  season: Season;
}

export function PointCloudScene({ season }: PointCloudSceneProps) {
  const terrainRef = useRef<THREE.Points>(null);
  const mistRef = useRef<THREE.Points>(null);
  const accentsRef = useRef<THREE.Points>(null);
  const snowRef = useRef<THREE.Points>(null);

  const terrainParticles = 40000;
  const mistParticles = 15000;
  const accentParticles = 5000;
  const snowParticles = 3000;

  const isWinter = season === 'winter';

  const terrainData = useMemo(() => {
    const positions = new Float32Array(terrainParticles * 3);
    const winterColors = new Float32Array(terrainParticles * 3);
    const springColors = new Float32Array(terrainParticles * 3);

    for (let i = 0; i < terrainParticles; i++) {
      const i3 = i * 3;

      const x = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 70;
      const y = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 4 + Math.random() * 1.5 - 2;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      const heightFactor = (y + 4) / 8;
      
      winterColors[i3] = 0.38 + heightFactor * 0.25;
      winterColors[i3 + 1] = 0.48 + heightFactor * 0.28;
      winterColors[i3 + 2] = 0.58 + heightFactor * 0.30;

      springColors[i3] = 0.15 + heightFactor * 0.15;
      springColors[i3 + 1] = 0.35 + heightFactor * 0.25;
      springColors[i3 + 2] = 0.08 + heightFactor * 0.12;
    }

    return { positions, winterColors, springColors };
  }, []);

  const mistData = useMemo(() => {
    const positions = new Float32Array(mistParticles * 3);
    const winterColors = new Float32Array(mistParticles * 3);
    const springColors = new Float32Array(mistParticles * 3);

    for (let i = 0; i < mistParticles; i++) {
      const i3 = i * 3;

      const x = (Math.random() - 0.5) * 75;
      const z = (Math.random() - 0.5) * 75;
      const baseY = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 4;
      const y = baseY + 0.5 + Math.random() * 1.5;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      winterColors[i3] = 0.75 + Math.random() * 0.15;
      winterColors[i3 + 1] = 0.82 + Math.random() * 0.12;
      winterColors[i3 + 2] = 0.90 + Math.random() * 0.08;

      springColors[i3] = 0.20 + Math.random() * 0.15;
      springColors[i3 + 1] = 0.45 + Math.random() * 0.20;
      springColors[i3 + 2] = 0.12 + Math.random() * 0.10;
    }

    return { positions, winterColors, springColors };
  }, []);

  const accentData = useMemo(() => {
    const positions = new Float32Array(accentParticles * 3);
    const winterColors = new Float32Array(accentParticles * 3);
    const springColors = new Float32Array(accentParticles * 3);

    for (let i = 0; i < accentParticles; i++) {
      const i3 = i * 3;

      const x = (Math.random() - 0.5) * 65;
      const z = (Math.random() - 0.5) * 65;
      const baseY = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 4;
      const y = baseY + 1 + Math.random() * 2;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      winterColors[i3] = 0.95 + Math.random() * 0.05;
      winterColors[i3 + 1] = 0.96 + Math.random() * 0.04;
      winterColors[i3 + 2] = 0.98 + Math.random() * 0.02;

      springColors[i3] = 0.30 + Math.random() * 0.15;
      springColors[i3 + 1] = 0.55 + Math.random() * 0.20;
      springColors[i3 + 2] = 0.18 + Math.random() * 0.12;
    }

    return { positions, winterColors, springColors };
  }, []);

  const snowData = useMemo(() => {
    const positions = new Float32Array(snowParticles * 3);
    const colors = new Float32Array(snowParticles * 3);
    const velocities = new Float32Array(snowParticles);

    for (let i = 0; i < snowParticles; i++) {
      const i3 = i * 3;

      positions[i3] = (Math.random() - 0.5) * 80;
      positions[i3 + 1] = Math.random() * 30 + 5;
      positions[i3 + 2] = (Math.random() - 0.5) * 80;

      colors[i3] = 0.98;
      colors[i3 + 1] = 0.99;
      colors[i3 + 2] = 1.0;

      velocities[i] = 0.5 + Math.random() * 1.0;
    }

    return { positions, colors, velocities };
  }, []);

  useEffect(() => {
    if (terrainRef.current) {
      const colorAttr = terrainRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;
      if (colorAttr) {
        colorAttr.array.set(isWinter ? terrainData.winterColors : terrainData.springColors);
        colorAttr.needsUpdate = true;
      }
    }
    if (mistRef.current) {
      const colorAttr = mistRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;
      if (colorAttr) {
        colorAttr.array.set(isWinter ? mistData.winterColors : mistData.springColors);
        colorAttr.needsUpdate = true;
      }
    }
    if (accentsRef.current) {
      const colorAttr = accentsRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;
      if (colorAttr) {
        colorAttr.array.set(isWinter ? accentData.winterColors : accentData.springColors);
        colorAttr.needsUpdate = true;
      }
    }
  }, [season, isWinter, terrainData, mistData, accentData]);

  useFrame((state, delta) => {
    if (!snowRef.current || !isWinter) return;

    const positions = snowRef.current.geometry.attributes.position;
    const posArray = positions.array as Float32Array;

    for (let i = 0; i < snowParticles; i++) {
      const i3 = i * 3;
      
      posArray[i3 + 1] -= snowData.velocities[i] * delta * 2;
      posArray[i3] += Math.sin(state.clock.elapsedTime + i) * delta * 0.3;
      
      if (posArray[i3 + 1] < -5) {
        posArray[i3 + 1] = 30 + Math.random() * 10;
        posArray[i3] = (Math.random() - 0.5) * 80;
        posArray[i3 + 2] = (Math.random() - 0.5) * 80;
      }
    }

    positions.needsUpdate = true;
  });

  return (
    <group>
      <points ref={terrainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={terrainParticles}
            array={terrainData.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={terrainParticles}
            array={terrainData.winterColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={mistRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={mistParticles}
            array={mistData.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={mistParticles}
            array={mistData.winterColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.18}
          vertexColors
          transparent
          opacity={0.35}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={accentsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={accentParticles}
            array={accentData.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={accentParticles}
            array={accentData.winterColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {isWinter && (
        <points ref={snowRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={snowParticles}
              array={snowData.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={snowParticles}
              array={snowData.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.06}
            vertexColors
            transparent
            opacity={0.6}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}
