import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { getUserKey } from '../../store/slices/keysSlice';
import { KeyService } from '../../services';
import { updateUnreadCount } from '../../store/slices/contactsSlice';
import { setSharedKey } from '../../store/slices/messagesSlice';
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
  const sharedKey = conversation?.sharedKey;
  
  // Fetch contact's public key if not available and reset unread count
  useEffect(() => {
    if (selectedContact && selectedContact.contactId) {
      // Fetch key if not available
      if (!contactKeys[selectedContact.contactId]) {
        dispatch(getUserKey(selectedContact.contactId));
      }
      
      // Reset unread count when contact is selected
      dispatch(updateUnreadCount({
        contactId: selectedContact.contactId,
        increment: false
      }));
    }
  }, [dispatch, selectedContact, contactKeys]);
  
  // Derive shared key when both keys are available
  useEffect(() => {
    const deriveSharedKey = async () => {
      if (
        selectedContact && 
        selectedContact.contactId && 
        keyPair?.privateKey
      ) {
        try {
          // Log the state to help debug
          console.log('Attempting to derive shared key:', { 
            selectedContactId: selectedContact.contactId,
            hasPrivateKey: !!keyPair?.privateKey,
            hasContactKey: !!contactKeys[selectedContact.contactId]?.publicKey,
            hasSharedKey: !!sharedKey
          });
          
          // Ensure we have the contact's key
          if (!contactKeys[selectedContact.contactId]?.publicKey) {
            console.log('Contact key not found, fetching...');
            await dispatch(getUserKey(selectedContact.contactId)).unwrap();
            return; // The next useEffect cycle will handle key derivation
          }
          
          // Skip if we already have a shared key
          if (sharedKey) {
            console.log('Shared key already exists');
            return;
          }
          
          console.log('Deriving shared key...');
          const derivedKey = await KeyService.deriveSharedKey(
            keyPair.privateKey,
            contactKeys[selectedContact.contactId].publicKey
          );
          
          console.log('Shared key derived successfully');
          
          // Store the shared key in the conversation
          dispatch(setSharedKey({
            contactId: selectedContact.contactId,
            sharedKey: derivedKey
          }));
        } catch (error) {
          console.error('Error deriving shared key:', error);
        }
      }
    };
    
    deriveSharedKey();
  }, [dispatch, selectedContact, keyPair, contactKeys, sharedKey]);
  
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
