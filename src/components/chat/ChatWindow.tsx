import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { getUserKey } from '../../store/slices/keysSlice';
import { KeyService } from '../../services';
import { updateUnreadCount } from '../../store/slices/contactsSlice';
import { fetchConversationHistory } from '../../store/slices/messagesSlice';
import { setSharedKey as setSharedKeyMap, useSharedKey } from '../../store/sharedKeyStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import KeyVerification from './KeyVerification';
import ConnectionStatus from './ConnectionStatus';
import EncryptionStatus from './EncryptionStatus';
import { Avatar, Icon } from '../ui/Icon';
import './chat.css';

const ChatWindow: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  const [showKeyVerification, setShowKeyVerification] = useState(false);

  const { user } = useAppSelector((s) => s.auth);
  const { selectedContact } = useAppSelector((s) => s.contacts);
  const { conversations } = useAppSelector((s) => s.messages);
  const { keyPair, contactKeys } = useAppSelector((s) => s.keys);

  const currentUserId = user?.id || 0;
  const conversation = selectedContact ? conversations[selectedContact.contactId] : undefined;
  const messages = conversation?.messages || [];
  const sharedKey = useSharedKey(selectedContact?.contactId);

  const derivedFor = React.useRef<Map<number, string>>(new Map());

  React.useEffect(() => {
    const id = selectedContact?.contactId;
    if (!id) return;
    dispatch(fetchConversationHistory(id));
    dispatch(updateUnreadCount({ contactId: id, increment: false }));
  }, [dispatch, selectedContact?.contactId]);

  React.useEffect(() => {
    const id = selectedContact?.contactId;
    if (!id) return;
    if (!contactKeys[id]) dispatch(getUserKey(id));
  }, [dispatch, selectedContact?.contactId]);

  React.useEffect(() => {
    const id = selectedContact?.contactId;
    if (!id || !keyPair?.privateKey) return;
    const ck = contactKeys[id];
    if (sharedKey) return;
    if (!ck) {
      dispatch(getUserKey(id));
      return;
    }
    if (!ck.publicKey) return;
    const attempt = `${keyPair.privateKey}::${ck.publicKey}`;
    if (derivedFor.current.get(id) === attempt) return;
    derivedFor.current.set(id, attempt);
    void (async () => {
      try {
        const derived = await KeyService.deriveSharedKey(keyPair.privateKey, ck.publicKey);
        setSharedKeyMap(id, derived);
      } catch (e) {
        console.error('Error deriving shared key:', e);
      }
    })();
  }, [dispatch, selectedContact, keyPair, contactKeys[selectedContact?.contactId ?? -1]]);

  if (!selectedContact) {
    return (
      <main className="chat__main">
        <div className="chat-empty">
          <span style={{ color: 'var(--color-text-subtle)' }}>
            <Icon name="message" size={36} strokeWidth={1.25} />
          </span>
          <h2 className="chat-empty__title">Pick a conversation</h2>
          <p className="chat-empty__desc">
            Select a contact on the left to start a private, end-to-end encrypted
            conversation. Or search above to add someone.
          </p>
        </div>
      </main>
    );
  }

  const online = selectedContact.isOnline;
  const lastSeen = selectedContact.lastSeen
    ? new Date(selectedContact.lastSeen).toLocaleString()
    : null;

  return (
    <main className="chat__main">
      <header className="chat-topbar">
        <button
          type="button"
          className="om-icon-btn chat-topbar__back"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <Icon name="arrow-left" size={16} />
        </button>
        <Avatar name={selectedContact.username} online={online} />
        <div className="chat-topbar__who">
          <div className="chat-topbar__name">{selectedContact.username}</div>
          <div className="chat-topbar__sub">
            <span className={`dot ${online ? 'dot--online' : ''}`} aria-hidden="true" />
            {online ? 'Online now' : lastSeen ? `Last seen ${lastSeen}` : 'Offline'}
          </div>
        </div>
        <div className="chat-topbar__actions">
          <ConnectionStatus />
          <EncryptionStatus />
          <button
            type="button"
            className="om-icon-btn"
            onClick={() => {
              if (!selectedContact.contactId) return;
              if (!contactKeys[selectedContact.contactId]?.publicKey) {
                dispatch(getUserKey(selectedContact.contactId));
              }
              setShowKeyVerification(true);
            }}
            aria-label="Verify keys"
            title="Verify keys"
          >
            <Icon name="shield" size={16} />
          </button>
        </div>
      </header>

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        sharedKey={sharedKey || null}
      />

      <MessageInput
        recipientId={selectedContact.contactId}
        sharedKey={sharedKey || null}
      />

      {showKeyVerification && (
        <KeyVerification
          contactId={Number(selectedContact.contactId)}
          onClose={() => setShowKeyVerification(false)}
        />
      )}
    </main>
  );
};

export default ChatWindow;