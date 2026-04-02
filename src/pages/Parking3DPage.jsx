import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import SmartParkingDashboard from "../components/SmartParkingDashboard.jsx";
import useParkingStore from "../store/parkingStore";

const STORAGE_KEY = "smartParking.user";
const FALLBACK_STORE_KEY = "smartParking.currentUser";

function Parking3DPage() {
  const navigate = useNavigate();
  const currentUser = useParkingStore((state) => state.currentUser);

  const user = useMemo(() => {
    if (currentUser) {
      return currentUser;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }

      const fallbackRaw = window.localStorage.getItem(FALLBACK_STORE_KEY);
      return fallbackRaw ? JSON.parse(fallbackRaw) : null;
    } catch {
      return null;
    }
  }, [currentUser]);

  const [bookingDetails, setBookingDetails] = useState(() => ({
    userName: user?.userName || "",
    carNumber: user?.carNumber || "",
    parkingDuration: user?.timing || user?.duration || "",
    slotId: user?.slotId || null
  }));

  useEffect(() => {
    if (!user) {
      return;
    }

    setBookingDetails((prev) => ({
      ...prev,
      userName: user.userName || "",
      carNumber: user.carNumber || "",
      parkingDuration: user.timing || user.duration || "",
      slotId: user.slotId || prev.slotId || null
    }));
  }, [user]);

  if (!user) {
    return <Navigate to="/booking" replace />;
  }

  return (
    <SmartParkingDashboard
      bookingDetails={bookingDetails}
      onClose={() => navigate("/booking")}
      onSlotBooked={(slotId) => {
        const updated = { ...bookingDetails, slotId };
        setBookingDetails(updated);
        const updatedUser = { ...user, slotId };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
          window.localStorage.setItem(FALLBACK_STORE_KEY, JSON.stringify(updatedUser));
        } catch {
          // Ignore storage failures.
        }
      }}
    />
  );
}

export default Parking3DPage;
