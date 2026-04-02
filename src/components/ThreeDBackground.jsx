import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function Particle({ position, speed }) {
  const mesh = useRef();
  const velocity = useRef([
    (Math.random() - 0.5) * speed,
    (Math.random() - 0.5) * speed,
    (Math.random() - 0.5) * speed
  ]);

  useFrame(() => {
    if (mesh.current) {
      mesh.current.position.x += velocity.current[0];
      mesh.current.position.y += velocity.current[1];
      mesh.current.position.z += velocity.current[2];

      // Bounce boundaries
      if (mesh.current.position.x > 100) velocity.current[0] *= -1;
      if (mesh.current.position.x < -100) velocity.current[0] *= -1;
      if (mesh.current.position.y > 100) velocity.current[1] *= -1;
      if (mesh.current.position.y < -100) velocity.current[1] *= -1;
      if (mesh.current.position.z > 100) velocity.current[2] *= -1;
      if (mesh.current.position.z < -100) velocity.current[2] *= -1;

      mesh.current.rotation.x += 0.01;
      mesh.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <octahedronGeometry args={[0.5]} />
      <meshStandardMaterial color="#0aa7ff" emissive="#06b6d4" emissiveIntensity={0.5} />
    </mesh>
  );
}

function RotatingBox({ position, rotation, scale }) {
  const mesh = useRef();

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.002;
      mesh.current.rotation.y += 0.003;
      mesh.current.rotation.z += 0.001;
    }
  });

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#0aa7ff"
        metalness={0.7}
        roughness={0.2}
        emissive="#06b6d4"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function AnimatedSphere() {
  const mesh = useRef();

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.001;
      mesh.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <sphereGeometry args={[15, 64, 64]} />
      <meshStandardMaterial
        color="#0aa7ff"
        wireframe
        emissive="#06b6d4"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      ],
      speed: 0.1 + Math.random() * 0.2
    }));
  }, []);

  return (
    <>
      {particles.map((particle) => (
        <Particle key={particle.id} position={particle.position} speed={particle.speed} />
      ))}
    </>
  );
}

function BackgroundElements() {
  return (
    <>
      {/* Animated central sphere */}
      <AnimatedSphere />

      {/* Rotating boxes */}
      <RotatingBox position={[40, 30, 40]} scale={[8, 8, 8]} />
      <RotatingBox position={[-50, -40, -50]} scale={[6, 6, 6]} />
      <RotatingBox position={[60, -50, 0]} scale={[5, 5, 5]} />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Lighting */}
      <ambientLight intensity={0.4} color="#0aa7ff" />
      <directionalLight position={[100, 100, 100]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-100, -100, -100]} intensity={0.6} color="#06b6d4" />
      <pointLight position={[50, 50, 50]} intensity={0.8} color="#0aa7ff" />
      <pointLight position={[-50, -50, -50]} intensity={0.6} color="#06b6d4" />
    </>
  );
}

export default function ThreeDBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <Canvas
        camera={{
          position: [0, 0, 80],
          fov: 75,
          near: 0.1,
          far: 2000
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)" }}
      >
        <BackgroundElements />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/70 pointer-events-none" />
    </div>
  );
}
