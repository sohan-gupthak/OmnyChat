import React, { useState } from 'react';
import { User } from '../../types';
import { contactRequestService } from '../../services';
import { Avatar, Spinner } from '../ui/Icon';
import '../chat/chat.css';

interface UserProfileProps {
  user: User;
  isContact?: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isContact = false, onClose }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const send = async () => {
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await contactRequestService.sendRequest(user.id);
      if (res.success) setSuccess('Contact request sent');
      else setError(res.error || 'Failed to send contact request');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send contact request';
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="modal__body">
        <div className="profile-modal">
          <Avatar name={user.username} size="xl" />
          <h2 className="profile-modal__name">{user.username}</h2>
          <dl className="profile-modal__meta">
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>User ID</dt>
              <dd>#{user.id}</dd>
            </div>
          </dl>
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
        {success && (
          <div
            style={{
              color: 'var(--color-success)',
              background: 'var(--color-success-soft)',
              padding: 'var(--sp-3)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--fs-sm)',
            }}
          >
            {success}
          </div>
        )}
      </div>
      <footer className="modal__foot">
        <button type="button" className="om-btn om-btn--quiet" onClick={onClose}>
          Close
        </button>
        {!isContact && (
          <button
            type="button"
            className="om-btn om-btn--primary"
            onClick={send}
            disabled={sending || !!success}
          >
            {sending && <Spinner size={14} />}
            {success
              ? 'Request sent'
              : sending
                ? 'Sending…'
                : 'Send contact request'}
          </button>
        )}
      </footer>
    </>
  );
};

export default UserProfile;