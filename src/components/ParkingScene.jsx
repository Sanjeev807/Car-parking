import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import ExitModal from "./ExitModal";

function AnimatedCar({ slot, animateExit, onExitComplete }) {
  const carGroup = useRef();
  const exitProgress = useRef(0);

  useFrame(() => {
    if (!animateExit || !carGroup.current) return;

    exitProgress.current += 0.015; // Smooth speed

    if (exitProgress.current <= 1) {
      // Smooth easing function for natural motion
      const easeProgress = exitProgress.current < 0.5 
        ? 2 * exitProgress.current * exitProgress.current 
        : -1 + (4 - 2 * exitProgress.current) * exitProgress.current;

      // Move car from slot to exit lane
      const startX = 0; // Relative to slot group
      const endX = 16 - slot.position.x; // Relative movement to exit lane
      const startZ = 0;
      const endZ = 0;

      carGroup.current.position.x = startX + (endX - startX) * easeProgress;
      carGroup.current.position.z = startZ + (endZ - startZ) * easeProgress;

      // Fade out smoothly
      if (carGroup.current.children) {
        carGroup.current.children.forEach((child) => {
          if (child.material) {
            child.material.opacity = Math.max(0, 1 - exitProgress.current);
          }
        });
      }
    } else {
      exitProgress.current = 0;
      onExitComplete?.();
    }
  });

  return (
    <group ref={carGroup} position={[0, 0.05, 0]} rotation={[0, Math.PI, 0]}>
      {/* Car body */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.7, 2.4]} />
        <meshStandardMaterial 
          color="#7b8ca6" 
          metalness={0.65} 
          roughness={0.3} 
          transparent 
          opacity={1}
        />
      </mesh>
      
      {/* Car top/cabin */}
      <mesh position={[0, 1.06, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.32, 1.2]} />
        <meshStandardMaterial 
          color="#9aaed0" 
          metalness={0.6} 
          roughness={0.24} 
          transparent 
          opacity={1}
        />
      </mesh>
    </group>
  );
}

function SlotMesh({ slot, onReserve, onExitClick, exitingSlotId, animatingSlots }) {
  const occupied = Boolean(slot.occupied);
  const isExiting = exitingSlotId === slot.slotId;
  const isAnimating = animatingSlots.has(slot.slotId);

  return (
    <group position={[slot.position.x, 0.55, slot.position.z]}>
      <mesh
        castShadow
        receiveShadow
        onClick={() => {
          if (!occupied) {
            onReserve(slot.slotId);
          } else {
            onExitClick(slot.slotId);
          }
        }}
      >
        <boxGeometry args={[2.2, 1, 3.6]} />
        <meshStandardMaterial
          color={occupied ? "#ef4444" : "#10b981"}
          emissive={occupied ? isExiting ? "#fbbf24" : "#7f1d1d" : "#064e3b"}
          emissiveIntensity={occupied ? isExiting ? 1.5 : 0.75 : 0.75}
        />
      </mesh>

      {occupied && !isAnimating && (
        <group position={[0, 0.05, 0]} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 0.72, 0]} castShadow>
            <boxGeometry args={[1.4, 0.7, 2.4]} />
            <meshStandardMaterial color="#7b8ca6" metalness={0.65} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.06, -0.1]} castShadow>
            <boxGeometry args={[1.1, 0.32, 1.2]} />
            <meshStandardMaterial color="#9aaed0" metalness={0.6} roughness={0.24} />
          </mesh>
        </group>
      )}

      {isExiting && (
        <AnimatedCar
          slot={slot}
          animateExit={isExiting}
          onExitComplete={() => {}}
        />
      )}
    </group>
  );
}

function ExitLane() {
  return (
    <>
      {/* Exit lane ground */}
      <mesh position={[16, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 30]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Exit lane border - left */}
      <mesh position={[14.8, 0.5, 0]}>
        <boxGeometry args={[0.2, 1, 30]} />
        <meshStandardMaterial color="#10b981" emissive="#064e3b" emissiveIntensity={0.5} />
      </mesh>

      {/* Exit lane border - right */}
      <mesh position={[17.2, 0.5, 0]}>
        <boxGeometry args={[0.2, 1, 30]} />
        <meshStandardMaterial color="#10b981" emissive="#064e3b" emissiveIntensity={0.5} />
      </mesh>

      {/* Exit sign */}
      <mesh position={[16, 2, -15]}>
        <boxGeometry args={[2, 1.5, 0.2]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
    </>
  );
}

function ParkingScene({ slots = [], onReserve, onExit, height = "540px" }) {
  const [exitingSlotId, setExitingSlotId] = useState(null);
  const [animatingSlots, setAnimatingSlots] = useState(new Set());
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!slots || slots.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-slate-800 flex items-center justify-center" style={{ height }}>
        <div className="text-slate-400">Loading parking slots...</div>
      </div>
    );
  }

  const handleExitClick = (slotId) => {
    const slot = slots.find((s) => s.slotId === slotId);
    if (slot && slot.occupied) {
      setSelectedSlot(slot);
      setShowExitModal(true);
    }
  };

  const handleExitConfirm = async () => {
    if (selectedSlot) {
      setExitingSlotId(selectedSlot.slotId);
      setAnimatingSlots((prev) => new Set(prev).add(selectedSlot.slotId));
      setShowExitModal(false);

      // Simulate exit animation duration
      setTimeout(() => {
        onExit?.(selectedSlot.slotId);
        setExitingSlotId(null);

        // Keep slot in animating state for a bit longer
        setTimeout(() => {
          setAnimatingSlots((prev) => {
            const newSet = new Set(prev);
            newSet.delete(selectedSlot.slotId);
            return newSet;
          });
        }, 500);
      }, 2000);
    }
  };

  return (
    <>
      <div className="w-full overflow-hidden rounded-2xl border border-slate-800" style={{ height }}>
        <Canvas shadows camera={{ position: [0, 10, 15], fov: 55 }}>
          <color attach="background" args={["#020617"]} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[8, 12, 6]} intensity={1.5} castShadow />

          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[32, 30]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>

          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3.2, 12.8, 64]} />
            <meshBasicMaterial color="#0aa7ff" transparent opacity={0.18} />
          </mesh>

          {/* Parking slots */}
          {slots.map((slot) => (
            <SlotMesh
              key={slot.slotId}
              slot={slot}
              onReserve={onReserve}
              onExitClick={handleExitClick}
              exitingSlotId={exitingSlotId}
              animatingSlots={animatingSlots}
            />
          ))}

          {/* Exit lane */}
          <ExitLane />

          <OrbitControls enablePan={false} minDistance={10} maxDistance={22} maxPolarAngle={Math.PI / 2.1} />
        </Canvas>
      </div>

      {/* Exit confirmation modal */}
      <ExitModal
        isOpen={showExitModal}
        slotId={selectedSlot?.slotId}
        userName={selectedSlot?.user}
        carNumber={selectedSlot?.carNumber}
        onConfirm={handleExitConfirm}
        onCancel={() => setShowExitModal(false)}
      />
    </>
  );
}

export default ParkingScene;
