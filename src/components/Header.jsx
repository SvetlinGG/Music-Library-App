import { Link, NavLink, useNavigate } from "react-router";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="logo" aria-label="SoundVibe home">
          <span className="logo-mark" aria-hidden="true">
            <span className="logo-disc" />
          </span>
          <span className="logo-text">
            Sound<span>Vibe</span>
          </span>
        </Link>

        <nav className="main-nav">
          <NavLink to="/" end className="nav-link">Home</NavLink>
          {isLoggedIn && (
            <>
              <NavLink to="/my-collection" className="nav-link">My Collection</NavLink>
              <NavLink to="/my-favorites" className="nav-link">My Favorites</NavLink>
            </>
          )}
        </nav>

        <div className="auth-links">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <span className="user-name" title={user.email}>Hi, {user.username}</span>
              <button type="button" className="nav-link logout-btn" onClick={logoutHandler}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">Login</NavLink>
              <NavLink to="/register" className="btn-register">Register</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
