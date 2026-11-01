import { Link } from "react-router";

export default function Login() {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="eyebrow">Welcome back</span>
          <h1>Login</h1>
          <p className="auth-subtitle">Sign in to continue to your collection.</p>
        </div>

        <form className="auth-form" onSubmit={e => e.preventDefault()}>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" placeholder="you@example.com" />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" name="password" placeholder="••••••••" />
          </label>

          <div className="auth-row">
            <label className="checkbox">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>
            <a href="#" className="auth-link-muted">Forgot password?</a>
          </div>

          <button type="submit" className="auth-submit">Login</button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </section>
  );
}
