import { Routes, Route, NavLink } from 'react-router-dom';
import Register from './pages/Register';
import Player from './pages/Player';
import Coach from './pages/Coach';
import Admin from './pages/Admin';
import { ACADEMY } from './config';

export default function App() {
  return (
    <>
      <nav className="navbar navbar-dark brand-bar">
        <div className="container">
          <span className="navbar-brand">{ACADEMY}</span>
          <div className="navbar-nav flex-row gap-3">
            <NavLink className="nav-link" to="/">Register</NavLink>
            <NavLink className="nav-link" to="/player">Player</NavLink>
            <NavLink className="nav-link" to="/coach">Coach</NavLink>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/player" element={<Player />} />
          <Route path="/coach" element={<Coach />} />
          {/* no link in the menu on purpose: the admin types /admin */}
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
