import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import ParkingScene from "../components/parking/ParkingScene";
import useParkingStore from "../store/parkingStore";

function ParkingPage() {
  const {
    slots,
    selectedSlotId,
    nearestSlotId,
    currentUser,
    setSelectedSlot,
    reserveSlot,
    findNearestAvailableSlot
  } = useParkingStore((state) => ({
    slots: state.slots,
    selectedSlotId: state.selectedSlotId,
    nearestSlotId: state.nearestSlotId,
    currentUser: state.currentUser,
    setSelectedSlot: state.setSelectedSlot,
    reserveSlot: state.reserveSlot,
    findNearestAvailableSlot: state.findNearestAvailableSlot
  }));

  const [toast, setToast] = useState("");

  const stats = useMemo(() => {
    const total = slots.length;
    const occupied = slots.filter((slot) => slot.occupied).length;
    const available = total - occupied;
    return { total, occupied, available };
  }, [slots]);

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  const onReserve = (slotId) => {
    const success = reserveSlot(slotId);

    if (success) {
      setToast("Slot Reserved Successfully");
      window.setTimeout(() => setToast(""), 2200);
    }
  };

  const focusedSlotId = selectedSlotId ?? nearestSlotId;
  const focusedSlot = slots.find((slot) => slot.id === focusedSlotId);
  const hasSlots = Array.isArray(slots) && slots.length > 0;

  return (
    <motion.div
      className="parking-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="parking-canvas-wrap">
        {hasSlots ? (
          <ParkingScene
            slots={slots}
            focusedSlot={focusedSlotId}
            onSelect={setSelectedSlot}
            onReserve={onReserve}
          />
        ) : (
          <div className="scene-loading">Loading parking layout...</div>
        )}
      </div>

      <aside className="dashboard glass-card">
        <h2>Smart Parking Dashboard</h2>

        <div className="stats-grid">
          <div>
            <p>Total Slots</p>
            <strong>{stats.total}</strong>
          </div>
          <div>
            <p>Available</p>
            <strong className="ok">{stats.available}</strong>
          </div>
          <div>
            <p>Occupied</p>
            <strong className="danger">{stats.occupied}</strong>
          </div>
        </div>

        <div className="user-block">
          <h3>Current User</h3>
          <p>Name: {currentUser.userName}</p>
          <p>Car: {currentUser.carNumber}</p>
          <p>Duration: {currentUser.duration}</p>
          <p>
            Focused Slot: {focusedSlot ? focusedSlot.label : "None"}
          </p>
        </div>

        <button
          type="button"
          className="neon-btn"
          onClick={findNearestAvailableSlot}
        >
          Find Nearest Slot
        </button>
      </aside>

      {toast && <div className="toast">{toast}</div>}
    </motion.div>
  );
}

export default ParkingPage;
