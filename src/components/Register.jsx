import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { signUp } from "../api/auth-Supabase";
//import request from "../api/user-Supabase-request";

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const saveClickHandler = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const { username, email, password, rePassword } = Object.fromEntries(formData);

    if (!username.trim() || !email.trim() || !password) {
      return setError("All fields are required.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (password !== rePassword) {
      return setError("Passwords do not match.");
    }

    setPending(true);
    try {
      await signUp({ username: username.trim(), email: email.trim(), password });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };


  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="eyebrow">Join SoundVibe</span>
          <h1>Register</h1>
          <p className="auth-subtitle">Create an account and start building your collection.</p>
        </div>

        <form className="auth-form" onSubmit={saveClickHandler}>
          <label className="field">
            <span>Username</span>
            <input type="text" name="username" required placeholder="vinyl_lover" />
          </label>

          <label className="field">
            <span>Email</span>
            <input type="email" name="email" required placeholder="you@example.com" />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" name="password" required placeholder="••••••••" />
          </label>

          <label className="field">
            <span>Confirm Password</span>
            <input type="password" name="rePassword" required placeholder="••••••••" />
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" className="auth-submit" disabled={pending}>
            {pending ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}
