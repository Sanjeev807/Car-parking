import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import ParkingSceneCore from "../components/parking/ParkingSceneCore";

const STORAGE_KEY = "smartParking.user";

function buildSlots() {
  const cols = 4;
  const gap = 2.8;
  const startX = -4.2;
  const startZ = -4.2;

  return Array.from({ length: 12 }, (_, idx) => {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    return {
      id: idx + 1,
      label: `P${idx + 1}`,
      occupied: idx === 1 || idx === 4,
      occupiedBy: idx === 1 || idx === 4 ? "system" : null,
      position: [startX + col * gap, 0.5, startZ + row * gap]
    };
  });
}

function Parking3DPage() {
  const [toast, setToast] = useState("");
  const [slots, setSlots] = useState(() => buildSlots());
  const [activeTransition, setActiveTransition] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);

  const user = useMemo(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const onSlotAction = (slotId) => {
    if (activeTransition) {
      return;
    }

    const selected = slots.find((slot) => slot.id === slotId);
    if (!selected) {
      return;
    }

    if (!selected.occupied) {
      setActiveTransition({ type: "entry", slotId });
      setAnimationKey((prev) => prev + 1);
      return;
    }

    if (selected.occupiedBy !== "user") {
      return;
    }

    const confirmExit = window.confirm(`Do you want to exit from slot ${selected.label}?`);
    if (!confirmExit) {
      return;
    }

    setActiveTransition({ type: "exit", slotId });
    setAnimationKey((prev) => prev + 1);
  };

  const onAnimationComplete = (slotId, type) => {
    if (type === "entry") {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId
            ? { ...slot, occupied: true, occupiedBy: "user" }
            : slot
        )
      );
      setToast(`Slot reserved for ${user.userName}`);
    } else {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId
            ? { ...slot, occupied: false, occupiedBy: null }
            : slot
        )
      );
      setToast(`Car exited from P${slotId}`);
    }

    setActiveTransition(null);
    window.setTimeout(() => setToast(""), 2200);
  };

  const occupiedCount = slots.filter((slot) => slot.occupied).length;
  const userBookedSlot = slots.find((slot) => slot.occupiedBy === "user") ?? null;

  return (
    <div className="parking-page">
      <div className="parking-canvas-wrap">
        <ParkingSceneCore
          slots={slots}
          onSlotAction={onSlotAction}
          movingSlotId={activeTransition?.slotId ?? null}
          movingType={activeTransition?.type ?? null}
          movingCarKey={animationKey}
          onAnimationComplete={onAnimationComplete}
          isInteractionLocked={Boolean(activeTransition)}
        />
      </div>

      <aside className="dashboard glass-card">
        <h2>Parking Dashboard</h2>
        <p>Total Slots: {slots.length}</p>
        <p>Occupied: {occupiedCount}</p>
        <p>Available: {slots.length - occupiedCount}</p>
        <hr />
        <p>User: {user.userName}</p>
        <p>Car: {user.carNumber}</p>
        <p>Timing: {user.timing}</p>
        <p>
          Status: {activeTransition ? `${activeTransition.type === "entry" ? "Parking" : "Exiting"} in progress ${slots.find((slot) => slot.id === activeTransition.slotId)?.label ?? ""}` : "Ready"}
        </p>

        <button
          type="button"
          className="neon-btn"
          disabled={!userBookedSlot || Boolean(activeTransition)}
          onClick={() => {
            if (userBookedSlot) {
              onSlotAction(userBookedSlot.id);
            }
          }}
        >
          {userBookedSlot ? `Exit ${userBookedSlot.label}` : "No User Slot To Exit"}
        </button>
        <p className="dashboard-action-note">
          You can also click your occupied slot in the 3D view to request exit.
        </p>
      </aside>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default Parking3DPage;
