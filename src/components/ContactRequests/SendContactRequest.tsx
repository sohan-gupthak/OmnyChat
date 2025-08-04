import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { sendContactRequest } from '../../store/slices/contactRequestsSlice';
import { UserService } from '../../services';
import { User } from '../../types';
import './SendContactRequest.css';

interface SendContactRequestProps {
  onClose: () => void;
}

const SendContactRequest: React.FC<SendContactRequestProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const { isLoading } = useAppSelector((state) => state.contactRequests);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  // Debounce search to prevent excessive API calls
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const response = await UserService.searchUsers(searchQuery);
        if (response.success && response.data) {
          // Filter out current user from results
          const filteredResults = response.data.users.filter(
            user => currentUser && user.id !== currentUser.id
          );
          setSearchResults(filteredResults);
        } else {
          setError('Error searching users');
          setSearchResults([]);
        }
      } catch (err) {
        setError('Failed to search users');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedUser) {
      setError('Please select a user from the search results');
      return;
    }

    try {
      await dispatch(sendContactRequest(selectedUser.id)).unwrap();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send contact request');
    }
  };
  
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchResults([]);
  };

  return (
    <div className="send-request-container">
      <h2>Send Contact Request</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="searchQuery">Search by username or email:</label>
          <input
            type="text"
            id="searchQuery"
            value={selectedUser ? `${selectedUser.username} (${selectedUser.email})` : searchQuery}
            onChange={(e) => {
              setSelectedUser(null);
              setSearchQuery(e.target.value);
            }}
            placeholder="Enter username or email"
            disabled={isLoading}
            required
          />
          {isSearching && <div className="searching-indicator">Searching...</div>}
          
          {searchResults.length > 0 && !selectedUser && (
            <div className="search-results">
              {searchResults.map(user => (
                <div 
                  key={user.id} 
                  className="search-result-item"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                  <div className="user-info">
                    <div className="username">{user.username}</div>
                    <div className="email">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isLoading || !selectedUser}
          >
            {isLoading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendContactRequest;
