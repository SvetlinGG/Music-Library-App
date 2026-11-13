import { Link } from "react-router";
import request from "../api/user-Supabase-request";

export default function Register() {

  const saveClickHandler = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const user = {
      user_name: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
    }

    request('/', 'POST', user)
  }


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
            <input type="text" name="username" placeholder="vinyl_lover" />
          </label>

          <label className="field">
            <span>Email</span>
            <input type="email" name="email" placeholder="you@example.com" />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" name="password" placeholder="••••••••" />
          </label>

          <label className="field">
            <span>Confirm Password</span>
            <input type="password" name="rePassword" placeholder="••••••••" />
          </label>

          <button type="submit" className="auth-submit">Create Account</button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}
