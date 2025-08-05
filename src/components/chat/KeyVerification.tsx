import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { KeyService } from '../../services';
import { markKeyAsVerified, getUserKey } from '../../store/slices/keysSlice';
import './KeyVerificationNeobrutalism.css';

interface KeyVerificationProps {
  contactId: number;
  onClose: () => void;
}

const KeyVerification: React.FC<KeyVerificationProps> = ({ contactId, onClose }) => {
  const dispatch = useAppDispatch();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  
  const { keyPair, contactKeys, serverKey } = useAppSelector(state => state.keys);
  const { contacts } = useAppSelector(state => state.contacts);
  
  const contact = contacts.find(c => c.contactId === contactId);
  const contactKey = contactKeys[contactId];
  
  // Check if key is already verified
  useEffect(() => {
    // Ensure contactId is a valid number
    const parsedContactId = typeof contactId === 'string' 
      ? parseInt(contactId, 10) 
      : contactId;
      
    if (!parsedContactId || isNaN(parsedContactId) || parsedContactId <= 0) {
      console.error('Invalid contact ID provided for key verification:', contactId);
      setVerificationError('Invalid contact ID');
      return;
    }
    
    // Use the parsed contactId for all operations
    const validContactId = parsedContactId;
    
    // Get the contact key using the validated ID
    const contactKey = contactKeys[validContactId];
    
    if (contactKey?.verified) {
      setIsVerified(true);
    }
  }, [contactId, contactKey]);

  // Fetch contact key if not available
  useEffect(() => {
    // Ensure contactId is a valid number
    const parsedContactId = typeof contactId === 'string' 
      ? parseInt(contactId, 10) 
      : contactId;
      
    if (!parsedContactId || isNaN(parsedContactId) || parsedContactId <= 0) {
      console.error('Invalid contact ID provided for key verification:', contactId);
      setVerificationError('Invalid contact ID');
      return;
    }
    
    // Use the parsed contactId for all operations
    const validContactId = parsedContactId;
    
    if (!contactKeys[validContactId]?.publicKey) {
      console.log(`Contact key not found for ID ${validContactId}, fetching...`);
      // Dispatch the action and handle the promise to track loading state
      setVerificationError('Fetching contact key...');
      dispatch(getUserKey(validContactId))
        .unwrap()
        .then(() => {
          console.log(`Successfully fetched contact key for ID ${validContactId}`);
          setVerificationError(null);
        })
        .catch((error) => {
          console.error(`Failed to fetch contact key for ID ${validContactId}:`, error);
          setVerificationError(`Failed to fetch contact key. Please try again.`);
        });
    }
  }, [contactId, contactKeys, dispatch]);

  // Generate key fingerprint for verification
  useEffect(() => {
    // Ensure contactId is a valid number
    const parsedContactId = typeof contactId === 'string' 
      ? parseInt(contactId, 10) 
      : contactId;
      
    if (!parsedContactId || isNaN(parsedContactId) || parsedContactId <= 0) {
      setFingerprint('Invalid contact ID');
      return;
    }
    
    // Use the parsed contactId for all operations
    const validContactId = parsedContactId;
    const contactKey = contactKeys[validContactId];
    
    if (!contactKey?.publicKey) {
      setFingerprint('Loading fingerprint...');
      return;
    }

    const generateFingerprint = async () => {
      if (!contactId || isNaN(contactId) || contactId <= 0) {
        console.error('Invalid contact ID provided for key verification:', contactId);
        setVerificationError('Invalid contact ID');
        return;
      }

      // Log the state to help debug
      console.log('Key verification state:', {
        contactId,
        hasContactKey: !!contactKey,
        publicKey: contactKey?.publicKey ? 'present' : 'missing',
      });

      if (!contactKey?.publicKey) {
        console.log('Contact key not found, waiting for key to be fetched...');
        setFingerprint(null);
        return;
      }

      try {
        console.log('Generating fingerprint from public key...');
        // Create a SHA-256 hash of the public key
        const encoder = new TextEncoder();
        const data = encoder.encode(contactKey.publicKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        
        // Convert hash to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Format fingerprint in groups of 4 characters
        const formattedFingerprint = hashHex.match(/.{1,4}/g)?.join(' ') || hashHex;
        console.log('Fingerprint generated successfully');
        setFingerprint(formattedFingerprint);
      } catch (error) {
        console.error('Error generating fingerprint:', error);
        setVerificationError('Failed to generate key fingerprint');
      }
    };
    
    generateFingerprint();
  }, [contactId, contactKey]);
  
  // Verify the contact's key signature using the server's public key
  useEffect(() => {
    // Ensure contactId is a valid number
    const parsedContactId = typeof contactId === 'string' 
      ? parseInt(contactId, 10) 
      : contactId;
      
    if (!parsedContactId || isNaN(parsedContactId) || parsedContactId <= 0) {
      return;
    }
    
    // Use the parsed contactId for all operations
    const validContactId = parsedContactId;
    const contactKey = contactKeys[validContactId];
    
    if (!contactKey?.publicKey || !contactKey?.signature || !serverKey) {
      return;
    }
    
    if (!contactKey || !serverKey) {
      setVerificationError('Missing keys for verification');
    }
  }, [contactId, contactKey, serverKey]);

  const verifyKeySignature = async () => {
    // Ensure contactId is a valid number
    const parsedContactId = typeof contactId === 'string' 
      ? parseInt(contactId, 10) 
      : contactId;
      
    if (!parsedContactId || isNaN(parsedContactId) || parsedContactId <= 0) {
      console.error('Invalid contact ID for key verification:', contactId);
      setVerificationError('Invalid contact ID');
      return;
    }
    
    // Use the parsed contactId for all operations
    const validContactId = parsedContactId;
    const contactKey = contactKeys[validContactId];
    
    if (!contactKey?.publicKey || !contactKey?.signature || !serverKey) {
      setVerificationError('Missing keys for verification');
      return;
    }
    
    setIsVerifying(true);
    setVerificationError(null);
    
    try {
      const isValid = await KeyService.verifyKeySignature(contactKey, serverKey);
      setIsVerified(isValid);
      
      if (!isValid) {
        setVerificationError('Key signature verification failed. This key may not be authentic.');
      }
    } catch (error) {
      console.error('Error verifying key signature:', error);
      setVerificationError('Failed to verify key signature');
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Mark the key as manually verified by the user
  const manuallyVerifyKey = () => {
    // Ensure contactId is a valid number
    const parsedContactId = typeof contactId === 'string' 
      ? parseInt(contactId, 10) 
      : contactId;
      
    if (!parsedContactId || isNaN(parsedContactId) || parsedContactId <= 0) {
      console.error('Invalid contact ID for key verification:', contactId);
      setVerificationError('Invalid contact ID');
      return;
    }
    
    dispatch(markKeyAsVerified(parsedContactId));
    setIsVerified(true);
  };
  
  // Debug log for component state
  useEffect(() => {
    console.log('KeyVerification component state:', {
      contactId,
      contact: contact ? 'present' : 'missing',
      contactKey: contactKey ? 'present' : 'missing',
      publicKey: contactKey?.publicKey ? 'present' : 'missing',
      fingerprint: fingerprint ? 'generated' : 'not generated',
      verificationError: verificationError || 'none'
    });
  }, [contactId, contact, contactKey, fingerprint, verificationError]);

  return (
    <div className="key-verification-overlay">
      <div className="key-verification-modal-neobrutalism card-neobrutalism">
        <div className="modal-header-neobrutalism header-neobrutalism">
          <h3>Verify Security Keys</h3>
          <button className="btn-neobrutalism" onClick={onClose} style={{ width: '2rem', height: '2rem', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-content-neobrutalism">
          <p className="verification-intro">
            To verify that your conversation with <strong>{contact?.username}</strong> is secure,
            compare the fingerprint below with the one they see on their device.
          </p>
          
          <div className="fingerprint-container-neobrutalism">
            <h4>Key Fingerprint:</h4>
            {fingerprint ? (
              <div className="fingerprint-neobrutalism">{fingerprint}</div>
            ) : verificationError ? (
              <div className="fingerprint-error-neobrutalism">
                <i className="fas fa-exclamation-circle"></i> {verificationError}
              </div>
            ) : (
              <div className="fingerprint-loading-neobrutalism">
                <i className="fas fa-spinner fa-spin"></i> Loading fingerprint...
              </div>
            )}
          </div>
          
          <div className="verification-status-neobrutalism">
            {isVerified ? (
              <div className="verified-neobrutalism">
                <i className="fas fa-shield-alt"></i>
                <span>Key verified and secure</span>
              </div>
            ) : (
              <div className="unverified-neobrutalism">
                <i className="fas fa-shield-alt"></i>
                <span>Key not verified</span>
              </div>
            )}
          </div>
          
          {verificationError && (
            <div className="verification-error-neobrutalism">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{verificationError}</span>
            </div>
          )}
          
          <div className="verification-instructions-neobrutalism">
            <h4>How to verify:</h4>
            <ol>
              <li>Ask your contact to open the key verification screen</li>
              <li>Compare the fingerprint shown on both devices</li>
              <li>If they match, your connection is secure</li>
              <li>If they don't match, someone might be intercepting your messages</li>
            </ol>
          </div>
        </div>
        
        <div className="modal-footer-neobrutalism">
          <button 
            className="btn-neobrutalism verify"
            onClick={verifyKeySignature}
            disabled={isVerifying || !contactKey || !serverKey}
          >
            {isVerifying ? 'Verifying...' : 'Verify Server Signature'}
          </button>
          <button 
            className="btn-neobrutalism manual"
            onClick={manuallyVerifyKey}
            disabled={isVerified || !contactKey}
          >
            {isVerified ? 'Manually Verified' : 'I Verified This Key'}
          </button>
          <button className="btn-neobrutalism close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default KeyVerification;
