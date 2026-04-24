import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WeatherProps {
  type: 'rain' | 'snow' | 'none';
  color?: string;
}

export default function Weather({ type, color }: WeatherProps) {
  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null!);

  useFrame((state, delta) => {
    if (type === 'none') return;
    const geometry = pointsRef.current.geometry;
    const posAttr = geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const yIdx = i * 3 + 1;
      array[yIdx] -= (type === 'rain' ? 30 : 5) * delta;
      if (array[yIdx] < -10) {
        array[yIdx] = 30;
      }
    }
    posAttr.needsUpdate = true;
  });

  if (type === 'none') return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color || (type === 'rain' ? '#aaaaff' : '#ffffff')}
        size={type === 'rain' ? 0.05 : 0.1}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}
