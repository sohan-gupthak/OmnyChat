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
      <div className="no-messages card-neobrutalism" style={{ padding: '2rem', textAlign: 'center' }}>
        <i className="fas fa-comment-slash" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
        <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>No messages yet</p>
        <p style={{ display: 'inline-block', marginTop: '1rem' }}>
          Send a message to start the conversation
        </p>
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
        
        // No rotation for message bubbles to keep them horizontally straight
        
        return (
          <React.Fragment key={message.id || `${message.senderId}-${message.timestamp}`}>
            {showTimestamp && (
              <div className="timestamp-divider badge-neobrutalism" 
                   style={{ 
                     margin: '1rem auto', 
                     textAlign: 'center', 
                     width: 'fit-content'
                   }}>
                {new Date(message.timestamp).toLocaleDateString()}
              </div>
            )}
            <div className={isSender ? 'message-neobrutalism-sent' : 'message-neobrutalism-received'}>
              <div className="message-content">
                {message.isEncrypted ? (
                  <div className="encrypted-message">
                    <i className="fas fa-lock mr-2"></i> Encrypted message
                  </div>
                ) : (
                  message.content
                )}
                <span className="message-time" style={{ 
                  marginTop: '0.5rem', 
                  fontSize: '0.75rem', 
                  display: 'block',
                  textAlign: isSender ? 'right' : 'left'
                }}>
                  {formatTime(message.timestamp)}
                  {isSender && (
                    <span className={`message-status ${message.status} ml-1`}>
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
