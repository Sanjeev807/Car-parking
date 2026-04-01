import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useParkingStore from "../store/parkingStore";

const VIDEO_PATH = "/parking-bg.mp4";

function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const [form, setForm] = useState({ userName: "", carNumber: "", duration: "" });
  const [errors, setErrors] = useState({});
  const setCurrentUser = useParkingStore((state) => state.setCurrentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
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

    if (Object.keys(next).length) {
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
      className={`page-shell ${videoFailed ? "video-fallback" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <video
        className="bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onError={() => setVideoFailed(true)}
      >
        <source src={VIDEO_PATH} type="video/mp4" />
      </video>

      <div className="bg-overlay" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />
      <div
        className="scroll-blur-layer"
        style={{ backdropFilter: `blur(${Math.min(scrollY / 220, 4)}px)` }}
        aria-hidden="true"
      />

      <main className="content-scroll">
        <motion.section
          className="hero glass-card"
          initial={{ y: 38, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.65 }}
        >
          <p className="eyebrow">Smart City Parking Intelligence</p>
          <h1>Find Parking Instantly</h1>
          <p>
            Enter your details, detect the nearest available bay, and reserve in a futuristic live 3D parking grid.
          </p>
          <form className="home-form" onSubmit={onSubmit}>
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
              Parking Timing
              <select
                value={form.duration}
                onChange={(e) => onChange("duration", e.target.value)}
              >
                <option value="">Select timing</option>
                <option value="1 Hour">1 Hour</option>
                <option value="2 Hours">2 Hours</option>
                <option value="4 Hours">4 Hours</option>
                <option value="8 Hours">8 Hours</option>
                <option value="Full Day">Full Day</option>
              </select>
              {errors.duration && <span className="field-error">{errors.duration}</span>}
            </label>

            <button type="submit" className="neon-btn">
              Enter Parking
            </button>
          </form>
        </motion.section>

        <section className="glass-card feature-grid">
          <article>
            <h2>Immersive Parking Twin</h2>
            <p>Live 3D lot visualization with cinematic lighting and depth fog.</p>
          </article>
          <article>
            <h2>AI-like Nearest Detection</h2>
            <p>Jump camera focus to the closest available slot from the gate.</p>
          </article>
          <article>
            <h2>Instant Reservation Feedback</h2>
            <p>Interactive slot glow, click transitions, and booking confirmation.</p>
          </article>
        </section>
      </main>
    </motion.div>
  );
}

export default LandingPage;
