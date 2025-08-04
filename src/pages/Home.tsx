import { Link } from 'react-router-dom';
import { useAppSelector } from '../store';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>OmnyChat</h1>
        <p className="tagline">Secure, Real-time, Hybrid Chat Application</p>
        
        <div className="features">
          <div className="feature-item">
            <i className="fas fa-lock"></i>
            <h3>End-to-End Encryption</h3>
            <p>Your messages are encrypted and can only be read by you and the recipient</p>
          </div>
          
          <div className="feature-item">
            <i className="fas fa-exchange-alt"></i>
            <h3>Hybrid Communication</h3>
            <p>Direct P2P messaging with server fallback for reliability</p>
          </div>
          
          <div className="feature-item">
            <i className="fas fa-key"></i>
            <h3>Key Verification</h3>
            <p>Verify contact keys to ensure secure communication</p>
          </div>
        </div>
        
        <div className="cta-buttons">
          {isAuthenticated ? (
            <Link to="/chat" className="cta-button primary">Go to Chat</Link>
          ) : (
            <>
              <Link to="/login" className="cta-button primary">Login</Link>
              <Link to="/register" className="cta-button secondary">Register</Link>
            </>
          )}
        </div>
      </div>
      
      <div className="security-info">
        <h2>How OmnyChat Keeps Your Messages Secure</h2>
        <div className="security-features">
          <div className="security-feature">
            <h4>ECDH Key Exchange</h4>
            <p>Secure key exchange for establishing encrypted communication</p>
          </div>
          
          <div className="security-feature">
            <h4>AES-GCM Encryption</h4>
            <p>Strong encryption algorithm for message content</p>
          </div>
          
          <div className="security-feature">
            <h4>WebRTC Data Channels</h4>
            <p>Direct peer-to-peer communication when possible</p>
          </div>
          
          <div className="security-feature">
            <h4>Server-Signed Keys</h4>
            <p>Public keys are signed by the server for authenticity</p>
          </div>
        </div>
      </div>
      
      <footer className="home-footer">
        <p>© {new Date().getFullYear()} OmnyChat - Secure Messaging</p>
      </footer>
    </div>
  );
};

export default Home;
