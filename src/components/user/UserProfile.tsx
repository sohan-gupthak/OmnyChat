import React, { useState } from 'react';
import { User } from '../../types';
import { contactRequestService } from '../../services';
import './UserProfile.css';

interface UserProfileProps {
  user: User;
  isContact?: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isContact = false, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSendRequest = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await contactRequestService.sendRequest(user.id);
      if (response.success) {
        setSuccess('Contact request sent successfully!');
      } else {
        setError(response.error || 'Failed to send contact request');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send contact request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>User Profile</h2>
        <button className="close-button" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="profile-content">
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        
        <div className="profile-info">
          <div className="info-item">
            <label>Username:</label>
            <span>{user.username}</span>
          </div>
          
          <div className="info-item">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          
          <div className="info-item">
            <label>User ID:</label>
            <span>{user.id}</span>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="profile-actions">
          {!isContact && (
            <button 
              className="send-request-button"
              onClick={handleSendRequest}
              disabled={isLoading || !!success}
            >
              {isLoading ? 'Sending...' : success ? 'Request Sent' : 'Send Contact Request'}
            </button>
          )}
          <button className="cancel-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
