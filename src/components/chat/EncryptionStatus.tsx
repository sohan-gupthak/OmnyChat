import React from 'react';
import { useAppSelector } from '../../store';
import './Chat.css';

/**
 * EncryptionStatus component
 * 
 * Displays the current encryption status for the active chat
 * Shows whether end-to-end encryption is active and the key verification status
 */
const EncryptionStatus: React.FC = () => {
  const { selectedContact } = useAppSelector(state => state.contacts);
  const { conversations } = useAppSelector(state => state.messages);
  const { contactKeys } = useAppSelector(state => state.keys);
  
  if (!selectedContact) return null;
  
  const conversation = conversations[selectedContact.contactId];
  const contactKey = contactKeys[selectedContact.contactId];
  const hasSharedKey = !!conversation?.sharedKey;
  const isKeyVerified = contactKey?.verified || false;
  
  return (
    <div className="encryption-status">
      {hasSharedKey ? (
        <div className="status encrypted" title="Messages are end-to-end encrypted">
          <i className="fas fa-lock"></i>
          <span>Encrypted</span>
          {isKeyVerified && (
            <i className="fas fa-check-circle verified-icon" title="Key verified"></i>
          )}
        </div>
      ) : (
        <div className="status not-encrypted" title="Establishing secure connection">
          <i className="fas fa-unlock"></i>
          <span>Setting up encryption...</span>
        </div>
      )}
    </div>
  );
};

export default EncryptionStatus;
