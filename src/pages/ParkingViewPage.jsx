import { useEffect } from "react";
import ParkingScene from "../components/ParkingScene";
import StatsCard from "../components/StatsCard";
import useParkingStore from "../store/parkingStore";

function ParkingViewPage() {
  const {
    slots,
    selectedSlotId,
    bookingStatus,
    error,
    fetchSlots,
    setSelectedSlot,
    bookSlot,
    exitSlot
  } = useParkingStore((state) => ({
    slots: state.slots,
    selectedSlotId: state.selectedSlotId,
    bookingStatus: state.bookingStatus,
    error: state.error,
    fetchSlots: state.fetchSlots,
    setSelectedSlot: state.setSelectedSlot,
    bookSlot: state.bookSlot,
    exitSlot: state.exitSlot
  }));

  useEffect(() => {
    fetchSlots?.();
  }, [fetchSlots]);

  const total = slots?.length || 0;
  const occupied = slots?.filter((slot) => slot?.occupied)?.length || 0;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Total Slots" value={total} tone="total" />
        <StatsCard label="Available" value={total - occupied} tone="free" />
        <StatsCard label="Occupied" value={occupied} tone="occupied" />
      </section>

      <ParkingScene
        slots={slots}
        onReserve={async (slotId) => {
          setSelectedSlot(slotId);
          await bookSlot?.(slotId);
        }}
        onExit={(slotId) => {
          exitSlot?.(slotId);
        }}
        height="620px"
      />

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
        Selected Slot: {selectedSlotId ? `P${selectedSlotId}` : "None"} | Status: {bookingStatus}
        {error && <span className="ml-3 text-rose-300">{error}</span>}
      </div>
    </main>
  );
}

export default ParkingViewPage;
