import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VIDEO_PATH = "/parking-bg.mp4";

function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <button
            type="button"
            className="neon-btn"
            onClick={() => navigate("/entry")}
          >
            Enter Parking
          </button>
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
