import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { login } from '../../store/slices/authSlice';
import DecryptedText from '../ui/DecryptedText';
import './AuthNeobrutalism.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error: authError } = useAppSelector(state => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const resultAction = await dispatch(login({ email, password }));
      if (login.fulfilled.match(resultAction)) {
        navigate('/chat');
      } else if (login.rejected.match(resultAction)) {
        setError(resultAction.payload as string || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="auth-container-neobrutalism">
      <div className="auth-card-neobrutalism">
        <div className="auth-title-container">
          <h2>
            <DecryptedText 
              text="Login to OmnyChat" 
              animateOn="view" 
              revealDirection="center" 
              speed={150}
              maxIterations={15}
              characters="ABCD1234!?"
              className="auth-decrypted"
              parentClassName=""
              encryptedClassName="auth-encrypted"
            />
          </h2>
          <p className="auth-subtitle-neobrutalism">
            <DecryptedText 
              text="Secure, end-to-end encrypted messaging" 
              animateOn="view" 
              sequential={true}
              speed={50}
              className="auth-decrypted"
              parentClassName=""
              encryptedClassName="auth-encrypted"
            />
          </p>
        </div>
        
        {(error || authError) && (
          <div className="auth-error-neobrutalism">
            {error || authError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form-neobrutalism">
          <div className="form-group-neobrutalism">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="form-group-neobrutalism">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button-neobrutalism"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer-neobrutalism">
          <p>
            Don't have an account?{' '}
            <span 
              className="auth-link-neobrutalism"
              onClick={() => navigate('/register')}
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
