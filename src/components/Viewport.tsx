import React, { Suspense, useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Environment, PerspectiveCamera, Text, Center, KeyboardControls, useKeyboardControls, Circle } from '@react-three/drei';
import { Physics, usePlane, useBox, useSphere, useCylinder } from '@react-three/cannon';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { SceneData, CinematicSequence } from '../types';
import Weather from './Weather';

function CinematicCamera({ sequence, active }: { sequence?: CinematicSequence, active: boolean }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const startTime = useRef(0);

  useFrame((state) => {
    if (!active || !sequence) return;

    if (startTime.current === 0) startTime.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startTime.current;

    let accumulatedTime = 0;
    
    for (let i = 0; i < sequence.cameraPath.length; i++) {
      const p = sequence.cameraPath[i];
      if (elapsed < accumulatedTime + p.duration) {
        const progress = (elapsed - accumulatedTime) / p.duration;
        const prev = sequence.cameraPath[i - 1] || { position: [12, 12, 12], lookAt: [0, 0, 0] };
        
        targetPos.current.set(
          THREE.MathUtils.lerp(prev.position[0], p.position[0], progress),
          THREE.MathUtils.lerp(prev.position[1], p.position[1], progress),
          THREE.MathUtils.lerp(prev.position[2], p.position[2], progress)
        );

        targetLook.current.set(
          THREE.MathUtils.lerp(prev.lookAt[0], p.lookAt[0], progress),
          THREE.MathUtils.lerp(prev.lookAt[1], p.lookAt[1], progress),
          THREE.MathUtils.lerp(prev.lookAt[2], p.lookAt[2], progress)
        );

        camera.position.copy(targetPos.current);
        camera.lookAt(targetLook.current);
        break;
      }
      accumulatedTime += p.duration;
    }
  });

  useEffect(() => {
    if (!active) startTime.current = 0;
  }, [active]);

  return null;
}

interface ViewportProps {
  sceneData?: SceneData;
  cinematicActive?: boolean;
  cinematicSequence?: CinematicSequence;
}

function ProceduralTerrain({ seed = 123, complexity = 0.5, color = '#1a1a1a' }: { seed?: number, complexity?: number, color?: string }) {
  const noise2D = useMemo(() => createNoise2D(() => seed), [seed]);
  const segments = 100;
  const size = 100;

  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, 0, 0],
    type: 'Static'
  }));

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const vertices = geo.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const noise = noise2D(x * 0.05, y * 0.05);
      const noise2 = noise2D(x * 0.2, y * 0.2) * 0.2;
      vertices[i + 2] = (noise + noise2) * complexity * 5;
    }
    geo.computeVertexNormals();
    return geo;
  }, [noise2D, complexity]);

  return (
    <mesh ref={ref as any} receiveShadow geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function PhysicsPlayer({ onMove }: { onMove: (pos: THREE.Vector3) => void }) {
  const [, get] = useKeyboardControls();
  const [ref, api] = useSphere(() => ({ 
    mass: 1, 
    position: [0, 10, 0], 
    args: [0.5],
    fixedRotation: true 
  }));
  
  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  const pos = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((p) => {
    pos.current = p;
    onMove(new THREE.Vector3(p[0], p[1], p[2]));
  }), [api.position, onMove]);

  useFrame((state) => {
    const { forward, backward, left, right, jump } = get();
    
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(backward) - Number(forward));
    const sideVector = new THREE.Vector3(Number(left) - Number(right), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(7);

    api.velocity.set(direction.x, velocity.current[1], direction.z);

    if (jump && Math.abs(velocity.current[1]) < 0.1) {
      api.velocity.set(velocity.current[0], 6, velocity.current[2]);
    }

    if (pos.current[1] < -15) {
      api.position.set(0, 10, 0);
      api.velocity.set(0, 0, 0);
    }

    state.camera.position.lerp(
      new THREE.Vector3(pos.current[0], pos.current[1] + 12, pos.current[2] + 12), 
      0.1
    );
    state.camera.lookAt(pos.current[0], pos.current[1], pos.current[2]);
  });

  return (
    <group ref={ref as any}>
      <mesh castShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.8} />
      </mesh>
      <group position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Circle args={[0.5, 32]}>
          <meshStandardMaterial color="#60a5fa" transparent opacity={0.5} />
        </Circle>
      </group>
    </group>
  );
}

function PhysicalObject({ obj, playerPos }: { obj: SceneData['objects'][0], playerPos: THREE.Vector3 }) {
  const { mass = 5, restitution = 0.4, friction = 0.5, canSleep = true, type = 'dynamic' } = obj.physics || {};

  const getPhysicsArgs = (): any => {
    switch (obj.type) {
      case 'sphere': return { mass, position: obj.position, args: [obj.scale[0]], allowSleep: canSleep, type, restitution, friction };
      case 'pyramid': return { mass, position: obj.position, args: [0, obj.scale[0], obj.scale[1], 4], allowSleep: canSleep, type, restitution, friction };
      case 'tree': return { mass, position: obj.position, args: [obj.scale[0] * 0.2, obj.scale[1] * 0.4, obj.scale[2] * 2], allowSleep: canSleep, type, restitution, friction };
      case 'rock': return { mass, position: obj.position, args: [obj.scale[0], obj.scale[1], obj.scale[2]], allowSleep: canSleep, type, restitution, friction };
      case 'building': return { mass, position: obj.position, args: [obj.scale[0], obj.scale[1] * 2, obj.scale[2]], allowSleep: canSleep, type: 'Static', restitution, friction }; // Buildings usually static
      default: return { mass, position: obj.position, args: obj.scale, allowSleep: canSleep, type, restitution, friction };
    }
  };

  const physicsParams = getPhysicsArgs();
  
  let ref: React.MutableRefObject<THREE.Mesh | undefined>;
  
  const [boxRef] = useBox(() => physicsParams);
  const [sphereRef] = useSphere(() => physicsParams);
  const [cylinderRef] = useCylinder(() => physicsParams);

  if (obj.type === 'sphere') ref = sphereRef as any;
  else if (obj.type === 'tree' || obj.type === 'pyramid') ref = cylinderRef as any;
  else ref = boxRef as any;

  const [showLabel, setShowLabel] = useState(false);

  useFrame(() => {
    if (!ref.current) return;
    const distance = ref.current.position.distanceTo(playerPos);
    setShowLabel(distance < 15);
  });

  const getGeometry = () => {
    switch (obj.type) {
      case 'sphere': return <sphereGeometry args={[1, 16, 16]} />;
      case 'pyramid': return <cylinderGeometry args={[0, 1, 1, 4]} />;
      case 'tree': return <cylinderGeometry args={[0.2, 0.4, 2]} />;
      case 'rock': return <dodecahedronGeometry args={[1, 0]} />;
      case 'building': return <boxGeometry args={[1, 2, 1]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh ref={ref as any} castShadow receiveShadow scale={obj.scale}>
      {getGeometry()}
      <meshStandardMaterial color={obj.color} roughness={0.7} metalness={0.2} />
      {showLabel && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          scale={[1/obj.scale[0], 1/obj.scale[1], 1/obj.scale[2]]}
        >
          {obj.description}
        </Text>
      )}
    </mesh>
  );
}

function World({ sceneData, cinematicActive, cinematicSequence }: ViewportProps) {
  const playerPos = useRef(new THREE.Vector3());

  if (!sceneData) return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Center top>
        <Text fontSize={2} color="#4ade80">
          AWAITING SYNC
        </Text>
      </Center>
    </>
  );

  return (
    <>
      <CinematicCamera active={cinematicActive || false} sequence={cinematicSequence} />
      <ambientLight intensity={0.4} color={sceneData.ambientColor} />
      <pointLight position={[20, 30, 20]} intensity={1.5} castShadow />
      <Sky sunPosition={[100, 20, 100]} />
      <Stars radius={150} depth={50} count={8000} factor={4} saturation={0.5} fade speed={1} />
      <fog attach="fog" args={[sceneData.fogColor, 10, 60]} />

      <Physics gravity={[0, -9.81, 0]} allowSleep>
        <ProceduralTerrain 
          seed={sceneData.proceduralSeed} 
          complexity={sceneData.terrainComplexity} 
          color={sceneData.terrainColor} 
        />
        <Weather 
          type={sceneData.ambientColor === '#1a1a2e' ? 'rain' : sceneData.skyColor === '#f0f0f0' ? 'snow' : 'none'} 
        />
        {sceneData.fogColor && (
          <fogExp2 attach="fog" args={[sceneData.fogColor, 0.02]} />
        )}
        <PhysicsPlayer onMove={(p) => playerPos.current.copy(p)} />
        {sceneData.objects.map((obj, i) => (
          <PhysicalObject key={i} obj={obj} playerPos={playerPos.current} />
        ))}
      </Physics>

      <gridHelper args={[100, 100, '#ffffff', '#222222']} position={[0, 0.05, 0]} />
    </>
  );
}

export default function Viewport({ sceneData, cinematicActive, cinematicSequence }: ViewportProps) {
  const map = useMemo(() => [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
  ], []);

  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden border border-white/10 relative">
      <KeyboardControls map={map}>
        <Canvas shadows gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={50} />
          {!cinematicActive && <OrbitControls enableDamping panSpeed={0.5} rotateSpeed={0.5} maxPolarAngle={Math.PI / 1.8} />}
          <Suspense fallback={null}>
            <World sceneData={sceneData} cinematicActive={cinematicActive} cinematicSequence={cinematicSequence} />
            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </KeyboardControls>
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-none">
        <h4 className="text-[10px] uppercase font-mono tracking-widest text-accent mb-1">Visualizer Status</h4>
        <p className="text-[11px] text-white/60 font-mono text-accent">PHYSICS_ENABLED: TRUE</p>
        <p className="text-[11px] text-white/60 font-mono text-accent">PROCEDURAL_PASS: ACTIVE</p>
        <p className="text-[11px] text-white/60 font-mono">
          RENDER_MODE: {sceneData ? 'DYNAMIC_BLUEPRINT' : 'SYSTEM_IDLE'}
        </p>
        <p className="text-[11px] text-white/60 font-mono">
          ENTITIES: {sceneData?.objects.length || 0}
        </p>
      </div>
      <div className="absolute bottom-4 left-4 text-[10px] text-white/40 font-mono flex flex-col gap-1">
        <span>WASD: NAV_MOVE</span>
        <span>SPACE: NAV_JUMP</span>
      </div>
      <div className="absolute bottom-4 right-4 text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">
        Three.js Architect Engine v2.0-PROX
      </div>
    </div>
  );
}
