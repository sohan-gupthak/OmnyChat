import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { addMessage, updateMessageStatus, markMessagesAsRead } from '../../store/slices/messagesSlice';
import { updateContactPresence, updateUnreadCount, selectContact } from '../../store/slices/contactsSlice';
import { getUserKey } from '../../store/slices/keysSlice';
import webrtcService from '../../services/webrtc.service';
import { notificationSystem } from '../common';

/**
 * WebRTCIntegration component
 * 
 * This component doesn't render anything visible but handles WebRTC events
 * and integrates them with the Redux store.
 */
const WebRTCIntegration: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { selectedContact, contacts } = useAppSelector(state => state.contacts);
  const { contactKeys } = useAppSelector(state => state.keys);
  
  useEffect(() => {
    if (!user || !user.id) return;
    
    // Handle incoming messages
    const handleMessage = (data: any, senderId: number) => {
      if (!senderId || !data) return;
      
      const { content, timestamp, isEncrypted, id } = data;
      
      // Add message to store
      dispatch(addMessage({
        senderId,
        recipientId: user.id,
        content,
        timestamp,
        status: 'delivered',
        isEncrypted,
        id
      }));
      
      // Update unread count if not from selected contact
      if (!selectedContact || selectedContact.contactId !== senderId) {
        dispatch(updateUnreadCount({
          contactId: senderId,
          increment: true
        }));
        
        // Show notification
        const contact = contacts.find(c => c.contactId === senderId);
        const senderName = contact?.username || `User ${senderId}`;
        notificationSystem.addNotification('info', `New message from ${senderName}`);
      }
      
      // Send delivery receipt
      if (id) {
        webrtcService.sendMessage(senderId, 'message-receipt', {
          messageId: id,
          status: 'delivered'
        }).catch(error => {
          console.error('Failed to send delivery receipt:', error);
        });
      }
    };
    
    // Handle message receipts
    const handleReceipt = (data: any) => {
      const { messageId, status } = data;
      dispatch(updateMessageStatus({
        messageId,
        status
      }));
    };
    
    // Handle presence updates
    const handlePresence = (data: any, peerId: number) => {
      const { isOnline } = data;
      dispatch(updateContactPresence({
        userId: peerId,
        isOnline
      }));
    };
    
    // Register event handlers
    webrtcService.on('message', handleMessage);
    webrtcService.on('message-receipt', handleReceipt);
    webrtcService.on('presence', handlePresence);
    
    // Cleanup on unmount
    return () => {
      webrtcService.off('message', handleMessage);
      webrtcService.off('message-receipt', handleReceipt);
      webrtcService.off('presence', handlePresence);
    };
  }, [dispatch, user, selectedContact]);
  
  // Initialize WebRTC when selected contact changes
  useEffect(() => {
    // Ensure we have a valid user
    if (!user || !user.id) {
      console.log('No authenticated user, skipping WebRTC initialization');
      return;
    }

    // Handle case when no contact is selected
    if (!selectedContact) {
      console.log('No selected contact, skipping WebRTC initialization');
      // If we have contacts but no selected contact, try to select the first valid one
      if (contacts && contacts.length > 0) {
        const validContact = contacts.find(contact => 
          contact && typeof contact.contactId === 'number' && !isNaN(contact.contactId) && contact.contactId > 0
        );
        
        if (validContact) {
          console.log(`Selecting contact with ID: ${validContact.contactId} for WebRTC initialization`);
          dispatch(selectContact(validContact));
        } else {
          console.warn('No valid contacts found with proper contactId');
        }
      }
      return;
    }
    
    // Handle case when selectedContact exists but has no valid contactId
    if (!selectedContact.contactId) {
      console.log('Selected contact has no contactId, attempting to use contact.id instead');
      
      // If contactId is undefined but id is available, use id as contactId
      if (selectedContact.id) {
        console.log(`Using contact.id (${selectedContact.id}) as contactId for WebRTC initialization`);
        // Create a new contact object with contactId set to id
        const updatedContact = {
          ...selectedContact,
          contactId: selectedContact.id
        };
        
        // Update the selected contact in the store
        dispatch(selectContact(updatedContact));
        return; // Return and let the useEffect trigger again with the updated contact
      } else {
        console.error('Selected contact has neither contactId nor id, skipping WebRTC initialization');
        return;
      }
    }
    
    // Validate contactId - ensure it's a valid number
    const contactId = typeof selectedContact.contactId === 'string' 
      ? parseInt(selectedContact.contactId, 10) 
      : selectedContact.contactId;
      
    if (isNaN(contactId) || contactId <= 0) {
      console.error('Invalid contact ID for WebRTC initialization:', contactId);
      return;
    }
    
    console.log(`Setting up WebRTC for contact ID: ${contactId}`);
    
    // Fetch the contact's key if we don't have it yet
    if (!contactKeys[contactId]?.publicKey) {
      console.log(`Fetching key for contact ID: ${contactId}`);
      dispatch(getUserKey(contactId));
      // Return early and let the next useEffect trigger when the key is available
      return;
    }
    
    // Ensure we have the contact's public key before proceeding
    const contactKey = contactKeys[contactId]?.publicKey;
    if (!contactKey) {
      console.log(`Waiting for contact key for ID: ${contactId}`);
      return;
    }
    
    // Initialize WebRTC connection
    const setupConnection = async () => {
      try {
        console.log('Initializing WebRTC connection...');
        await webrtcService.initConnection(contactId);
        console.log('WebRTC connection initialized successfully');
        
        // Send presence update
        webrtcService.sendMessage(contactId, 'presence', {
          isOnline: true
        }).catch(error => {
          console.error('Failed to send presence update:', error);
        });
      } catch (error) {
        console.error('Failed to setup WebRTC connection:', error);
        notificationSystem.addNotification('warning', 
          `Could not establish direct connection with ${selectedContact.username}. Messages will be sent through the server.`
        );
      }
    };
    
    setupConnection();
    
    // Clean up connection when component unmounts or selected contact changes
    return () => {
      console.log(`Closing WebRTC connection for contact ID: ${contactId}`);
      webrtcService.closeConnection(contactId);
    };
  }, [selectedContact, contactKeys, dispatch]);
  
  // Mark messages as read when a contact is selected
  useEffect(() => {
    if (!selectedContact || !selectedContact.contactId || !user || !user.id) return;
    
    // Mark all messages from this contact as read
    dispatch(markMessagesAsRead(selectedContact.contactId));
    
    // Send read receipts for all messages from this contact
    const sendReadReceipts = async () => {
      try {
        // Get conversation with this contact
        const state = (await import('../../store')).store.getState();
        const conversation = state.messages.conversations[selectedContact.contactId];
        
        if (conversation) {
          // Find all delivered messages from this contact
          const unreadMessages = conversation.messages.filter(message => 
            message.senderId === selectedContact.contactId && 
            message.recipientId === user.id && 
            message.status === 'delivered'
          );
          
          // Send read receipts for each message
          for (const message of unreadMessages) {
            if (message.id) {
              try {
                // Check if we have an active connection before sending
                if (webrtcService.hasActiveConnection(selectedContact.contactId)) {
                  await webrtcService.sendMessage(selectedContact.contactId, 'message-receipt', {
                    messageId: message.id,
                    status: 'read'
                  });
                }
              } catch (error) {
                console.error('Failed to send read receipt:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to send read receipts:', error);
      }
    };
    
    sendReadReceipts();
  }, [selectedContact, dispatch, user, contactKeys]);
  
  // This component doesn't render anything
  return null;
};

export default WebRTCIntegration;
