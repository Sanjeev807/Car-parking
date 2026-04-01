import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "smartParking.user";

function HomeFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userName: "",
    carNumber: "",
    timing: ""
  });
  const [errors, setErrors] = useState({});

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const onSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.userName.trim()) {
      nextErrors.userName = "Name is required";
    }

    if (!form.carNumber.trim()) {
      nextErrors.carNumber = "Car number is required";
    }

    if (!form.timing) {
      nextErrors.timing = "Timing is required";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = {
      userName: form.userName.trim(),
      carNumber: form.carNumber.trim().toUpperCase(),
      timing: form.timing
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    navigate("/parking");
  };

  return (
    <div className="home-page">
      <motion.div
        className="home-form-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <p className="eyebrow">Smart Parking Finder</p>
        <h1>Find Parking Instantly</h1>

        <form className="home-form" onSubmit={onSubmit}>
          <label>
            User Name
            <input
              value={form.userName}
              onChange={(e) => onChange("userName", e.target.value)}
              placeholder="Enter your name"
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
            Parking Timing
            <select value={form.timing} onChange={(e) => onChange("timing", e.target.value)}>
              <option value="">Select timing</option>
              <option value="1 Hour">1 Hour</option>
              <option value="2 Hours">2 Hours</option>
              <option value="4 Hours">4 Hours</option>
              <option value="8 Hours">8 Hours</option>
              <option value="Full Day">Full Day</option>
            </select>
            {errors.timing && <span className="field-error">{errors.timing}</span>}
          </label>

          <button type="submit" className="neon-btn">Enter Parking</button>
        </form>
      </motion.div>
    </div>
  );
}

export default HomeFormPage;
