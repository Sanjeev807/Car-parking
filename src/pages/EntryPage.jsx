import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useParkingStore from "../store/parkingStore";

function EntryPage() {
  const setCurrentUser = useParkingStore((state) => state.setCurrentUser);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userName: "",
    carNumber: "",
    duration: ""
  });
  const [errors, setErrors] = useState({});

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next = {};

    if (!form.userName.trim()) {
      next.userName = "User name is required";
    }

    if (!form.carNumber.trim()) {
      next.carNumber = "Car number is required";
    }

    if (!form.duration) {
      next.duration = "Parking duration is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setCurrentUser({
      userName: form.userName.trim(),
      carNumber: form.carNumber.trim().toUpperCase(),
      duration: form.duration
    });

    navigate("/parking");
  };

  return (
    <motion.div
      className="entry-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="entry-bg" />

      <motion.form
        className="glass-card entry-card"
        onSubmit={onSubmit}
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="eyebrow">Step 1</p>
        <h1>Enter Driver Details</h1>

        <label>
          User Name
          <input
            value={form.userName}
            onChange={(e) => onChange("userName", e.target.value)}
            placeholder="e.g. Alex Morgan"
          />
          {errors.userName && <span className="field-error">{errors.userName}</span>}
        </label>

        <label>
          Car Number
          <input
            value={form.carNumber}
            onChange={(e) => onChange("carNumber", e.target.value)}
            placeholder="e.g. MH12AB1234"
          />
          {errors.carNumber && <span className="field-error">{errors.carNumber}</span>}
        </label>

        <label>
          Parking Duration
          <select
            value={form.duration}
            onChange={(e) => onChange("duration", e.target.value)}
          >
            <option value="">Select duration</option>
            <option value="1 Hour">1 Hour</option>
            <option value="2 Hours">2 Hours</option>
            <option value="4 Hours">4 Hours</option>
            <option value="8 Hours">8 Hours</option>
            <option value="Full Day">Full Day</option>
          </select>
          {errors.duration && <span className="field-error">{errors.duration}</span>}
        </label>

        <button className="neon-btn" type="submit">
          Continue
        </button>
      </motion.form>
    </motion.div>
  );
}

export default EntryPage;
