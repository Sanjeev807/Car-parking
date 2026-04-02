import { motion, AnimatePresence } from "framer-motion";

export default function ExitModal({ isOpen, slotId, userName, carNumber, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-slate-900 border-2 border-cyan-500 rounded-xl p-8 max-w-md w-full shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="text-3xl">🚗</div>
                <h2 className="text-2xl font-bold text-white">Exit Parking?</h2>
              </div>

              {/* Slot Details */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Slot ID:</span>
                  <span className="font-bold text-cyan-300">P{slotId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">User:</span>
                  <span className="font-bold text-slate-200">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="font-bold text-slate-200">{carNumber}</span>
                </div>
              </div>

              {/* Confirmation Message */}
              <p className="text-slate-300 text-center mb-6">
                Click <span className="font-bold text-emerald-400">EXIT</span> to move your vehicle to the exit lane. The parking slot will be freed up immediately.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-600 text-slate-300 font-bold hover:border-slate-500 transition"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-400 hover:to-emerald-500 transition shadow-lg"
                >
                  Exit
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
