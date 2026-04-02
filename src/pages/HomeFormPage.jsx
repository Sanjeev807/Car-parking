import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useParkingStore from "../store/parkingStore";

const STORAGE_KEY = "smartParking.user";
const HALF_HOUR_RATE = 50;
const TIMING_OPTIONS = [
  { label: "30 Minutes", halfHours: 1 },
  { label: "1 Hour", halfHours: 2 },
  { label: "2 Hours", halfHours: 4 },
  { label: "4 Hours", halfHours: 8 },
  { label: "8 Hours", halfHours: 16 },
  { label: "Full Day", halfHours: 24 }
];

function HomeFormPage() {
  const navigate = useNavigate();
  const setCurrentUser = useParkingStore((state) => state.setCurrentUser);
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

    const selectedTiming = TIMING_OPTIONS.find((option) => option.label === form.timing);
    const halfHours = selectedTiming?.halfHours ?? 0;

    const payload = {
      userName: form.userName.trim(),
      carNumber: form.carNumber.trim().toUpperCase(),
      timing: form.timing,
      halfHourRate: HALF_HOUR_RATE,
      halfHours,
      amount: HALF_HOUR_RATE * halfHours
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setCurrentUser(payload);
    navigate("/parking");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <motion.div
        className="relative mx-auto w-full max-w-xl rounded-2xl border border-slate-700/70 bg-slate-900/75 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Smart Parking Booking</p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Book Your Slot</h1>
        <p className="mt-3 text-sm text-slate-300">Enter your details to continue to the 3D parking view.</p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-200">
            User Name
            <input
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25"
              value={form.userName}
              onChange={(e) => onChange("userName", e.target.value)}
              placeholder="Enter your name"
            />
            {errors.userName && <span className="mt-1 block text-xs text-rose-300">{errors.userName}</span>}
          </label>

          <label className="block text-sm font-medium text-slate-200">
            Vehicle Register Number
            <input
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm uppercase text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25"
              value={form.carNumber}
              onChange={(e) => onChange("carNumber", e.target.value)}
              placeholder="e.g. MH12AB1234"
            />
            {errors.carNumber && <span className="mt-1 block text-xs text-rose-300">{errors.carNumber}</span>}
          </label>

          <label className="block text-sm font-medium text-slate-200">
            Timing
            <select
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25"
              value={form.timing}
              onChange={(e) => onChange("timing", e.target.value)}
            >
              <option value="">Select timing</option>
              {TIMING_OPTIONS.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.timing && <span className="mt-1 block text-xs text-rose-300">{errors.timing}</span>}
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:from-cyan-300 hover:to-cyan-400"
          >
            Confirm Booking
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default HomeFormPage;
