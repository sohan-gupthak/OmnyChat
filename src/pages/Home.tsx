import { Link } from 'react-router-dom';
import { useAppSelector } from '../store';
import { Icon } from '../components/ui/Icon';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  return (
    <div className="home">
      <header className="home__nav">
        <Link to="/" className="home__brand" aria-label="OmnyChat">
          <span className="home__brand-mark" aria-hidden="true">
            <Icon name="shield" size={14} strokeWidth={2.25} />
          </span>
          OmnyChat
        </Link>
        <nav className="home__nav-links" aria-label="Primary">
          {isAuthenticated ? (
            <Link to="/chat" className="om-btn om-btn--primary om-btn--sm">
              Open chat
              <Icon name="arrow-right" size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="om-btn om-btn--ghost om-btn--sm">
                Sign in
              </Link>
              <Link to="/register" className="om-btn om-btn--primary om-btn--sm">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="home__hero">
        <div className="home__hero-inner">
          <span className="home__eyebrow">
            <span className="dot" aria-hidden="true" />
            End-to-end encrypted by default
          </span>
          <h1 className="home__title">
            Private conversations, <em>quietly designed.</em>
          </h1>
          <p className="home__lede">
            OmnyChat is a secure messaging app with hybrid delivery — direct peer-to-peer
            when possible, server-relayed when not. No tracking, no noise, just the
            conversation.
          </p>
          <div className="home__cta">
            {isAuthenticated ? (
              <Link to="/chat" className="om-btn om-btn--primary">
                Continue to chat
                <Icon name="arrow-right" size={14} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="om-btn om-btn--primary">
                  Create an account
                  <Icon name="arrow-right" size={14} />
                </Link>
                <Link to="/login" className="om-btn om-btn--quiet">
                  I already have one
                </Link>
              </>
            )}
            <span className="home__cta-meta">Free · Open-source · Zero-knowledge</span>
          </div>
        </div>
      </section>

      <section className="home__features" aria-label="Features">
        <div className="home__features-inner">
          <article className="home__feature">
            <span className="home__feature-icon">
              <Icon name="lock" size={18} />
            </span>
            <h3>End-to-end encryption</h3>
            <p>
              Messages are encrypted on your device with AES-GCM, using a per-conversation
              key derived from ECDH. We never see the plaintext.
            </p>
          </article>
          <article className="home__feature">
            <span className="home__feature-icon">
              <Icon name="wifi" size={18} />
            </span>
            <h3>Hybrid delivery</h3>
            <p>
              Direct peer-to-peer over WebRTC when both sides are reachable. Falls back
              to server-relayed transport without interrupting your chat.
            </p>
          </article>
          <article className="home__feature">
            <span className="home__feature-icon">
              <Icon name="shield" size={18} />
            </span>
            <h3>Key verification</h3>
            <p>
              Compare fingerprints in person or out-of-band to confirm your channel
              hasn&apos;t been tampered with.
            </p>
          </article>
          <article className="home__feature">
            <span className="home__feature-icon">
              <Icon name="user" size={18} />
            </span>
            <h3>You stay in control</h3>
            <p>
              No phone number required. No address book scraping. Accounts live on
              your keys, not ours.
            </p>
          </article>
        </div>
      </section>

      <footer className="home__footer">
        <span>© {new Date().getFullYear()} OmnyChat</span>
        <span>Built for quiet, private conversations.</span>
      </footer>
    </div>
  );
};

export default Home;