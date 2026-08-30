import React from 'react';
import { useAppSelector } from '../../store';
import { useSharedKey } from '../../store/sharedKeyStore';
import './Chat.css';

const EncryptionStatus: React.FC = () => {
  const { selectedContact } = useAppSelector((s) => s.contacts);
  const { contactKeys } = useAppSelector((s) => s.keys);
  const sharedKey = useSharedKey(selectedContact?.contactId);

  if (!selectedContact) return null;

  const contactKey = contactKeys[selectedContact.contactId];
  const contactHasNoKey =
    contactKey !== undefined && contactKey.publicKey === '';
  const hasLocalKey = !!contactKey && contactKey.publicKey !== '';
  const hasSharedKey = !!sharedKey;
  const isKeyVerified = contactKey?.verified || false;

  let label = 'Setting up encryption...';
  let icon = 'fa-unlock';
  let title = 'Establishing secure connection';
  let statusClass = 'not-encrypted';

  if (contactHasNoKey) {
    label = 'Contact not encrypted';
    icon = 'fa-user-lock';
    title = 'This contact has not published an encryption key yet';
    statusClass = 'not-encrypted';
  } else if (hasSharedKey) {
    label = 'Encrypted';
    icon = 'fa-lock';
    title = 'Messages are end-to-end encrypted';
    statusClass = 'encrypted';
  } else if (hasLocalKey) {
    label = 'Setting up encryption...';
    icon = 'fa-unlock';
    title = 'Deriving shared key';
    statusClass = 'not-encrypted';
  }

  return (
    <div className="encryption-status">
      <div className={`status ${statusClass}`} title={title}>
        <i className={`fas ${icon}`}></i>
        <span>{label}</span>
        {isKeyVerified && (
          <i className="fas fa-check-circle verified-icon" title="Key verified"></i>
        )}
      </div>
    </div>
  );
};

export default EncryptionStatus;
