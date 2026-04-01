import React, { useState } from "react";
import BookingForm from "./components/BookingForm";
import SmartParkingDashboard from "./components/SmartParkingDashboard";
import "./App.css";

const normalizeName = (value) => value.trim().toLowerCase();
const normalizePlate = (value) => value.trim().toUpperCase().replace(/\s+/g, "");

function App() {
  const [currentView, setCurrentView] = useState("booking");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [bookedRegistry, setBookedRegistry] = useState({ byUser: {}, byPlate: {} });

  const handleBookingSubmit = (details) => {
    const normalizedUserName = normalizeName(details.userName);
    const normalizedCarNumber = normalizePlate(details.carNumber);

    if (bookedRegistry.byUser[normalizedUserName]) {
      alert(`This user already has slot ${bookedRegistry.byUser[normalizedUserName]}. One person can book only one slot.`);
      return false;
    }

    if (bookedRegistry.byPlate[normalizedCarNumber]) {
      alert(`This number plate already has slot ${bookedRegistry.byPlate[normalizedCarNumber]}. One car can book only one slot.`);
      return false;
    }

    setBookingDetails({
      ...details,
      userName: details.userName.trim(),
      carNumber: normalizedCarNumber,
      slotId: null
    });
    setCurrentView("dashboard");
    return true;
  };

  const handleSlotBooked = (slotId) => {
    setBookingDetails((prevBooking) => {
      if (!prevBooking || prevBooking.slotId) {
        return prevBooking;
      }

      const normalizedUserName = normalizeName(prevBooking.userName);
      const normalizedCarNumber = normalizePlate(prevBooking.carNumber);

      setBookedRegistry((prevRegistry) => ({
        byUser: {
          ...prevRegistry.byUser,
          [normalizedUserName]: slotId
        },
        byPlate: {
          ...prevRegistry.byPlate,
          [normalizedCarNumber]: slotId
        }
      }));

      return { ...prevBooking, slotId };
    });
  };

  const handleDashboardClose = () => {
    setCurrentView("booking");
    setBookingDetails(null);
  };

  return (
    <div className="App dark-theme">
      {currentView === "booking" && <BookingForm onSubmit={handleBookingSubmit} />}
      {currentView === "dashboard" && (
        <SmartParkingDashboard
          bookingDetails={bookingDetails}
          onClose={handleDashboardClose}
          onSlotBooked={handleSlotBooked}
        />
      )}
    </div>
  );
}

export default App;
