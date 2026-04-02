import { NavLink } from "react-router-dom";

const baseLink =
  "rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200";

function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="text-lg font-semibold tracking-tight text-cyan-300 hover:text-cyan-200 transition">
          🅿️ Smart Parking
        </NavLink>
        <nav className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/booking"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`
            }
          >
            Book Slot
          </NavLink>
          <NavLink
            to="/parking"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`
            }
          >
            3D View
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`
            }
          >
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
