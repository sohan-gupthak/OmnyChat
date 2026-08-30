import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { login } from '../../store/slices/authSlice';
import { Icon, Spinner } from '../ui/Icon';
import './auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error: authError } = useAppSelector((s) => s.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const result = await dispatch(login({ email, password }));
      if (login.fulfilled.match(result)) {
        navigate('/chat');
      } else if (login.rejected.match(result)) {
        setError((result.payload as string) || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="auth">
      <aside className="auth__pane" aria-hidden="false">
        <Link to="/" className="auth__pane-brand">
          <span className="mark">
            <Icon name="shield" size={14} strokeWidth={2.25} />
          </span>
          OmnyChat
        </Link>
        <div className="auth__pane-hero">
          <h1>
            Private conversations, <em>quietly designed.</em>
          </h1>
          <p>
            End-to-end encrypted messaging with hybrid delivery — peer-to-peer when
            possible, server-relayed when not.
          </p>
          <ul className="auth__pane-list">
            <li>
              <span className="check">
                <Icon name="check" size={12} strokeWidth={2.5} />
              </span>
              AES-GCM with per-conversation keys
            </li>
            <li>
              <span className="check">
                <Icon name="check" size={12} strokeWidth={2.5} />
              </span>
              ECDH key agreement with optional fingerprint verification
            </li>
            <li>
              <span className="check">
                <Icon name="check" size={12} strokeWidth={2.5} />
              </span>
              No phone number, no address book, no tracking
            </li>
          </ul>
        </div>
        <p className="auth__pane-foot">© {new Date().getFullYear()} OmnyChat</p>
      </aside>

      <main className="auth__form-wrap">
        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <header className="auth__head">
            <h2>Welcome back</h2>
            <p>Sign in to continue your conversations.</p>
          </header>

          {(error || authError) && (
            <div className="auth__error" role="alert">
              {error || authError}
            </div>
          )}

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
              placeholder="Your password"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="om-btn om-btn--primary om-btn--block"
            disabled={isLoading}
            style={{ height: 44 }}
          >
            {isLoading ? <Spinner size={16} /> : null}
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="auth__foot">
            New here?{' '}
            <Link to="/register" className="om-link">
              Create an account
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default Login;