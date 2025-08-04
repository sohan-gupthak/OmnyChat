import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { getProfile } from '../../store/slices/authSlice';
import { fetchContacts, selectContact } from '../../store/slices/contactsSlice';
import { fetchOfflineMessages } from '../../store/slices/messagesSlice';
import { generateKeyPair, getServerKey } from '../../store/slices/keysSlice';
import { websocketService } from '../../services';
import WebRTCIntegration from './WebRTCIntegration';
import './Chat.css';

// Import components from the index file to fix module resolution
import { Sidebar, ChatWindow } from './';

const ChatLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { user, token, isAuthenticated } = useAppSelector(state => state.auth);
  const { keyPair } = useAppSelector(state => state.keys);
  const { contacts, selectedContact } = useAppSelector(state => state.contacts);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    if (token) {
      // Connect to WebSocket server
      websocketService.connect(token);
      
      // Fetch user profile
      dispatch(getProfile());
      
      // Fetch contacts
      dispatch(fetchContacts());
      
      // Fetch offline messages
      dispatch(fetchOfflineMessages());
      
      // Generate key pair if not exists
      if (!keyPair) {
        dispatch(generateKeyPair('ecdh'));
      }
      
      // Get server public key
      dispatch(getServerKey());
    }
    
    // Cleanup on unmount
    return () => {
      if (websocketService.isConnected()) {
        websocketService.disconnect();
      }
    };
  }, [dispatch, token, keyPair]);
  
  // Select the first contact by default if no contact is selected
  useEffect(() => {
    if (!contacts || contacts.length === 0) {
      console.log('No contacts available yet, waiting for contacts to load');
      return;
    }
    
    console.log('Available contacts:', contacts.map(c => ({ id: c.id, contactId: c.contactId, username: c.username })));
    
    if (!selectedContact) {
      console.log('No contact selected, selecting the first valid contact by default');
      
      // Ensure the contact has a valid contactId before selecting
      const validContact = contacts.find(contact => 
        contact && 
        typeof contact.contactId === 'number' && 
        !isNaN(contact.contactId) && 
        contact.contactId > 0
      );
      
      if (validContact) {
        console.log(`Selecting contact with ID: ${validContact.contactId}`);
        dispatch(selectContact(validContact));
      } else {
        console.warn('No valid contacts found with proper contactId');
      }
    } else {
      const contactId = selectedContact.contactId;
      if (!contactId || isNaN(Number(contactId)) || Number(contactId) <= 0) {
        console.warn(`Selected contact has invalid contactId: ${contactId}, attempting to fix`);
        
        // First try to use the contact's id as the contactId
        if (selectedContact.id && !isNaN(Number(selectedContact.id)) && Number(selectedContact.id) > 0) {
          console.log(`Using contact.id (${selectedContact.id}) as contactId`);
          const updatedContact = {
            ...selectedContact,
            contactId: selectedContact.id
          };
          dispatch(selectContact(updatedContact));
          return;
        }
        
        // If that doesn't work, try to find a valid contact to select instead
        const validContact = contacts.find(contact => 
          contact && (
            // Either has a valid contactId
            (typeof contact.contactId === 'number' && !isNaN(contact.contactId) && contact.contactId > 0) ||
            // Or has a valid id that can be used as contactId
            (typeof contact.id === 'number' && !isNaN(contact.id) && contact.id > 0)
          )
        );
        
        if (validContact) {
          if (typeof validContact.contactId === 'number' && !isNaN(validContact.contactId) && validContact.contactId > 0) {
            console.log(`Selecting valid contact with ID: ${validContact.contactId}`);
            dispatch(selectContact(validContact));
          } 
          else if (validContact.id) {
            console.log(`Using contact.id (${validContact.id}) as contactId for selected contact`);
            const updatedContact = {
              ...validContact,
              contactId: validContact.id
            };
            dispatch(selectContact(updatedContact));
          }
        }
      }
    }
  }, [dispatch, contacts, selectedContact]);
  
  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }
  
  return (
    <div className="chat-layout">
      <WebRTCIntegration />
      <Sidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatLayout;
