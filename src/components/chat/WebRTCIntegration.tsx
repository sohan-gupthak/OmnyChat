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
  
  // Initialize WebRTC when the selected contact changes. We deliberately
 // key this effect on contactId only — using the entire `contactKeys` object
 // here causes a connect/disconnect cycle on every key-state update.
  useEffect(() => {
    if (!user || !user.id) return;
    if (!selectedContact) {
      if (contacts && contacts.length > 0) {
        const validContact = contacts.find(
          (c) => c && typeof c.contactId === 'number' && !isNaN(c.contactId) && c.contactId > 0
        );
        if (validContact) dispatch(selectContact(validContact));
      }
      return;
    }
    if (!selectedContact.contactId) {
      if (selectedContact.id) {
        dispatch(
          selectContact({ ...selectedContact, contactId: selectedContact.id })
        );
      }
      return;
    }
    const contactId =
      typeof selectedContact.contactId === 'string'
        ? parseInt(selectedContact.contactId, 10)
        : selectedContact.contactId;
    if (isNaN(contactId) || contactId <= 0) return;

    // Read the current key without subscribing this effect to `contactKeys`.
    // The slice sentinel (empty publicKey) is treated as "not yet".
    const keyEntry = contactKeys[contactId];
    if (!keyEntry || !keyEntry.publicKey) {
      // First-encounter fetch; subsequent re-renders skip because the slice
      // now holds an entry (real or sentinel).
      const isFirstFetch = !keyEntry;
      if (isFirstFetch) dispatch(getUserKey(contactId));
      return;
    }

    let cancelled = false;
    const setupConnection = async () => {
      try {
        await webrtcService.initConnection(contactId);
        if (cancelled) return;
        webrtcService
          .sendMessage(contactId, 'presence', { isOnline: true })
          .catch((err) => console.error('presence send failed', err));
      } catch (error) {
        console.error('Failed to setup WebRTC connection', error);
        notificationSystem.addNotification(
          'warning',
          `Could not establish a direct connection with ${selectedContact.username}. Falling back to the server.`
        );
      }
    };
    void setupConnection();

    return () => {
      cancelled = true;
      webrtcService.closeConnection(contactId);
    };
  }, [dispatch, user, selectedContact, contacts]);
  
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
  }, [selectedContact, dispatch, user]);
  
  // This component doesn't render anything
  return null;
};

export default WebRTCIntegration;
