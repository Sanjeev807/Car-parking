import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Line, OrbitControls, Text } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";

const ENTRY_POINT = [0, 0.2, -26];
const SLOT_SIZE = { width: 3.6, depth: 6 };
const SLOT_GAP = { x: 4.6, z: 7.4 };
const PILLAR_CLEARANCE = 1.4;
const ROAD_CLEARANCE = 0.6;
const CAR_MIN_DISTANCE = 4.8;

const PILLARS = [
  { x: -12, y: 4, z: -10, width: 1.6, depth: 1.6 },
  { x: 0, y: 4, z: -10, width: 1.6, depth: 1.6 },
  { x: 12, y: 4, z: -10, width: 1.6, depth: 1.6 },
  { x: -12, y: 4, z: 0, width: 1.6, depth: 1.6 },
  { x: 0, y: 4, z: 0, width: 1.6, depth: 1.6 },
  { x: 12, y: 4, z: 0, width: 1.6, depth: 1.6 },
  { x: -12, y: 4, z: 10, width: 1.6, depth: 1.6 },
  { x: 0, y: 4, z: 10, width: 1.6, depth: 1.6 },
  { x: 12, y: 4, z: 10, width: 1.6, depth: 1.6 }
];

const ZONES = {
  ROAD: [
    { xMin: -6, xMax: 6, zMin: -30, zMax: 30 },
    { xMin: -30, xMax: 30, zMin: -6, zMax: 6 },
    { xMin: -26, xMax: 26, zMin: -30, zMax: -22 },
    { xMin: -26, xMax: 26, zMin: 22, zMax: 30 }
  ],
  PARKING: [
    { xMin: -26, xMax: -8, zMin: -22, zMax: 22, level: "L1" },
    { xMin: 8, xMax: 26, zMin: -22, zMax: 22, level: "L1" }
  ],
  BLOCKED: PILLARS.map((pillar) => ({
    xMin: pillar.x - pillar.width / 2,
    xMax: pillar.x + pillar.width / 2,
    zMin: pillar.z - pillar.depth / 2,
    zMax: pillar.z + pillar.depth / 2
  }))
};

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const isInsideZone = (x, z, zone, padding = 0) =>
  x >= zone.xMin - padding && x <= zone.xMax + padding && z >= zone.zMin - padding && z <= zone.zMax + padding;

const isInsideAnyZone = (x, z, zones, padding = 0) => zones.some((zone) => isInsideZone(x, z, zone, padding));

const isInsidePillar = (x, z, padding = 0) => isInsideAnyZone(x, z, ZONES.BLOCKED, padding);

const isInsideRoad = (x, z, padding = 0) => isInsideAnyZone(x, z, ZONES.ROAD, padding);

const isInsideParkingZone = (x, z, padding = 0) => isInsideAnyZone(x, z, ZONES.PARKING, padding);

const isValidSlotPosition = (x, z) => {
  const slotPadding = Math.max(SLOT_SIZE.width, SLOT_SIZE.depth) / 2 + PILLAR_CLEARANCE;
  return isInsideParkingZone(x, z) && !isInsideRoad(x, z, ROAD_CLEARANCE) && !isInsidePillar(x, z, slotPadding);
};

const distance2D = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);

const isTooClose = (carA, carB, minDistance = CAR_MIN_DISTANCE) => distance2D(carA, carB) < minDistance;

const getTrafficSignalState = (elapsedTime) => {
  const cycle = elapsedTime % 12;

  if (cycle < 5) {
    return { ns: "green", ew: "red" };
  }

  if (cycle < 6) {
    return { ns: "yellow", ew: "red" };
  }

  if (cycle < 11) {
    return { ns: "red", ew: "green" };
  }

  return { ns: "red", ew: "yellow" };
};

const getDirectionGroup = (currentPos, nextPos) => {
  const dx = Math.abs(nextPos[0] - currentPos[0]);
  const dz = Math.abs(nextPos[2] - currentPos[2]);
  return dz >= dx ? "ns" : "ew";
};

const shouldYieldAtIntersection = (currentPos, nextPos, directionGroup, signalState) => {
  if (signalState[directionGroup] !== "red") {
    return false;
  }

  if (directionGroup === "ns") {
    const insideStopBand = Math.abs(currentPos[0]) <= 4 && Math.abs(currentPos[2]) >= 4.2 && Math.abs(currentPos[2]) <= 8;
    return insideStopBand && Math.abs(nextPos[2]) < Math.abs(currentPos[2]);
  }

  const insideStopBand = Math.abs(currentPos[2]) <= 4 && Math.abs(currentPos[0]) >= 4.2 && Math.abs(currentPos[0]) <= 8;
  return insideStopBand && Math.abs(nextPos[0]) < Math.abs(currentPos[0]);
};

const generateParkingSlots = () => {
  const generated = [];

  ZONES.PARKING.forEach((zone) => {
    for (let z = zone.zMin + SLOT_SIZE.depth / 2; z <= zone.zMax - SLOT_SIZE.depth / 2; z += SLOT_GAP.z) {
      for (let x = zone.xMin + SLOT_SIZE.width / 2; x <= zone.xMax - SLOT_SIZE.width / 2; x += SLOT_GAP.x) {
        if (!isValidSlotPosition(x, z)) {
          continue;
        }

        generated.push({
          position: [Number(x.toFixed(2)), 0.25, Number(z.toFixed(2))],
          level: zone.level,
          status: "free",
          bookedBy: ""
        });
      }
    }
  });

  const preOccupied = new Set([0, 2, 5, 8]);

  return generated.slice(0, 20).map((slot, index) => ({
    ...slot,
    id: `P${index + 1}`,
    status: preOccupied.has(index) ? "occupied" : "free",
    bookedBy: preOccupied.has(index) ? "PRE-BOOKED" : ""
  }));
};

const cleanSlots = (slots) => {
  const unique = new Set();

  return slots
    .filter((slot) => isValidSlotPosition(slot.position[0], slot.position[2]))
    .filter((slot) => {
      const key = `${Math.round(slot.position[0] * 10)}:${Math.round(slot.position[2] * 10)}`;
      if (unique.has(key)) {
        return false;
      }
      unique.add(key);
      return true;
    })
    .map((slot, index) => ({ ...slot, id: `P${index + 1}` }));
};

const ROAD_PATHS = [
  [
    [-3, 0.25, -26],
    [-3, 0.25, 26],
    [3, 0.25, 26],
    [3, 0.25, -26],
    [-3, 0.25, -26]
  ],
  [
    [-26, 0.25, -3],
    [26, 0.25, -3],
    [26, 0.25, 3],
    [-26, 0.25, 3],
    [-26, 0.25, -3]
  ]
];

const samplePath = (path, t) => {
  const clamped = clamp01(t);
  const segments = path.length - 1;
  const segFloat = clamped * segments;
  const segIndex = Math.min(Math.floor(segFloat), segments - 1);
  const local = segFloat - segIndex;
  const from = path[segIndex];
  const to = path[segIndex + 1];

  return [
    from[0] + (to[0] - from[0]) * local,
    from[1] + (to[1] - from[1]) * local,
    from[2] + (to[2] - from[2]) * local
  ];
};

const buildBookingPath = (slotPosition) => [
  ENTRY_POINT,
  [ENTRY_POINT[0], 0.25, slotPosition[2] + 4],
  [slotPosition[0], 0.25, slotPosition[2] + 4],
  [slotPosition[0], 0.25, slotPosition[2]]
];

const samplePolyline = (points, progress) => {
  const clamped = clamp01(progress);
  const segments = points.length - 1;
  const segFloat = clamped * segments;
  const segIndex = Math.min(Math.floor(segFloat), segments - 1);
  const local = segFloat - segIndex;
  const from = points[segIndex];
  const to = points[segIndex + 1];

  return [
    from[0] + (to[0] - from[0]) * local,
    from[1] + (to[1] - from[1]) * local,
    from[2] + (to[2] - from[2]) * local
  ];
};

const CameraController = ({ isTransitioning }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (!isTransitioning) {
      return;
    }

    camera.position.set(34, 28, 34);
    camera.lookAt(0, 0, 0);

    gsap.to(camera.position, {
      x: 0,
      y: 16,
      z: 32,
      duration: 2.3,
      ease: "power3.inOut",
      onUpdate: () => camera.lookAt(0, 0, 0)
    });
  }, [isTransitioning, camera]);

  return null;
};

const NeonBox = ({ position, color, size = [3.7, 0.08, 6] }) => {
  const materialRef = useRef(null);

  useFrame(({ clock }) => {
    if (!materialRef.current) {
      return;
    }

    materialRef.current.emissiveIntensity = 0.55 + 0.35 * Math.sin(clock.elapsedTime * 6);
  });

  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        ref={materialRef}
        color="#101318"
        emissive={new THREE.Color(color)}
        emissiveIntensity={0.65}
        roughness={0.12}
        metalness={0.7}
        transparent
        opacity={0.45}
      />
    </mesh>
  );
};

const CarModel = ({ opacity = 1, isBraking = false }) => {
  const brakeLightRef = useRef(null);

  useFrame(() => {
    if (brakeLightRef.current) {
      if (isBraking) {
        brakeLightRef.current.emissiveIntensity = 0.8 + 0.3 * Math.sin(Date.now() * 0.008);
      } else {
        brakeLightRef.current.emissiveIntensity = 0.05;
      }
    }
  });

  return (
    <group>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[2.4, 0.86, 5]} />
        <meshStandardMaterial
          color="#5e6f86"
          metalness={0.78}
          roughness={0.3}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0, 1.26, -0.1]} castShadow>
        <boxGeometry args={[1.8, 0.52, 2.5]} />
        <meshStandardMaterial color="#7f93ad" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.27, -0.1]}>
        <boxGeometry args={[1.7, 0.36, 2.3]} />
        <meshStandardMaterial color="#1a3046" transparent opacity={0.58} />
      </mesh>
      <mesh position={[-1.1, 0.58, -2.35]} castShadow>
        <boxGeometry args={[0.35, 0.28, 0.12]} />
        <meshStandardMaterial
          ref={brakeLightRef}
          color="#8b0000"
          emissive="#ff1a1a"
          emissiveIntensity={0.05}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[1.1, 0.58, -2.35]} castShadow>
        <boxGeometry args={[0.35, 0.28, 0.12]} />
        <meshStandardMaterial
          ref={brakeLightRef}
          color="#8b0000"
          emissive="#ff1a1a"
          emissiveIntensity={0.05}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      {[
        [-1.05, 0.3, 1.75],
        [1.05, 0.3, 1.75],
        [-1.05, 0.3, -1.75],
        [1.05, 0.3, -1.75]
      ].map((wheel, idx) => (
        <mesh key={idx} position={wheel} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.34, 18]} />
          <meshStandardMaterial color="#090c13" roughness={0.9} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

const ParkingSlot = ({ slot, onClick, canInteract }) => {
  const isOccupied = slot.status === "occupied";
  const color = isOccupied ? "#ff2e4d" : "#0ff180";

  return (
    <group position={slot.position}>
      <NeonBox position={[0, 0.05, 0]} color={color} />
      <mesh
        onClick={() => !isOccupied && canInteract && onClick(slot.id)}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <planeGeometry args={[SLOT_SIZE.width, SLOT_SIZE.depth]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isOccupied ? 0.9 : 0.45} transparent opacity={0.22} />
      </mesh>

      <Text
        position={[0, 0.12, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.38}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {slot.id}
      </Text>

      <Text
        position={[0, 0.12, 1.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color={color}
        maxWidth={4.8}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {slot.status === "occupied" ? `${slot.level} OCCUPIED\n${slot.bookedBy || "RESERVED"}` : `${slot.level} AVAILABLE`}
      </Text>

      {isOccupied && (
        <group position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
          <CarModel isBraking={false} />
        </group>
      )}
    </group>
  );
};

const RoadZones = () => (
  <group>
    {ZONES.ROAD.map((zone, idx) => (
      <mesh
        key={idx}
        position={[(zone.xMin + zone.xMax) / 2, 0.05, (zone.zMin + zone.zMax) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[zone.xMax - zone.xMin, zone.zMax - zone.zMin]} />
        <meshStandardMaterial color="#131b27" metalness={0.68} roughness={0.32} />
      </mesh>
    ))}

    {[-3, 3].map((x) => (
      <mesh key={x} position={[x, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 58]} />
        <meshStandardMaterial color="#0aa7ff" emissive="#0aa7ff" emissiveIntensity={0.9} />
      </mesh>
    ))}

    {[-3, 3].map((z) => (
      <mesh key={`hz-${z}`} position={[0, 0.06, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[58, 0.2]} />
        <meshStandardMaterial color="#0aa7ff" emissive="#0aa7ff" emissiveIntensity={0.9} />
      </mesh>
    ))}
  </group>
);

const LaneDirectionArrows = () => {
  const arrows = [
    { position: [-3, 0.2, -16], rotation: [Math.PI / 2, 0, 0] },
    { position: [-3, 0.2, 16], rotation: [Math.PI / 2, 0, 0] },
    { position: [3, 0.2, -16], rotation: [-Math.PI / 2, 0, 0] },
    { position: [3, 0.2, 16], rotation: [-Math.PI / 2, 0, 0] },
    { position: [-16, 0.2, -3], rotation: [Math.PI / 2, 0, -Math.PI / 2] },
    { position: [16, 0.2, -3], rotation: [Math.PI / 2, 0, -Math.PI / 2] },
    { position: [-16, 0.2, 3], rotation: [Math.PI / 2, 0, Math.PI / 2] },
    { position: [16, 0.2, 3], rotation: [Math.PI / 2, 0, Math.PI / 2] }
  ];

  return (
    <group>
      {arrows.map((arrow, idx) => (
        <mesh key={idx} position={arrow.position} rotation={arrow.rotation}>
          <coneGeometry args={[0.42, 1, 12]} />
          <meshStandardMaterial color="#00c0ff" emissive="#00c0ff" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

const StopAndCrosswalkMarkings = () => {
  const nsStopRefs = useRef([]);
  const ewStopRefs = useRef([]);

  useFrame(({ clock }) => {
    const state = getTrafficSignalState(clock.elapsedTime);

    nsStopRefs.current.forEach((mat) => {
      if (!mat) {
        return;
      }
      mat.emissiveIntensity = state.ns === "red" ? 0.62 : state.ns === "yellow" ? 0.34 : 0.12;
    });

    ewStopRefs.current.forEach((mat) => {
      if (!mat) {
        return;
      }
      mat.emissiveIntensity = state.ew === "red" ? 0.62 : state.ew === "yellow" ? 0.34 : 0.12;
    });
  });

  const stopLines = [
    { position: [0, 0.08, -8.4], size: [8.6, 0.38], group: "ns" },
    { position: [0, 0.08, 8.4], size: [8.6, 0.38], group: "ns" },
    { position: [-8.4, 0.08, 0], size: [0.38, 8.6], group: "ew" },
    { position: [8.4, 0.08, 0], size: [0.38, 8.6], group: "ew" }
  ];

  const crosswalkStrips = [];

  for (let i = -3; i <= 3; i += 1) {
    crosswalkStrips.push({ position: [i * 1.08, 0.08, -6.9], size: [0.55, 1.15] });
    crosswalkStrips.push({ position: [i * 1.08, 0.08, 6.9], size: [0.55, 1.15] });
    crosswalkStrips.push({ position: [-6.9, 0.08, i * 1.08], size: [1.15, 0.55] });
    crosswalkStrips.push({ position: [6.9, 0.08, i * 1.08], size: [1.15, 0.55] });
  }

  return (
    <group>
      {stopLines.map((line, idx) => (
        <mesh key={`stop-${idx}`} position={line.position} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={line.size} />
          <meshStandardMaterial
            ref={(material) => {
              if (line.group === "ns") {
                nsStopRefs.current[idx] = material;
                return;
              }
              ewStopRefs.current[idx] = material;
            }}
            color="#e8eefc"
            emissive="#b8cfff"
            emissiveIntensity={0.12}
          />
        </mesh>
      ))}

      {crosswalkStrips.map((strip, idx) => (
        <mesh key={`walk-${idx}`} position={strip.position} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={strip.size} />
          <meshStandardMaterial color="#f9fcff" emissive="#d3e6ff" emissiveIntensity={0.12} />
        </mesh>
      ))}
    </group>
  );
};

const TrafficSignals = () => {
  const nsRedRef = useRef(null);
  const nsYellowRef = useRef(null);
  const nsGreenRef = useRef(null);
  const ewRedRef = useRef(null);
  const ewYellowRef = useRef(null);
  const ewGreenRef = useRef(null);

  useFrame(({ clock }) => {
    const state = getTrafficSignalState(clock.elapsedTime);

    const setSignal = (ref, active) => {
      if (!ref.current) {
        return;
      }
      ref.current.emissiveIntensity = active ? 1.2 : 0.08;
    };

    setSignal(nsRedRef, state.ns === "red");
    setSignal(nsYellowRef, state.ns === "yellow");
    setSignal(nsGreenRef, state.ns === "green");
    setSignal(ewRedRef, state.ew === "red");
    setSignal(ewYellowRef, state.ew === "yellow");
    setSignal(ewGreenRef, state.ew === "green");
  });

  return (
    <group>
      {[[-6.5, 0, -6.5], [6.5, 0, 6.5]].map((pole, idx) => (
        <group key={idx} position={pole}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 2.8, 10]} />
            <meshStandardMaterial color="#4d5669" />
          </mesh>
        </group>
      ))}

      <group position={[-5.8, 2.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.2, 10, 10]} /><meshStandardMaterial ref={nsRedRef} color="#ff394f" emissive="#ff394f" emissiveIntensity={0.08} /></mesh>
        <mesh position={[0, 0, 0]}><sphereGeometry args={[0.2, 10, 10]} /><meshStandardMaterial ref={nsYellowRef} color="#ffd447" emissive="#ffd447" emissiveIntensity={0.08} /></mesh>
        <mesh position={[0, -0.5, 0]}><sphereGeometry args={[0.2, 10, 10]} /><meshStandardMaterial ref={nsGreenRef} color="#4dff83" emissive="#4dff83" emissiveIntensity={0.08} /></mesh>
      </group>

      <group position={[0, 2.1, -5.8]} rotation={[0, 0, 0]}>
        <mesh position={[0.5, 0, 0]}><sphereGeometry args={[0.2, 10, 10]} /><meshStandardMaterial ref={ewRedRef} color="#ff394f" emissive="#ff394f" emissiveIntensity={0.08} /></mesh>
        <mesh position={[0, 0, 0]}><sphereGeometry args={[0.2, 10, 10]} /><meshStandardMaterial ref={ewYellowRef} color="#ffd447" emissive="#ffd447" emissiveIntensity={0.08} /></mesh>
        <mesh position={[-0.5, 0, 0]}><sphereGeometry args={[0.2, 10, 10]} /><meshStandardMaterial ref={ewGreenRef} color="#4dff83" emissive="#4dff83" emissiveIntensity={0.08} /></mesh>
      </group>
    </group>
  );
};

const LaneCars = ({ parkedCars }) => {
  const carsRef = useRef([
    { id: "C1", pathIndex: 0, t: 0.05, speed: 0.045, opacity: 0.8, isBraking: false },
    { id: "C2", pathIndex: 0, t: 0.52, speed: 0.04, opacity: 0.75, isBraking: false },
    { id: "C3", pathIndex: 1, t: 0.28, speed: 0.05, opacity: 0.85, isBraking: false }
  ]);

  const [, forceTick] = useState(0);

  useFrame((state, delta) => {
    const signalState = getTrafficSignalState(state.clock.elapsedTime);
    const previousPositions = [];

    carsRef.current = carsRef.current.map((car) => {
      const path = ROAD_PATHS[car.pathIndex];
      const currentPos = samplePath(path, car.t);
      const nextT = (car.t + car.speed * delta) % 1;
      const nextPos = samplePath(path, nextT);
      const directionGroup = getDirectionGroup(currentPos, nextPos);

      const inRoad = isInsideRoad(nextPos[0], nextPos[2], 0.2);
      const inBlocked = isInsidePillar(nextPos[0], nextPos[2], 1.3);
      const mustYield = shouldYieldAtIntersection(currentPos, nextPos, directionGroup, signalState);
      const tooCloseToLaneCar = previousPositions.some((other) => isTooClose(nextPos, other));
      const tooCloseToParked = parkedCars.some((parked) => isTooClose(nextPos, parked, 5));

      const isBraking = mustYield || tooCloseToLaneCar || tooCloseToParked;

      if (!inRoad || inBlocked || mustYield || tooCloseToLaneCar || tooCloseToParked) {
        previousPositions.push(currentPos);
        return { ...car, isBraking };
      }

      previousPositions.push(nextPos);
      return { ...car, t: nextT, isBraking: false };
    });

    forceTick((v) => (v + 1) % 10000);
  });

  return (
    <>
      {carsRef.current.map((car) => {
        const path = ROAD_PATHS[car.pathIndex];
        const position = samplePath(path, car.t);
        const lookAhead = samplePath(path, (car.t + 0.01) % 1);
        const rotationY = Math.atan2(lookAhead[0] - position[0], lookAhead[2] - position[2]);

        return (
          <group key={car.id} position={position} rotation={[0, rotationY, 0]}>
            <CarModel opacity={car.opacity} isBraking={car.isBraking} />
          </group>
        );
      })}
    </>
  );
};

const BookingCarAnimation = ({ targetSlot, animationKey, onArrive }) => {
  const carRef = useRef(null);
  const progressRef = useRef(0);
  const previousPointRef = useRef(ENTRY_POINT);
  const arrivedRef = useRef(false);

  const path = useMemo(() => {
    if (!targetSlot) {
      return null;
    }
    return buildBookingPath(targetSlot.position);
  }, [targetSlot, animationKey]);

  useEffect(() => {
    progressRef.current = 0;
    previousPointRef.current = ENTRY_POINT;
    arrivedRef.current = false;

    if (carRef.current) {
      carRef.current.position.set(ENTRY_POINT[0], ENTRY_POINT[1], ENTRY_POINT[2]);
      carRef.current.rotation.set(0, 0, 0);
    }
  }, [animationKey, targetSlot?.id]);

  useFrame((_, delta) => {
    if (!carRef.current || !path) {
      return;
    }

    progressRef.current = Math.min(1, progressRef.current + delta * 0.24);
    const currentPoint = samplePolyline(path, progressRef.current);
    const previousPoint = previousPointRef.current;

    carRef.current.position.set(currentPoint[0], currentPoint[1], currentPoint[2]);

    const dx = currentPoint[0] - previousPoint[0];
    const dz = currentPoint[2] - previousPoint[2];
    if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
      carRef.current.rotation.y = Math.atan2(dx, dz);
    }

    previousPointRef.current = currentPoint;

    if (progressRef.current >= 1 && !arrivedRef.current) {
      arrivedRef.current = true;
      onArrive?.(targetSlot.id);
    }
  });

  if (!targetSlot) {
    return null;
  }

  return (
    <group ref={carRef} position={ENTRY_POINT}>
      <CarModel isBraking={false} />
    </group>
  );
};

export default function SmartParkingDashboard({ bookingDetails, onClose, onSlotBooked }) {
  const [triggerAnimation, setTriggerAnimation] = useState(false);
  const [slots, setSlots] = useState(() => cleanSlots(generateParkingSlots()));
  const [bookingAnimation, setBookingAnimation] = useState(null);
  const [bookingAnimationKey, setBookingAnimationKey] = useState(0);

  useEffect(() => {
    setTriggerAnimation(true);
  }, []);

  useEffect(() => {
    if (!bookingDetails?.slotId) {
      return;
    }

    setSlots((prev) =>
      cleanSlots(
        prev.map((slot) => (slot.id === bookingDetails.slotId ? { ...slot, status: "occupied" } : slot))
      )
    );
  }, [bookingDetails?.slotId]);

  const handleBookSlot = (id) => {
    if (!bookingDetails) {
      alert("Please enter booking details first.");
      return;
    }

    if (bookingDetails.slotId) {
      alert(`You already booked slot ${bookingDetails.slotId}. One person can book only one slot.`);
      return;
    }

    if (bookingAnimation) {
      return;
    }

    const selected = slots.find((slot) => slot.id === id);
    if (!selected || selected.status !== "free") {
      alert("Selected slot is not available.");
      return;
    }

    const confirmBooking = window.confirm(`Do you want to book slot ${id}?`);
    if (!confirmBooking) {
      return;
    }

    setBookingAnimation({ slotId: id });
    setBookingAnimationKey((prev) => prev + 1);
  };

  const handleBookingAnimationArrive = (slotId) => {
    setSlots((prev) =>
      cleanSlots(
        prev.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                status: "occupied",
                bookedBy: `${bookingDetails.userName} - ${bookingDetails.carNumber}`
              }
            : slot
        )
      )
    );

    setBookingAnimation(null);
    onSlotBooked?.(slotId);
  };

  const occupiedCount = slots.filter((slot) => slot.status === "occupied").length;

  const nearestFreeSlot = slots
    .filter((slot) => slot.status === "free")
    .reduce((best, slot) => {
      if (!best) {
        return slot;
      }

      const bestDistance = Math.hypot(best.position[0] - ENTRY_POINT[0], best.position[2] - ENTRY_POINT[2]);
      const slotDistance = Math.hypot(slot.position[0] - ENTRY_POINT[0], slot.position[2] - ENTRY_POINT[2]);
      return slotDistance < bestDistance ? slot : best;
    }, null);

  const parkedCars = useMemo(
    () => slots.filter((slot) => slot.status === "occupied").map((slot) => slot.position),
    [slots]
  );

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0f16", position: "relative" }}>
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 10, color: "white", fontFamily: "sans-serif" }}>
        <h1 style={{ margin: 0, fontSize: "2rem", textShadow: "0 2px 10px rgba(0,255,136,0.5)" }}>Smart Park Live</h1>
        <p style={{ color: "#88a0b5", margin: "0.45rem 0" }}>Road and parking zones are now separated and pillar-safe.</p>
        {bookingDetails && (
          <p style={{ color: "#cfe7ff", margin: 0 }}>
            {bookingDetails.userName} - {bookingDetails.carNumber} - {bookingDetails.parkingDuration} H
          </p>
        )}
        {bookingDetails?.slotId && <p style={{ color: "#7bffb8", margin: "0.4rem 0 0" }}>Booked Slot: {bookingDetails.slotId}</p>}
      </div>

      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10, color: "#fff", fontFamily: "sans-serif", textAlign: "right" }}>
        <button
          onClick={onClose}
          style={{
            border: "1px solid rgba(255,255,255,0.24)",
            borderRadius: "999px",
            padding: "0.45rem 0.9rem",
            background: "rgba(9,16,28,0.7)",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Back
        </button>
        <p style={{ marginTop: "0.5rem", color: "#8fd0ff" }}>Free: {slots.length - occupiedCount} | Occupied: {occupiedCount}</p>
      </div>

      <Canvas shadows camera={{ position: [34, 28, 34], fov: 45 }}>
        <CameraController isTransitioning={triggerAnimation} />

        <OrbitControls
          enablePan={true}
          enableRotate={true}
          enableDamping
          dampingFactor={0.08}
          target={[0, 2, 0]}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 2}
          minDistance={12}
          maxDistance={90}
        />

        <ambientLight intensity={0.44} />
        <directionalLight
          position={[20, 40, 18]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-14, 10, -16]} color="#00b3ff" intensity={1.2} />
        <pointLight position={[14, 10, 16]} color="#00ff88" intensity={0.9} />
        <Environment preset="city" />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.03, 0]}>
          <planeGeometry args={[160, 160]} />
          <meshStandardMaterial color="#0d1220" roughness={0.85} />
        </mesh>

        <RoadZones />
        <LaneDirectionArrows />
        <StopAndCrosswalkMarkings />
        <TrafficSignals />

        {ZONES.PARKING.map((zone, idx) => (
          <mesh
            key={idx}
            position={[(zone.xMin + zone.xMax) / 2, 0.04, (zone.zMin + zone.zMax) / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[zone.xMax - zone.xMin, zone.zMax - zone.zMin]} />
            <meshStandardMaterial color="#1b2231" roughness={0.72} metalness={0.4} />
          </mesh>
        ))}

        {PILLARS.map((pillar, idx) => (
          <mesh key={idx} position={[pillar.x, pillar.y, pillar.z]} castShadow>
            <boxGeometry args={[pillar.width, 8, pillar.depth]} />
            <meshStandardMaterial color="#596077" roughness={0.35} metalness={0.35} />
          </mesh>
        ))}

        <Text position={[0, 2.2, -26]} fontSize={1.05} color="#86d4ff" outlineWidth={0.05} outlineColor="#000">
          ENTRY GATE
        </Text>

        {nearestFreeSlot && (
          <Line
            points={[
              ENTRY_POINT,
              [ENTRY_POINT[0], 0.2, nearestFreeSlot.position[2]],
              [nearestFreeSlot.position[0], 0.2, nearestFreeSlot.position[2]]
            ]}
            color="#00e6ff"
            lineWidth={4}
          />
        )}

        {nearestFreeSlot && (
          <Text
            position={[nearestFreeSlot.position[0], nearestFreeSlot.position[1] + 0.2, nearestFreeSlot.position[2] + 3.2]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.35}
            color="#7ff4ff"
          >
            SHORTEST PATH
          </Text>
        )}

        <LaneCars parkedCars={parkedCars} />

        <BookingCarAnimation
          targetSlot={slots.find((slot) => slot.id === bookingAnimation?.slotId)}
          animationKey={bookingAnimationKey}
          onArrive={handleBookingAnimationArrive}
        />

        {slots.map((slot) => (
          <ParkingSlot key={slot.id} slot={slot} onClick={handleBookSlot} canInteract={!bookingAnimation} />
        ))}

        <ContactShadows position={[0, 0, 0]} opacity={0.32} scale={100} blur={2.6} far={14} />
      </Canvas>
    </div>
  );
}
