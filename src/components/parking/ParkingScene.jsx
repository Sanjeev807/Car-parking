import { Environment, Float, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function CameraRig({ focus }) {
  const { camera } = useThree();
  const lookAt = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const bob = Math.sin(time * 0.9) * 0.2;

    const targetPosition = new THREE.Vector3(
      (focus?.x ?? 0) + 8,
      9 + bob,
      (focus?.z ?? 0) + 11
    );

    camera.position.lerp(targetPosition, 0.05);

    lookAt.set(focus?.x ?? 0, 0.8, focus?.z ?? 0);
    camera.lookAt(lookAt);
  });

  return null;
}

function NeonSlot({ slot, isFocused, onSelect, onReserve }) {
  const meshRef = useRef(null);
  const hoverRef = useRef(false);

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }

    const focusedScale = isFocused ? 1.15 : 1;
    const hoverScale = hoverRef.current ? 1.08 : 1;
    const target = focusedScale * hoverScale;

    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
  });

  const color = slot.occupied ? "#ff3d72" : "#27f0a6";
  const emissive = slot.occupied ? "#a30039" : "#03a46f";

  return (
    <group position={[slot.position.x, slot.position.y, slot.position.z]}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerOver={() => {
          hoverRef.current = true;
          onSelect(slot.id);
        }}
        onPointerOut={() => {
          hoverRef.current = false;
        }}
        onClick={() => {
          onSelect(slot.id);
          if (!slot.occupied) {
            onReserve(slot.id);
          }
        }}
      >
        <boxGeometry args={[2.4, 1, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isFocused || hoverRef.current ? 1.45 : 0.8}
          metalness={0.45}
          roughness={0.25}
        />
      </mesh>

      <Text
        position={[0, 1.35, 0]}
        fontSize={0.45}
        color="#dff8ff"
        anchorX="center"
        anchorY="middle"
      >
        {slot.label}
      </Text>
    </group>
  );
}

function AnimatedLightStreaks() {
  const lightA = useRef(null);
  const lightB = useRef(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (lightA.current) {
      lightA.current.position.set(Math.sin(t) * 12, 5 + Math.sin(t * 2) * 0.5, Math.cos(t) * 10);
    }

    if (lightB.current) {
      lightB.current.position.set(Math.cos(t * 1.3) * -10, 4.5 + Math.cos(t * 1.9) * 0.6, Math.sin(t * 1.2) * 12);
    }
  });

  return (
    <>
      <pointLight ref={lightA} intensity={120} color="#3bc8ff" distance={24} />
      <pointLight ref={lightB} intensity={100} color="#18ffb3" distance={24} />
    </>
  );
}

function SceneContent({ slots, focusedSlot, onSelect, onReserve }) {
  return (
    <>
      <color attach="background" args={["#070b16"]} />
      <fog attach="fog" args={["#070b16", 22, 56]} />

      <ambientLight intensity={0.25} />
      <directionalLight position={[8, 15, 8]} intensity={1.15} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <spotLight position={[-10, 12, -10]} angle={0.42} penumbra={0.6} intensity={70} color="#56d9ff" castShadow />
      <spotLight position={[10, 10, 10]} angle={0.38} penumbra={0.7} intensity={62} color="#3cffb3" castShadow />

      <AnimatedLightStreaks />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial color="#0a1021" metalness={0.3} roughness={0.72} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[12, 17, 64]} />
        <meshBasicMaterial color="#14344a" transparent opacity={0.35} />
      </mesh>

      {slots.map((slot) => (
        <Float key={slot.id} speed={1.2} rotationIntensity={0.08} floatIntensity={0.08}>
          <NeonSlot
            slot={slot}
            isFocused={focusedSlot === slot.id}
            onSelect={onSelect}
            onReserve={onReserve}
          />
        </Float>
      ))}

      <Text position={[-9, 0.4, -9]} color="#8eb9ff" fontSize={0.42}>
        Entry Gate
      </Text>

      <Environment preset="city" />
      <OrbitControls enablePan={false} minDistance={8} maxDistance={24} maxPolarAngle={Math.PI * 0.48} />
      <CameraRig focus={slots.find((slot) => slot.id === focusedSlot)?.position} />
    </>
  );
}

function ParkingScene({ slots, focusedSlot, onSelect, onReserve }) {
  return (
    <Canvas shadows camera={{ position: [9, 9, 12], fov: 45 }}>
      <SceneContent
        slots={slots}
        focusedSlot={focusedSlot}
        onSelect={onSelect}
        onReserve={onReserve}
      />
    </Canvas>
  );
}

export default ParkingScene;
