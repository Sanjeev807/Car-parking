import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import EntryPage from "./pages/EntryPage";
import LandingPage from "./pages/LandingPage";
import ParkingPage from "./pages/ParkingPage";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/entry" element={<EntryPage />} />
        <Route path="/parking" element={<ParkingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
