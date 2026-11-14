import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // after login go back to the page that sent the user here (e.g. My Collection)
  const redirectTo = location.state?.from ?? "/";
  // message from Register or from a page that needs login (e.g. "Add to Collection")
  const message = location.state?.message ?? "";

  const loginHandler = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const email = formData.get("email").trim();
    const password = formData.get("password");
    const remember = formData.get("remember") === "on";

    if (!email || !password) {
      return setError("Email and password are required.");
    }

    setPending(true);
    try {
      await login({ email, password, remember });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        /email not confirmed/i.test(err.message)
          ? "Please confirm your email first – open the link we sent you, then log in."
          : /invalid login credentials/i.test(err.message)
            ? "Wrong email or password."
            : err.message
      );
      setPending(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="eyebrow">Welcome back</span>
          <h1>Login</h1>
          <p className="auth-subtitle">Sign in to continue to your collection.</p>
        </div>

        <form className="auth-form" onSubmit={loginHandler}>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" required placeholder="you@example.com" />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" name="password" required placeholder="••••••••" />
          </label>

          <div className="auth-row">
            <label className="checkbox">
              <input type="checkbox" name="remember" defaultChecked />
              <span>Remember me</span>
            </label>
            <a href="#" className="auth-link-muted">Forgot password?</a>
          </div>

          {message && !error && <p className="auth-success" role="status">{message}</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" className="auth-submit" disabled={pending}>
            {pending ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </section>
  );
}
