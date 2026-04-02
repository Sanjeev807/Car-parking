import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPageNew from "./pages/LandingPageNew";
import AdminDashboardNew from "./pages/AdminDashboardNew";
import HomeFormPage from "./pages/HomeFormPage";
import Parking3DPage from "./pages/Parking3DPage";

function App() {
  const location = useLocation();

  // Pages that should not show navbar
  const noNavbarRoutes = ["/"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {!noNavbarRoutes.includes(location.pathname) && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPageNew />} />
          <Route path="/booking" element={<HomeFormPage />} />
          <Route path="/parking" element={<Parking3DPage />} />
          <Route path="/admin" element={<AdminDashboardNew />} />
          <Route path="/form" element={<HomeFormPage />} />
          <Route path="/parking-3d" element={<Parking3DPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
