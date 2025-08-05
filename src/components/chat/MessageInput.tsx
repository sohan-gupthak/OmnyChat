import React, { useState } from 'react';
import { useAppDispatch } from '../../store';
import { sendMessage } from '../../store/slices/messagesSlice';

interface MessageInputProps {
  recipientId: number;
  sharedKey: CryptoKey | null;
}

const MessageInput: React.FC<MessageInputProps> = ({ recipientId, sharedKey }) => {
  const dispatch = useAppDispatch();
  const [messageInput, setMessageInput] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !recipientId) return;
    
    try {
      setIsEncrypting(true);
      
      // Log the state to help debug
      console.log('Sending message:', {
        recipientId,
        hasSharedKey: !!sharedKey,
        messageLength: messageInput.length
      });
      
      await dispatch(sendMessage({
        recipientId,
        content: messageInput,
        sharedKey: sharedKey || undefined
      }));
      
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsEncrypting(false);
    }
  };
  
  return (
    <div className="message-input-container">
      <div className="message-input-wrapper flex items-center">
        <input
          type="text"
          className="input-neobrutalism"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isEncrypting}
        />
        <button 
          className="btn-neobrutalism send-button"
          onClick={handleSendMessage}
          disabled={isEncrypting || !messageInput.trim()}
          style={{ transform: isEncrypting ? 'none' : '' }}
        >
          {isEncrypting ? 
            <i className="fas fa-spinner fa-spin"></i> : 
            <i className="fas fa-paper-plane"></i>
          }
        </button>
      </div>
      
      {/* {!sharedKey && (
        <div className="encryption-notice badge-neobrutalism">
          <i className="fas fa-lock mr-1"></i>
          <span>Establishing secure connection...</span>
        </div>
      )} */}
    </div>
  );
};

export default MessageInput;
