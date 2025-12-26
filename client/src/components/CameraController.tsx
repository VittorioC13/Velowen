import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function CameraController() {
  const { camera } = useThree();
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta * 0.2;

    const radius = 25;
    const height = 8;

    camera.position.x = Math.cos(timeRef.current) * radius;
    camera.position.z = Math.sin(timeRef.current) * radius;
    camera.position.y = height + Math.sin(timeRef.current * 0.5) * 2;

    camera.lookAt(0, 2, 0);
  });

  return null;
}
