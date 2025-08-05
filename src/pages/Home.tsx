import { Link } from 'react-router-dom';
import { useAppSelector } from '../store';
import DecryptedText from '../components/ui/DecryptedText';
import './HomeNeobrutalism.css';

const Home = () => {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  return (
    <div className="home-container-neobrutalism">
      <div className="hero-section-neobrutalism">
        <h1><DecryptedText text="OmnyChat" 
          animateOn="view" 
          revealDirection="center" 
          speed={150}
          maxIterations={15}
          characters="ABCD1234!?"
          className="revealed"
          parentClassName=""
          encryptedClassName="encrypted"/></h1>
        <p className="tagline-neobrutalism"><DecryptedText text="Secure, Real-time, Hybrid Chat Application" 
          animateOn="view" 
          revealDirection="center" 
          speed={200}
          maxIterations={15}
          characters="ABCD1234!?"
          className="revealed"
          parentClassName=""
          encryptedClassName="encrypted"/></p>
        
        <div className="features-neobrutalism">
          <div className="feature-item-neobrutalism">
            <i className="fas fa-lock"></i>
            <h3><DecryptedText text="End-to-End Encryption" 
              animateOn="view" 
              revealDirection="center" 
              speed={300}
              maxIterations={15}
              characters="ABCD1234!?"
              className="revealed"
              parentClassName=""
              encryptedClassName="encrypted"/></h3>
            <p>Your messages are encrypted and can only be read by you and the recipient</p>
          </div>
          
          <div className="feature-item-neobrutalism">
            <i className="fas fa-exchange-alt"></i>
            <h3><DecryptedText text="Hybrid Communication" 
              animateOn="view" 
              revealDirection="center" 
              speed={300}
              maxIterations={15}
              characters="ABCD1234!?"
              className="revealed"
              parentClassName=""
              encryptedClassName="encrypted"/></h3>
            <p>Direct P2P messaging with server fallback for reliability</p>
          </div>
          
          <div className="feature-item-neobrutalism">
            <i className="fas fa-key"></i>
            <h3><DecryptedText text="Key Verification" 
              animateOn="view" 
              revealDirection="center" 
              speed={300}
              maxIterations={15}
              characters="ABCD1234!?"
              className="revealed"
              parentClassName=""
              encryptedClassName="encrypted"/></h3>
            <p>Verify contact keys to ensure secure communication</p>
          </div>
        </div>
        
        <div className="cta-buttons-neobrutalism">
          {isAuthenticated ? (
            <Link to="/chat" className="cta-button-neobrutalism primary">Go to Chat</Link>
          ) : (
            <>
              <Link to="/login" className="cta-button-neobrutalism primary">Login</Link>
              <Link to="/register" className="cta-button-neobrutalism secondary">Register</Link>
            </>
          )}
        </div>
      </div>
      
      <div className="security-info-neobrutalism">
        <h2>How OmnyChat Keeps Your Messages Secure</h2>
        <div className="security-features-neobrutalism">
          <div className="security-feature-neobrutalism">
            <h4>ECDH Key Exchange</h4>
            <p>Secure key exchange for establishing encrypted communication</p>
          </div>
          
          <div className="security-feature-neobrutalism">
            <h4>AES-GCM Encryption</h4>
            <p>Strong encryption algorithm for message content</p>
          </div>
          
          <div className="security-feature-neobrutalism">
            <h4>WebRTC Data Channels</h4>
            <p>Direct peer-to-peer communication when possible</p>
          </div>
          
          <div className="security-feature-neobrutalism">
            <h4>Server-Signed Keys</h4>
            <p>Public keys are signed by the server for authenticity</p>
          </div>
        </div>
      </div>
      
      <footer className="home-footer-neobrutalism">
        <p>© {new Date().getFullYear()} OmnyChat - Secure Messaging</p>
      </footer>
    </div>
  );
};

export default Home;
