import { Link, NavLink } from "react-router";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="logo" aria-label="SoundVault home">
          <span className="logo-mark" aria-hidden="true">
            <span className="logo-disc" />
          </span>
          <span className="logo-text">
            Sound<span>Vibe</span>
          </span>
        </Link>

        <nav className="main-nav">
          <NavLink to="/" end className="nav-link">Home</NavLink>
          <NavLink to="/my-collection" className="nav-link">My Collection</NavLink>
        </nav>

        <div className="auth-links">
          <ThemeToggle />
          <NavLink to="/login" className="nav-link">Login</NavLink>
          <NavLink to="/register" className="btn-register">Register</NavLink>
        </div>
      </div>
    </header>
  );
}
