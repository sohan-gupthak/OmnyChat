import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { KeyService } from '../../services';
import { markKeyAsVerified, getUserKey } from '../../store/slices/keysSlice';
import { Icon, Spinner } from '../ui/Icon';
import './chat.css';

interface KeyVerificationProps {
  contactId: number;
  onClose: () => void;
}

const KeyVerification: React.FC<KeyVerificationProps> = ({ contactId, onClose }) => {
  const dispatch = useAppDispatch();
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  const { contactKeys, serverKey } = useAppSelector((s) => s.keys);
  const { contacts } = useAppSelector((s) => s.contacts);
  const contact = contacts.find((c) => c.contactId === contactId);
  const contactKey = contactKeys[contactId];

  useEffect(() => {
    if (contactKey?.verified) setIsVerified(true);
  }, [contactKey]);

  useEffect(() => {
    if (!contactKeys[contactId]?.publicKey) {
      dispatch(getUserKey(contactId))
        .unwrap()
        .catch(() => setError('Failed to fetch contact key. Please try again.'));
    }
  }, [contactId, dispatch]);

  useEffect(() => {
    const ck = contactKeys[contactId];
    if (!ck?.publicKey) {
      setFingerprint(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = new TextEncoder().encode(ck.publicKey);
        const hash = await crypto.subtle.digest('SHA-256', data);
        const hex = Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        const grouped = hex.match(/.{1,4}/g)?.join(' ') ?? hex;
        if (!cancelled) setFingerprint(grouped);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('Failed to generate key fingerprint');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contactId, contactKey]);

  const runVerify = async () => {
    const ck = contactKeys[contactId];
    if (!ck?.publicKey || !ck?.signature || !serverKey) {
      setError('Missing keys for verification');
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      const ok = await KeyService.verifyKeySignature(ck, serverKey);
      setIsVerified(ok);
      if (!ok) setError('Signature verification failed. This key may not be authentic.');
    } catch (e) {
      console.error(e);
      setError('Failed to verify key signature');
    } finally {
      setVerifying(false);
    }
  };

  const manualVerify = () => {
    dispatch(markKeyAsVerified(contactId));
    setIsVerified(true);
  };

  return (
    <div className="kv-overlay" role="dialog" aria-modal="true" aria-label="Verify keys">
      <div className="kv-modal">
        <header className="kv-modal__head">
          <h3 className="kv-modal__title">
            Verify keys with {contact?.username ?? 'contact'}
          </h3>
          <button
            type="button"
            className="om-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="x" size={16} />
          </button>
        </header>
        <div className="kv-modal__body">
          <p className="kv-intro">
            Compare the fingerprint below with what your contact sees on their device.
            If both match, your channel is authentic.
          </p>

          <div>
            <div
              style={{
                fontSize: 'var(--fs-xs)',
                color: 'var(--color-text-subtle)',
                marginBottom: 'var(--sp-2)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Fingerprint
            </div>
            <div className="kv-fingerprint" aria-live="polite">
              {fingerprint ?? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Spinner size={14} /> Generating…
                </span>
              )}
            </div>
          </div>

          <div className={`kv-status ${isVerified ? 'kv-status--ok' : ''}`}>
            <span className="kv-status__dot" aria-hidden="true" />
            {isVerified ? 'Verified' : 'Not verified'}
          </div>

          {error && (
            <div
              style={{
                color: 'var(--color-danger)',
                background: 'var(--color-danger-soft)',
                padding: 'var(--sp-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--fs-sm)',
              }}
            >
              {error}
            </div>
          )}

          <div className="kv-instructions">
            <h4>How to verify</h4>
            <ol>
              <li>Ask your contact to open this same screen.</li>
              <li>Read the fingerprints aloud or compare over a trusted channel.</li>
              <li>If they match, tap “I verified this key”.</li>
              <li>If they don&apos;t, your connection may be tampered with — don&apos;t send sensitive messages.</li>
            </ol>
          </div>
        </div>
        <footer className="kv-modal__foot">
          <button
            type="button"
            className="om-btn om-btn--quiet"
            onClick={runVerify}
            disabled={verifying || !contactKey || !serverKey}
          >
            {verifying && <Spinner size={14} />}
            {verifying ? 'Verifying…' : 'Verify signature'}
          </button>
          <button
            type="button"
            className="om-btn om-btn--primary"
            onClick={manualVerify}
            disabled={isVerified || !contactKey}
          >
            {isVerified ? (
              <>
                <Icon name="check" size={14} strokeWidth={2.5} /> Verified
              </>
            ) : (
              'I verified this key'
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default KeyVerification;