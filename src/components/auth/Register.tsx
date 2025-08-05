import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { register } from '../../store/slices/authSlice';
import DecryptedText from '../ui/DecryptedText';
import './AuthNeobrutalism.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error: authError } = useAppSelector(state => state.auth);

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
      const resultAction = await dispatch(register({ username, email, password }));
      if (register.fulfilled.match(resultAction)) {
        navigate('/chat');
      } else if (register.rejected.match(resultAction)) {
        setError(resultAction.payload as string || 'Registration failed');
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
              text="Create an Account" 
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
              text="Join OmnyChat for secure messaging" 
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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              disabled={isLoading}
              required
            />
          </div>
          
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
              placeholder="Create a password"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="form-group-neobrutalism">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={isLoading}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button-neobrutalism"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer-neobrutalism">
          <p>
            Already have an account?{' '}
            <span 
              className="auth-link-neobrutalism"
              onClick={() => navigate('/login')}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
