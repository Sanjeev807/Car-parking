import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const ENTRY_POINT = [0, 0.58, 9.2];
const ENTRY_BUFFER_Z = 6.6;
const MAIN_LANE_X = 0;
const SLOT_APPROACH_OFFSET_Z = 1.8;
const BASE_ANIMATION_SPEED = 0.24;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smoothStep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function headingBetween(from, to) {
  return Math.atan2(to[0] - from[0], to[2] - from[2]);
}

function smallestAngleDiff(a, b) {
  let diff = b - a;
  while (diff > Math.PI) {
    diff -= Math.PI * 2;
  }
  while (diff < -Math.PI) {
    diff += Math.PI * 2;
  }
  return Math.abs(diff);
}

function signedAngleDiff(from, to) {
  let diff = to - from;
  while (diff > Math.PI) {
    diff -= Math.PI * 2;
  }
  while (diff < -Math.PI) {
    diff += Math.PI * 2;
  }
  return diff;
}

function buildLanePath(targetSlot) {
  if (!targetSlot) {
    return [];
  }

  const targetX = targetSlot.position[0];
  const targetZ = targetSlot.position[2];
  const y = ENTRY_POINT[1];
  const approachZ = targetZ + SLOT_APPROACH_OFFSET_Z;

  const rawPoints = [
    ENTRY_POINT,
    [ENTRY_POINT[0], y, ENTRY_BUFFER_Z],
    [MAIN_LANE_X, y, ENTRY_BUFFER_Z],
    [MAIN_LANE_X, y, approachZ],
    [targetX, y, approachZ],
    [targetX, y, targetZ]
  ];

  return rawPoints.filter((point, index) => {
    if (index === 0) {
      return true;
    }

    const prev = rawPoints[index - 1];
    return point[0] !== prev[0] || point[2] !== prev[2];
  });
}

function samplePolyline(points, distances, totalDistance, progress) {
  const safeProgress = Math.max(0, Math.min(1, progress));

  if (safeProgress <= 0) {
    return points[0];
  }

  if (safeProgress >= 1) {
    return points[points.length - 1];
  }

  const distanceAtProgress = safeProgress * totalDistance;

  for (let index = 1; index < points.length; index += 1) {
    if (distanceAtProgress > distances[index]) {
      continue;
    }

    const segmentStartDistance = distances[index - 1];
    const segmentDistance = distances[index] - segmentStartDistance;
    const segmentProgress = segmentDistance === 0 ? 0 : (distanceAtProgress - segmentStartDistance) / segmentDistance;
    const from = points[index - 1];
    const to = points[index];

    return [
      from[0] + (to[0] - from[0]) * segmentProgress,
      from[1] + (to[1] - from[1]) * segmentProgress,
      from[2] + (to[2] - from[2]) * segmentProgress
    ];
  }

  return points[points.length - 1];
}

function CarModel({ motionRef = null }) {
  const bodyRef = useRef(null);
  const frontLeftWheelRef = useRef(null);
  const frontRightWheelRef = useRef(null);
  const rearLeftWheelRef = useRef(null);
  const rearRightWheelRef = useRef(null);

  useFrame((_, delta) => {
    const meta = motionRef?.current ?? { speed: 0, steer: 0 };
    const speed = Math.max(0, Math.min(1, meta.speed ?? 0));
    const steer = Math.max(-1, Math.min(1, meta.steer ?? 0));

    const spin = speed * delta * 24;

    [frontLeftWheelRef, frontRightWheelRef, rearLeftWheelRef, rearRightWheelRef].forEach((wheelRef) => {
      if (!wheelRef.current) {
        return;
      }
      wheelRef.current.rotation.x -= spin;
    });

    const frontSteerAngle = steer * 0.45;
    if (frontLeftWheelRef.current) {
      frontLeftWheelRef.current.rotation.y += (frontSteerAngle - frontLeftWheelRef.current.rotation.y) * 0.18;
    }
    if (frontRightWheelRef.current) {
      frontRightWheelRef.current.rotation.y += (frontSteerAngle - frontRightWheelRef.current.rotation.y) * 0.18;
    }

    if (bodyRef.current) {
      const bodyRoll = -steer * speed * 0.08;
      bodyRef.current.rotation.z += (bodyRoll - bodyRef.current.rotation.z) * 0.12;
    }
  });

  return (
    <group>
      <mesh ref={bodyRef} position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[1.4, 0.65, 2.4]} />
        <meshStandardMaterial color="#5e6f86" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.02, -0.08]} castShadow>
        <boxGeometry args={[1.02, 0.34, 1.25]} />
        <meshStandardMaterial color="#8093ad" metalness={0.72} roughness={0.24} />
      </mesh>
      <mesh position={[0, 1.03, -0.08]}>
        <boxGeometry args={[0.95, 0.25, 1.12]} />
        <meshStandardMaterial color="#1a3046" transparent opacity={0.58} />
      </mesh>

      <group ref={frontLeftWheelRef} position={[-0.68, 0.26, 0.86]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.22, 16]} />
          <meshStandardMaterial color="#090c13" roughness={0.9} metalness={0.2} />
        </mesh>
      </group>
      <group ref={frontRightWheelRef} position={[0.68, 0.26, 0.86]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.22, 16]} />
          <meshStandardMaterial color="#090c13" roughness={0.9} metalness={0.2} />
        </mesh>
      </group>
      <group ref={rearLeftWheelRef} position={[-0.68, 0.26, -0.86]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.22, 16]} />
          <meshStandardMaterial color="#090c13" roughness={0.9} metalness={0.2} />
        </mesh>
      </group>
      <group ref={rearRightWheelRef} position={[0.68, 0.26, -0.86]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.22, 16]} />
          <meshStandardMaterial color="#090c13" roughness={0.9} metalness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

function MovingBookingCar({ targetSlot, animateKey, onArrive }) {
  const carRef = useRef(null);
  const progressRef = useRef(0);
  const arrivedRef = useRef(false);
  const previousPointRef = useRef(ENTRY_POINT);
  const previousHeadingRef = useRef(0);
  const motionMetaRef = useRef({ speed: 0, steer: 0 });

  useEffect(() => {
    progressRef.current = 0;
    arrivedRef.current = false;
    previousPointRef.current = ENTRY_POINT;

    if (carRef.current) {
      carRef.current.position.set(ENTRY_POINT[0], ENTRY_POINT[1], ENTRY_POINT[2]);
      carRef.current.rotation.set(0, 0, 0);
    }
    previousHeadingRef.current = 0;
    motionMetaRef.current = { speed: 0, steer: 0 };
  }, [animateKey, targetSlot?.id]);

  const pathData = useMemo(() => {
    if (!targetSlot) {
      return null;
    }

    const lanePoints = buildLanePath(targetSlot);
    const curve = new THREE.CatmullRomCurve3(
      lanePoints.map((point) => new THREE.Vector3(point[0], point[1], point[2])),
      false,
      "centripetal"
    );

    const points = curve.getSpacedPoints(120).map((point) => [point.x, point.y, point.z]);

    points[0] = lanePoints[0];
    points[points.length - 1] = lanePoints[lanePoints.length - 1];

    const distances = [0];
    for (let index = 1; index < points.length; index += 1) {
      const prev = points[index - 1];
      const next = points[index];
      const segmentDistance = Math.hypot(next[0] - prev[0], next[2] - prev[2]);
      distances.push(distances[index - 1] + segmentDistance);
    }

    return {
      points,
      distances,
      totalDistance: distances[distances.length - 1],
      turnCenters: points.reduce((centers, _, index) => {
        if (index < 2 || index >= points.length - 1) {
          return centers;
        }

        const prev = points[index - 1];
        const current = points[index];
        const next = points[index + 1];

        const headingA = headingBetween(prev, current);
        const headingB = headingBetween(current, next);
        const angleDelta = smallestAngleDiff(headingA, headingB);

        if (angleDelta > 0.06) {
          centers.push(distances[index] / distances[distances.length - 1]);
        }

        return centers;
      }, [])
    };
  }, [targetSlot, animateKey]);

  useFrame((_, delta) => {
    if (!carRef.current || !pathData) {
      return;
    }

    const currentProgress = progressRef.current;
    const turnSlowdown = pathData.turnCenters.reduce((acc, center) => {
      const distance = Math.abs(currentProgress - center);
      if (distance > 0.08) {
        return acc;
      }
      const impact = 1 - distance / 0.08;
      return Math.min(acc, 1 - impact * 0.48);
    }, 1);

    const finalApproachSlowdown = 1 - smoothStep(0.78, 1, currentProgress) * 0.55;
    const speedMultiplier = Math.max(0.28, Math.min(turnSlowdown, finalApproachSlowdown));

    progressRef.current = Math.min(1, progressRef.current + delta * BASE_ANIMATION_SPEED * speedMultiplier);
    const currentPoint = samplePolyline(pathData.points, pathData.distances, pathData.totalDistance, progressRef.current);
    const previousPoint = previousPointRef.current;

    carRef.current.position.set(currentPoint[0], currentPoint[1], currentPoint[2]);

    const lookX = currentPoint[0] - previousPoint[0];
    const lookZ = currentPoint[2] - previousPoint[2];
    if (Math.abs(lookX) > 0.001 || Math.abs(lookZ) > 0.001) {
      const currentHeading = Math.atan2(lookX, lookZ);
      const headingDelta = signedAngleDiff(previousHeadingRef.current, currentHeading);
      const planarSpeed = Math.hypot(lookX, lookZ) / Math.max(delta, 0.0001);

      carRef.current.rotation.y = currentHeading;
      previousHeadingRef.current = currentHeading;
      motionMetaRef.current = {
        speed: Math.min(1, planarSpeed / 3.8),
        steer: Math.max(-1, Math.min(1, headingDelta / 0.35))
      };
    } else {
      motionMetaRef.current = { speed: 0, steer: 0 };
    }

    previousPointRef.current = currentPoint;

    if (progressRef.current >= 1 && !arrivedRef.current) {
      arrivedRef.current = true;
      motionMetaRef.current = { speed: 0, steer: 0 };
      onArrive?.(targetSlot.id);
    }
  });

  if (!targetSlot) {
    return null;
  }

  return (
    <group ref={carRef} position={ENTRY_POINT}>
      <CarModel motionRef={motionMetaRef} />
    </group>
  );
}

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

function ParkingSlot({ slot, onReserve, canReserve }) {
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
          if (!slot.occupied && canReserve) {
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

function Scene({ slots, onReserve, movingSlotId, movingCarKey, onCarArrive, canReserve }) {
  const movingTargetSlot = useMemo(
    () => slots.find((slot) => slot.id === movingSlotId),
    [slots, movingSlotId]
  );

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

      <Text position={[ENTRY_POINT[0], 1.2, ENTRY_POINT[2] + 1.3]} fontSize={0.35} color="#8ecbff" anchorX="center" anchorY="middle">
        Entry Gate
      </Text>

      {slots.map((slot) => (
        <ParkingSlot key={slot.id} slot={slot} onReserve={onReserve} canReserve={canReserve} />
      ))}

      {slots
        .filter((slot) => slot.occupied)
        .map((slot) => (
          <group key={`parked-${slot.id}`} position={[slot.position[0], 0, slot.position[2]]} rotation={[0, Math.PI, 0]}>
            <CarModel />
          </group>
        ))}

      <MovingBookingCar targetSlot={movingTargetSlot} animateKey={movingCarKey} onArrive={onCarArrive} />

      <OrbitControls enablePan={false} minDistance={7} maxDistance={18} target={[0, 0.35, 0]} maxPolarAngle={Math.PI * 0.49} />
    </>
  );
}

function ParkingSceneCore({ slots, onReserve, movingSlotId, movingCarKey, onCarArrive, canReserve = true }) {
  const safeSlots = useMemo(() => (Array.isArray(slots) ? slots : []), [slots]);

  return (
    <div className="parking-canvas" style={{ width: "100%", height: "100vh" }}>
      <Canvas
        shadows
        camera={{ position: [0, 6, 10], fov: 60 }}
        fallback={<div className="scene-loading">WebGL not supported on this browser.</div>}
      >
        <Scene
          slots={safeSlots}
          onReserve={onReserve}
          movingSlotId={movingSlotId}
          movingCarKey={movingCarKey}
          onCarArrive={onCarArrive}
          canReserve={canReserve}
        />
      </Canvas>
    </div>
  );
}

export default ParkingSceneCore;
