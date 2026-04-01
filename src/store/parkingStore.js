import { create } from "zustand";

const ENTRY_POINT = { x: -9, z: -9 };
const USER_STORAGE_KEY = "smartParking.currentUser";

function getStoredUser() {
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function buildDefaultSlots() {
  const cols = 4;
  const spacing = 4;
  const offsetX = -6;
  const offsetZ = -6;

  return Array.from({ length: 12 }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = offsetX + col * spacing;
    const z = offsetZ + row * spacing;

    return {
      id: index + 1,
      label: `P${index + 1}`,
      occupied: false,
      position: { x, y: 0.55, z },
      userDetails: null
    };
  });
}

const useParkingStore = create((set, get) => ({
  currentUser: getStoredUser(),
  slots: buildDefaultSlots(),
  selectedSlotId: null,
  nearestSlotId: null,

  setCurrentUser: (user) => {
    try {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore localStorage failures in restricted browser contexts
    }
    set({ currentUser: user });
  },

  reserveSlot: (slotId) => {
    const { slots, currentUser } = get();
    const target = slots.find((slot) => slot.id === slotId);

    if (!target || target.occupied || !currentUser) {
      return false;
    }

    const updatedSlots = slots.map((slot) => {
      if (slot.id !== slotId) {
        return slot;
      }

      return {
        ...slot,
        occupied: true,
        userDetails: { ...currentUser, reservedAt: new Date().toISOString() }
      };
    });

    set({
      slots: updatedSlots,
      selectedSlotId: slotId,
      nearestSlotId: null
    });

    return true;
  },

  setSelectedSlot: (slotId) => {
    set({ selectedSlotId: slotId });
  },

  findNearestAvailableSlot: () => {
    const { slots } = get();
    const candidates = slots.filter((slot) => !slot.occupied);

    if (!candidates.length) {
      set({ nearestSlotId: null });
      return null;
    }

    const nearest = candidates.reduce((best, slot) => {
      const bestDist = Math.hypot(best.position.x - ENTRY_POINT.x, best.position.z - ENTRY_POINT.z);
      const slotDist = Math.hypot(slot.position.x - ENTRY_POINT.x, slot.position.z - ENTRY_POINT.z);
      return slotDist < bestDist ? slot : best;
    });

    set({ nearestSlotId: nearest.id, selectedSlotId: nearest.id });
    return nearest.id;
  }
}));

export default useParkingStore;
