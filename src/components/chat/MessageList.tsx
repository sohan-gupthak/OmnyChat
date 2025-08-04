import React, { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../store';
import { decryptMessage } from '../../store/slices/messagesSlice';
import { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  sharedKey: CryptoKey | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, sharedKey }) => {
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Decrypt encrypted messages
  useEffect(() => {
    if (sharedKey && messages.length > 0) {
      messages.forEach(message => {
        if (message.isEncrypted) {
          dispatch(decryptMessage({ message, sharedKey }));
        }
      });
    }
  }, [dispatch, messages, sharedKey]);
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (messages.length === 0) {
    return (
      <div className="no-messages">
        <p>No messages yet</p>
        <p>Send a message to start the conversation</p>
      </div>
    );
  }
  
  return (
    <>
      {messages.map((message, index) => {
        const isSender = message.senderId === currentUserId;
        const showTimestamp = index === 0 || 
          new Date(message.timestamp).getTime() - 
          new Date(messages[index - 1].timestamp).getTime() > 5 * 60 * 1000;
        
        return (
          <React.Fragment key={message.id || `${message.senderId}-${message.timestamp}`}>
            {showTimestamp && (
              <div className="timestamp-divider">
                {new Date(message.timestamp).toLocaleDateString()}
              </div>
            )}
            <div className={`message ${isSender ? 'sent' : 'received'}`}>
              <div className="message-content">
                {message.isEncrypted ? (
                  <div className="encrypted-message">
                    <i className="fas fa-lock"></i> Encrypted message
                  </div>
                ) : (
                  message.content
                )}
                <span className="message-time">
                  {formatTime(message.timestamp)}
                  {isSender && (
                    <span className={`message-status ${message.status}`}>
                      {message.status === 'sent' && <i className="fas fa-check"></i>}
                      {message.status === 'delivered' && <i className="fas fa-check-double"></i>}
                      {message.status === 'read' && <i className="fas fa-check-double read"></i>}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </>
  );
};

export default MessageList;
