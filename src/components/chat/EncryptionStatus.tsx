import React from 'react';
import { useAppSelector } from '../../store';
import { useSharedKey } from '../../store/sharedKeyStore';
import { Icon } from '../ui/Icon';

const EncryptionStatus: React.FC = () => {
  const { selectedContact } = useAppSelector((s) => s.contacts);
  const { contactKeys } = useAppSelector((s) => s.keys);
  const sharedKey = useSharedKey(selectedContact?.contactId);

  if (!selectedContact) return null;
  const ck = contactKeys[selectedContact.contactId];
  const contactHasNoKey = ck !== undefined && ck.publicKey === '';
  const hasLocalKey = !!ck && ck.publicKey !== '';
  const hasSharedKey = !!sharedKey;
  const verified = ck?.verified ?? false;

  let label: string;
  let icon: 'lock' | 'eye' | 'shield';
  let cls: string;
  let title: string;

  if (contactHasNoKey) {
    label = 'No key';
    icon = 'eye';
    cls = 'status-pill status-pill--warn';
    title = 'This contact has not published an encryption key yet';
  } else if (hasSharedKey) {
    label = verified ? 'Verified' : 'Encrypted';
    icon = 'lock';
    cls = verified ? 'status-pill status-pill--ok' : 'status-pill status-pill--ok';
    title = verified
      ? 'End-to-end encrypted · key fingerprint verified'
      : 'Messages are end-to-end encrypted';
  } else if (hasLocalKey) {
    label = 'Setting up…';
    icon = 'shield';
    cls = 'status-pill status-pill--warn';
    title = 'Deriving shared key';
  } else {
    return null;
  }

  return (
    <span className={cls} title={title} aria-live="polite">
      <Icon name={icon} size={12} />
      {label}
      {verified && <Icon name="check" size={12} strokeWidth={2.5} />}
    </span>
  );
};

export default EncryptionStatus;