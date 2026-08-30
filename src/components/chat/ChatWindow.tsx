import React, { useState, useEffect, useRef } from 'react';
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
import './Chat.css';

const ChatWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showKeyVerification, setShowKeyVerification] = useState(false);

  const { user } = useAppSelector(state => state.auth);
  const { selectedContact } = useAppSelector(state => state.contacts);
  const { conversations } = useAppSelector(state => state.messages);
  const { keyPair, contactKeys } = useAppSelector(state => state.keys);

  const currentUserId = user?.id || 0;
  const conversation = selectedContact ? conversations[selectedContact.contactId] : undefined;
  const messages = conversation?.messages || [];
  // Shared key lives outside Redux (CryptoKey is non-serializable).
  const sharedKey = useSharedKey(selectedContact?.contactId);
  
  // Track per-contact derivation attempts so re-renders that don't actually
  // change the inputs (e.g. a new messages array) don't re-run ECDH.
  const derivedFor = useRef<Map<number, string>>(new Map());

  // Fetch conversation history + reset unread count when the selected contact changes.
  useEffect(() => {
    const contactId = selectedContact?.contactId;
    if (!contactId) return;
    dispatch(fetchConversationHistory(contactId));
    dispatch(updateUnreadCount({ contactId, increment: false }));
  }, [dispatch, selectedContact?.contactId]);

  // Kick off the contact's public key fetch once per contact change. The slice
  // stores a sentinel (empty publicKey) on 404 so subsequent re-renders skip.
  useEffect(() => {
    const contactId = selectedContact?.contactId;
    if (!contactId) return;
    if (!contactKeys[contactId]) {
      dispatch(getUserKey(contactId));
    }
  }, [dispatch, selectedContact?.contactId]);

  // Derive shared key when both keys are available.
  useEffect(() => {
    const contactId = selectedContact?.contactId;
    if (!contactId || !keyPair?.privateKey) return;

    const contactKey = contactKeys[contactId];
    if (sharedKey) return; // already derived in this Map lifetime
    if (!contactKey) {
      dispatch(getUserKey(contactId));
      return;
    }
    if (!contactKey.publicKey) return; // 404 / null

    // Skip if we already attempted for this exact (privateKey, publicKey) pair.
    const attemptKey = `${keyPair.privateKey}::${contactKey.publicKey}`;
    if (derivedFor.current.get(contactId) === attemptKey) return;
    derivedFor.current.set(contactId, attemptKey);

    // Fire-and-forget: the sharedKeyStore Map is keyed by contactId, so
    // writing it is safe even if a newer effect run supersedes this one.
    // `derivedFor` guards against redoing the (expensive) ECDH work for
    // the same key pair. No cancellation: a re-run's cleanup previously
    // raced the write and dropped it, which is the bug that left every
    // shared key unset.
    void (async () => {
      try {
        const derivedKey = await KeyService.deriveSharedKey(
          keyPair.privateKey,
          contactKey.publicKey
        );
        setSharedKeyMap(contactId, derivedKey);
      } catch (error) {
        console.error('Error deriving shared key:', error);
      }
    })();
  }, [dispatch, selectedContact, keyPair, contactKeys[selectedContact?.contactId ?? -1]]);
  
  if (!selectedContact) {
    return (
      <div className="chat-window empty-state container-neobrutalism">
        <div className="empty-state-content card-neobrutalism">
          <i className="fas fa-comments empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
          <h3>Select a contact to start chatting</h3>
          <p className="badge-neobrutalism" style={{ marginTop: '1rem' }}>
            <i className="fas fa-lock mr-2"></i>
            Your messages will be end-to-end encrypted
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="contact-info">
          <div className="contact-avatar avatar-neobrutalism">
            {selectedContact.username.charAt(0).toUpperCase()}
            <span className={`status-indicator ${selectedContact.isOnline ? 'status-online' : 'status-offline'}`}></span>
          </div>
          <div>
            <div className="contact-name" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedContact.username}</div>
            <div className="contact-status" style={{ display: 'inline-block', marginTop: '0.25rem' }}>
              {selectedContact.isOnline ? 'Online' : `Last seen: ${selectedContact.lastSeen ? new Date(selectedContact.lastSeen).toLocaleString() : 'Unknown'}`}
            </div>
          </div>
          <ConnectionStatus />
        </div>
        <div className="chat-actions">
          <EncryptionStatus />
          <button 
            className="btn-neobrutalism" 
            title="Verify Keys"
            onClick={() => {
              // Ensure we have the contact's key before showing verification
              if (selectedContact && selectedContact.contactId) {
                if (!contactKeys[selectedContact.contactId]?.publicKey) {
                  console.log('Fetching contact key before showing verification');
                  dispatch(getUserKey(selectedContact.contactId));
                }
                setShowKeyVerification(true);
              }
            }}
          >
            <i className="fas fa-shield-alt"></i>
          </button>
        </div>
      </div>
      
      <div className="messages-container" style={{ background: 'var(--color-background)', padding: '1rem' }}>
        <MessageList 
          messages={messages} 
          currentUserId={currentUserId} 
          sharedKey={sharedKey || null} 
        />
      </div>
      
      <MessageInput 
        recipientId={selectedContact.contactId} 
        sharedKey={sharedKey || null} 
      />
      
      {showKeyVerification && selectedContact && (
        <KeyVerification 
          contactId={Number(selectedContact.contactId)} 
          onClose={() => setShowKeyVerification(false)} 
        />
      )}
    </div>
  );
};

export default ChatWindow;
