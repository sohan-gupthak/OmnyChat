import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { register } from '../../store/slices/authSlice';
import { Icon, Spinner } from '../ui/Icon';
import './auth.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error: authError } = useAppSelector((s) => s.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    try {
      const result = await dispatch(register({ username, email, password }));
      if (register.fulfilled.match(result)) {
        navigate('/chat');
      } else if (register.rejected.match(result)) {
        setError((result.payload as string) || 'Registration failed');
      }
    } catch {
      setError('An unexpected error occurred');
    }
  };

  const pwOk = password.length === 0 || password.length >= 8;
  const pwMatch = confirmPassword.length === 0 || password === confirmPassword;

  return (
    <div className="auth">
      <aside className="auth__pane">
        <Link to="/" className="auth__pane-brand">
          <span className="mark">
            <Icon name="shield" size={14} strokeWidth={2.25} />
          </span>
          OmnyChat
        </Link>
        <div className="auth__pane-hero">
          <h1>
            Start a private channel in <em>under a minute.</em>
          </h1>
          <p>
            Create an account, generate your encryption keys locally, and start a
            secure conversation right away.
          </p>
          <ul className="auth__pane-list">
            <li>
              <span className="check">
                <Icon name="check" size={12} strokeWidth={2.5} />
              </span>
              Keys generated on your device — never uploaded
            </li>
            <li>
              <span className="check">
                <Icon name="check" size={12} strokeWidth={2.5} />
              </span>
              Direct messages, server fallback, and key verification built in
            </li>
            <li>
              <span className="check">
                <Icon name="check" size={12} strokeWidth={2.5} />
              </span>
              Minimal account info: just a username and an email
            </li>
          </ul>
        </div>
        <p className="auth__pane-foot">© {new Date().getFullYear()} OmnyChat</p>
      </aside>

      <main className="auth__form-wrap">
        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <header className="auth__head">
            <h2>Create your account</h2>
            <p>A username, an email, a password. That&apos;s it.</p>
          </header>

          {(error || authError) && (
            <div className="auth__error" role="alert">
              {error || authError}
            </div>
          )}

          <div className="auth__field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="om-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              autoComplete="username"
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="om-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="om-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              disabled={isLoading}
              required
            />
            {!pwOk && (
              <span className="auth__hint">Use 8 characters or more.</span>
            )}
          </div>

          <div className="auth__field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              className="om-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat the password"
              autoComplete="new-password"
              disabled={isLoading}
              required
            />
            {!pwMatch && <span className="auth__hint">Passwords don&apos;t match.</span>}
          </div>

          <button
            type="submit"
            className="om-btn om-btn--primary om-btn--block"
            disabled={isLoading}
            style={{ height: 44 }}
          >
            {isLoading ? <Spinner size={16} /> : null}
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="auth__foot">
            Already have an account?{' '}
            <Link to="/login" className="om-link">
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default Register;