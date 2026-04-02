import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import VideoBackground from "../components/VideoBackground";

const features = [
  {
    icon: "🅿️",
    title: "Smart Parking",
    description: "Find and book parking spots in seconds with our AI-powered system"
  },
  {
    icon: "📱",
    title: "Mobile App",
    description: "Seamless experience on all devices with real-time notifications"
  },
  {
    icon: "🎯",
    title: "Real-Time Data",
    description: "Live parking availability updates across all locations"
  },
  {
    icon: "💳",
    title: "Easy Payment",
    description: "Multiple payment options for your convenience"
  },
  {
    icon: "🗺️",
    title: "Location",
    description: "GPS-guided directions to your reserved parking spot"
  },
  {
    icon: "⭐",
    title: "Ratings",
    description: "Community reviews help you find the best parking locations"
  }
];

const stats = [
  { number: "5,000+", label: "Active Users", icon: "👥" },
  { number: "10,000+", label: "Parking Slots", icon: "🅿️" },
  { number: "2,000+", label: "Daily Bookings", icon: "📊" },
  { number: "99.8%", label: "Success Rate", icon: "✓" }
];

export default function LandingPageNew() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="relative isolate min-h-screen w-screen overflow-x-hidden bg-slate-950 text-white">
      <VideoBackground src="/parking-bg.mp4" />

      {/* Hero Section with Full-Screen Video */}
      <section className="relative z-10 flex min-h-screen w-full items-center overflow-hidden">

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-slate-950" />

        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            className="w-full max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex mb-6">
            <span className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-semibold border border-cyan-500/50 backdrop-blur-md">
              🚀 Welcome to Smart Parking
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight"
          >
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 text-transparent bg-clip-text">
              Parking Spot
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl md:text-2xl"
          >
            Stop wasting time searching for parking. Book your spot in seconds with our intelligent parking management system.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mb-14 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/booking")}
              className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-bold rounded-lg hover:from-cyan-300 hover:to-cyan-400 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/50 text-lg w-full sm:w-auto"
            >
              Book Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/parking")}
              className="px-8 py-4 border-2 border-cyan-400 text-cyan-300 font-bold rounded-lg hover:bg-cyan-500/10 transition-all duration-300 text-lg w-full sm:w-auto"
            >
              View 3D Lot
            </motion.button>
          </motion.div>

          {/* Email Signup */}
          <motion.div
            variants={itemVariants}
            className="mx-auto max-w-md rounded-xl border border-slate-700/60 bg-slate-900/45 p-6 backdrop-blur-xl"
          >
            <p className="text-slate-300 mb-4 font-medium">Get updates and exclusive offers</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition"
              >
                Join
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-16 text-center"
          >
            By The Numbers
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur rounded-xl p-6 text-center hover:border-cyan-500/50 transition-all"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <p className="text-3xl font-bold text-cyan-400 mb-2">{stat.number}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-16 text-center"
          >
            Why Choose Us
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur rounded-xl p-8 hover:border-cyan-500/50 hover:from-slate-800 transition-all duration-300"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 backdrop-blur rounded-2xl p-12 text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Find Your Spot?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of users who've saved time and money with Smart Parking.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/booking")}
              className="px-10 py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-bold rounded-lg hover:from-cyan-300 hover:to-cyan-400 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/50 text-lg"
            >
              Start Booking Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400 mb-2">© 2024 Smart Parking System. All rights reserved.</p>
          <p className="text-slate-500 text-sm">Making parking smarter, easier, and more affordable.</p>
        </div>
      </footer>
    </div>
  );
}
