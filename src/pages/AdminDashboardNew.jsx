import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import useParkingStore from "../store/parkingStore";

function StatBox({ icon, label, value, subtext, bgColor, textColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${bgColor} border border-slate-700 rounded-xl p-6 text-white hover:shadow-lg transition-shadow`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <div className={`text-sm font-semibold ${textColor}`}>{subtext}</div>
      </div>
      <h3 className="text-sm text-slate-400 mb-1">{label}</h3>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </motion.div>
  );
}

function BookingCard({ booking, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border-b border-slate-800 hover:bg-slate-800/30 transition"
    >
      <td className="px-6 py-4 text-slate-200">
        <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm font-semibold">P{booking.slotId}</span>
      </td>
      <td className="px-6 py-4 text-slate-300">{booking.userName || "-"}</td>
      <td className="px-6 py-4 text-slate-300">{booking.carNumber || "-"}</td>
      <td className="px-6 py-4">
        <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold">
          Occupied
        </span>
      </td>
      <td className="px-6 py-4 text-slate-400 text-sm">
        {booking.bookedAt ? new Date(booking.bookedAt).toLocaleString() : "-"}
      </td>
    </motion.tr>
  );
}

function AdminDashboardNew() {
  const { slots, bookingBySlot, fetchSlots, error } = useParkingStore((state) => ({
    slots: state.slots,
    bookingBySlot: state.bookingBySlot,
    fetchSlots: state.fetchSlots,
    error: state.error
  }));

  const [refreshInterval, setRefreshInterval] = useState(3000);

  useEffect(() => {
    fetchSlots();
    const timer = window.setInterval(fetchSlots, refreshInterval);
    return () => window.clearInterval(timer);
  }, [fetchSlots, refreshInterval]);

  const stats = useMemo(() => {
    const total = slots?.length || 0;
    const occupied = slots?.filter((slot) => slot?.occupied)?.length || 0;
    const available = total - occupied;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    return {
      total,
      occupied,
      available,
      occupancyRate
    };
  }, [slots]);

  const bookedSlots = useMemo(() => {
    return slots
      ?.filter((slot) => slot?.occupied)
      ?.map((slot) => ({
        slotId: slot.slotId,
        userName: slot.user,
        carNumber: slot.carNumber,
        bookedAt: slot.bookedAt,
        occupied: true
      }))
      ?.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt)) || [];
  }, [slots]);

  const occupancyTrend = useMemo(() => {
    if (stats.total === 0) return 0;
    if (stats.occupancyRate > 75) return "High";
    if (stats.occupancyRate > 50) return "Medium";
    return "Low";
  }, [stats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-slate-400">Real-time parking management and analytics</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value={2000}>Auto-refresh: 2s</option>
                <option value={3000}>Auto-refresh: 3s</option>
                <option value={5000}>Auto-refresh: 5s</option>
              </select>
              <button
                onClick={fetchSlots}
                className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition"
              >
                Refresh Now
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-rose-500/20 border border-rose-500/50 rounded-lg px-4 py-3 text-rose-200"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatBox
            icon="🅿️"
            label="Total Slots"
            value={stats.total}
            subtext="All Available"
            bgColor="bg-gradient-to-br from-slate-800 to-slate-900"
            textColor="text-cyan-400"
          />
          <StatBox
            icon="✅"
            label="Available Slots"
            value={stats.available}
            subtext={`${Math.round((stats.available / stats.total) * 100) || 0}% free`}
            bgColor="bg-gradient-to-br from-emerald-900/30 to-slate-900"
            textColor="text-emerald-400"
          />
          <StatBox
            icon="🚗"
            label="Booked Slots"
            value={stats.occupied}
            subtext={`${stats.occupancyRate}% occupied`}
            bgColor="bg-gradient-to-br from-rose-900/30 to-slate-900"
            textColor="text-rose-400"
          />
          <StatBox
            icon="📊"
            label="Occupancy Level"
            value={`${stats.occupancyRate}%`}
            subtext={occupancyTrend}
            bgColor="bg-gradient-to-br from-purple-900/30 to-slate-900"
            textColor={occupancyTrend === "High" ? "text-rose-400" : occupancyTrend === "Medium" ? "text-yellow-400" : "text-emerald-400"}
          />
        </div>

        {/* Occupancy Chart Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">Occupancy Overview</h2>
          <div className="flex items-end gap-2 h-40">
            {/* Visual representation */}
            <div className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg" style={{ height: `${stats.available / stats.total * 100 || 0}%` }}>
              <span className="text-xs text-white flex items-end justify-center h-full pb-2 font-bold">{Math.round((stats.available / stats.total) * 100) || 0}%</span>
            </div>
            <div className="flex-1 bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-lg" style={{ height: `${stats.occupied / stats.total * 100 || 0}%` }}>
              <span className="text-xs text-white flex items-end justify-center h-full pb-2 font-bold">{stats.occupancyRate}%</span>
            </div>
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              <span>Available ({stats.available})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded" />
              <span>Booked ({stats.occupied})</span>
            </div>
          </div>
        </motion.div>

        {/* Booked Slots Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Currently Booked Slots ({stats.occupied})</h2>
          </div>

          {bookedSlots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Slot ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">User Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Car Number</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Booked At</th>
                  </tr>
                </thead>
                <tbody>
                  {bookedSlots.map((booking, index) => (
                    <BookingCard key={booking.slotId} booking={booking} index={index} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <p className="text-lg">No bookings at the moment</p>
              <p className="text-sm mt-2">All parking slots are available!</p>
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Peak Occupancy</p>
            <p className="text-2xl font-bold text-cyan-400">85%</p>
            <p className="text-xs text-slate-500 mt-2">Usually between 6-8 PM</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Avg. Stay Duration</p>
            <p className="text-2xl font-bold text-emerald-400">2.5h</p>
            <p className="text-xs text-slate-500 mt-2">Average parking time</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Revenue Today</p>
            <p className="text-2xl font-bold text-purple-400">$2,450</p>
            <p className="text-xs text-slate-500 mt-2">From 145 bookings</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminDashboardNew;
