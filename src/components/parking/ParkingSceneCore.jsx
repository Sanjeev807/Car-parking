import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";

function NeonBoundary() {
  const pulseRef = useRef(null);

  useFrame((state) => {
    if (!pulseRef.current) {
      return;
    }

    const pulse = 0.45 + Math.sin(state.clock.getElapsedTime() * 1.7) * 0.12;
    pulseRef.current.material.opacity = pulse;
  });

  const strips = [
    { pos: [0, 0.03, -9.4], size: [18.8, 0.03, 0.15] },
    { pos: [0, 0.03, 9.4], size: [18.8, 0.03, 0.15] },
    { pos: [-9.4, 0.03, 0], size: [0.15, 0.03, 18.8] },
    { pos: [9.4, 0.03, 0], size: [0.15, 0.03, 18.8] }
  ];

  return (
    <>
      {strips.map((strip, idx) => (
        <mesh key={idx} position={strip.pos}>
          <boxGeometry args={strip.size} />
          <meshStandardMaterial color="#2fc4ff" emissive="#0078a3" emissiveIntensity={1.2} />
        </mesh>
      ))}

      <mesh ref={pulseRef} position={[0, 0.031, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.6, 10.2, 64]} />
        <meshBasicMaterial color="#4ee7ff" transparent opacity={0.42} />
      </mesh>
    </>
  );
}

function LaneMarkings() {
  const lanePieces = [
    { pos: [0, 0.021, -6.9], size: [11, 0.01, 0.08] },
    { pos: [0, 0.021, -4.1], size: [11, 0.01, 0.08] },
    { pos: [0, 0.021, -1.3], size: [11, 0.01, 0.08] },
    { pos: [0, 0.021, 1.5], size: [11, 0.01, 0.08] },
    { pos: [0, 0.021, 4.3], size: [11, 0.01, 0.08] },
    { pos: [0, 0.021, 7.1], size: [11, 0.01, 0.08] }
  ];

  return (
    <>
      {lanePieces.map((piece, idx) => (
        <mesh key={idx} position={piece.pos}>
          <boxGeometry args={piece.size} />
          <meshStandardMaterial color="#c4d4df" emissive="#364956" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </>
  );
}

function ParkingSlot({ slot, onReserve }) {
  const [hovered, setHovered] = useState(false);
  const neonPadColor = slot.occupied ? "#ff6f88" : "#71ff9f";

  return (
    <group position={[slot.position[0], 0.5, slot.position[2]]}>
      <mesh position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.25, 3.2]} />
        <meshStandardMaterial
          color={neonPadColor}
          emissive={slot.occupied ? "#a20f2e" : "#17a74f"}
          emissiveIntensity={hovered ? 1.1 : 0.65}
          transparent
          opacity={0.4}
        />
      </mesh>

      <mesh position={[0, -0.46, 0]}>
        <boxGeometry args={[2.25, 0.02, 3.2]} />
        <meshStandardMaterial
          color={slot.occupied ? "#ff4f6f" : "#72ff9f"}
          emissive={slot.occupied ? "#910b28" : "#16884a"}
          emissiveIntensity={hovered ? 1.2 : 0.75}
        />
      </mesh>

      <mesh
        castShadow
        receiveShadow
        scale={hovered ? 1.08 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          if (!slot.occupied) {
            onReserve(slot.id);
          }
        }}
      >
        <boxGeometry args={[1.8, 1, 3]} />
        <meshStandardMaterial
          color={slot.occupied ? "red" : "green"}
          emissive={slot.occupied ? "#6b0000" : "#0f6410"}
          emissiveIntensity={hovered ? 0.8 : 0.45}
        />
      </mesh>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.32}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {slot.label}
      </Text>
    </group>
  );
}

function Scene({ slots, onReserve }) {
  return (
    <>
      <color attach="background" args={["#0a1226"]} />
      <fog attach="fog" args={["#0a1226", 14, 36]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <pointLight position={[-6, 5, -7]} intensity={22} color="#3cc9ff" distance={26} />
      <pointLight position={[7, 5, 6]} intensity={20} color="#7cffb6" distance={24} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      <LaneMarkings />
      <NeonBoundary />

      {slots.map((slot) => (
        <ParkingSlot key={slot.id} slot={slot} onReserve={onReserve} />
      ))}

      <OrbitControls enablePan={false} minDistance={7} maxDistance={18} target={[0, 0.35, 0]} maxPolarAngle={Math.PI * 0.49} />
    </>
  );
}

function ParkingSceneCore({ slots, onReserve }) {
  const safeSlots = useMemo(() => (Array.isArray(slots) ? slots : []), [slots]);

  return (
    <div className="parking-canvas" style={{ width: "100%", height: "100vh" }}>
      <Canvas
        shadows
        camera={{ position: [0, 6, 10], fov: 60 }}
        fallback={<div className="scene-loading">WebGL not supported on this browser.</div>}
      >
        <Scene slots={safeSlots} onReserve={onReserve} />
      </Canvas>
    </div>
  );
}

export default ParkingSceneCore;
