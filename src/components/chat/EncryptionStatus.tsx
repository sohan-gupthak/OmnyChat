import React from 'react';
import { useAppSelector } from '../../store';
import './Chat.css';

const EncryptionStatus: React.FC = () => {
  const { selectedContact } = useAppSelector((s) => s.contacts);
  const { conversations } = useAppSelector((s) => s.messages);
  const { contactKeys } = useAppSelector((s) => s.keys);

  if (!selectedContact) return null;

  const conversation = conversations[selectedContact.contactId];
  const contactKey = contactKeys[selectedContact.contactId];
  const contactHasNoKey =
    contactKey !== undefined && contactKey.publicKey === '';
  const hasLocalKey = !!contactKey && contactKey.publicKey !== '';
  const hasSharedKey = !!conversation?.sharedKey;
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
