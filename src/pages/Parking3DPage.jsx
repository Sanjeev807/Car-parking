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
      position: [startX + col * gap, 0.5, startZ + row * gap]
    };
  });
}

function Parking3DPage() {
  const [toast, setToast] = useState("");
  const [slots, setSlots] = useState(() => buildSlots());
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingAnimationKey, setBookingAnimationKey] = useState(0);

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

  const onReserve = (slotId) => {
    if (activeBooking) {
      return;
    }

    const selected = slots.find((slot) => slot.id === slotId);
    if (!selected || selected.occupied) {
      return;
    }

    setActiveBooking({ slotId });
    setBookingAnimationKey((prev) => prev + 1);
  };

  const onCarArrive = (slotId) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, occupied: true } : slot))
    );
    setActiveBooking(null);
    setToast(`Slot reserved for ${user.userName}`);
    window.setTimeout(() => setToast(""), 2000);
  };

  const occupiedCount = slots.filter((slot) => slot.occupied).length;

  return (
    <div className="parking-page">
      <div className="parking-canvas-wrap">
        <ParkingSceneCore
          slots={slots}
          onReserve={onReserve}
          movingSlotId={activeBooking?.slotId ?? null}
          movingCarKey={bookingAnimationKey}
          onCarArrive={onCarArrive}
          canReserve={!activeBooking}
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
        <p>Status: {activeBooking ? `Parking in progress to P${activeBooking.slotId}` : "Ready"}</p>
      </aside>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default Parking3DPage;
