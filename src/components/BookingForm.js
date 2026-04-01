import React, { useState } from "react";
import "./BookingForm.css";

const BookingForm = ({ onSubmit }) => {
  const [userName, setUserName] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [parkingDuration, setParkingDuration] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (userName && carNumber && parkingDuration) {
      onSubmit({ userName, carNumber, parkingDuration });
      return;
    }

    alert("Please fill in all details.");
  };

  return (
    <div className="booking-form-container glassmorphism">
      <div className="form-panel">
        <h2 className="step-label">STEP 1</h2>
        <h1 className="form-title">Enter Driver Details</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userName">User Name</label>
            <input
              type="text"
              id="userName"
              placeholder="e.g. Alex Morgan"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="carNumber">Car Number</label>
            <input
              type="text"
              id="carNumber"
              placeholder="e.g. MH12AB1234"
              value={carNumber}
              onChange={(e) => setCarNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="parkingDuration">Parking Duration</label>
            <select
              id="parkingDuration"
              value={parkingDuration}
              onChange={(e) => setParkingDuration(e.target.value)}
              required
            >
              <option value="">Select duration</option>
              <option value="1">1 Hour</option>
              <option value="2">2 Hours</option>
              <option value="3">3 Hours</option>
              <option value="4+">4+ Hours</option>
            </select>
          </div>

          <button type="submit" className="submit-button teal-button">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
