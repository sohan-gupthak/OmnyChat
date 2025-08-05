import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { sendContactRequest } from '../../store/slices/contactRequestsSlice';
import { UserService } from '../../services';
import { User } from '../../types';
import './SendContactRequest.css';
import '../../../src/styles/neobrutalism.css';

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
    <div className="card-neobrutalism" style={{ width: '100%' }}>
      <div className="header-neobrutalism">
        <h2 style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Send Contact Request</h2>
        <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>Search for users to connect with</p>
      </div>
      
      <div style={{ padding: '1.5rem' }}>
        {error && (
          <div className="badge-neobrutalism" style={{ backgroundColor: 'var(--color-error)', marginBottom: '1rem', padding: '0.75rem', width: '100%', textAlign: 'center' }}>
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="searchQuery" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Search by username or email:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="searchQuery"
                className="input-neobrutalism"
                value={selectedUser ? `${selectedUser.username} (${selectedUser.email})` : searchQuery}
                onChange={(e) => {
                  setSelectedUser(null);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Enter username or email"
                disabled={isLoading}
                required
                style={{ width: '100%' }}
              />
              
              {isSearching && (
                <div className="badge-neobrutalism" style={{ marginTop: '0.5rem', backgroundColor: 'var(--color-info)' }}>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Searching...
                </div>
              )}
              
              {searchResults.length > 0 && !selectedUser && (
                <div className="search-results" style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  zIndex: 10,
                  marginTop: '0.25rem',
                  backgroundColor: 'var(--color-background)',
                  border: '3px solid var(--color-border)',
                  borderRadius: 'var(--radius-base)',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}>
                  {searchResults.map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => handleSelectUser(user)}
                      style={{ 
                        padding: '0.75rem', 
                        borderBottom: '2px solid var(--color-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'var(--color-background)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-alt)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background)'}
                    >
                      <div className="avatar-neobrutalism" style={{ marginRight: '0.75rem' }}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              className="btn-neobrutalism" 
              onClick={onClose} 
              disabled={isLoading}
              style={{ color: 'var(--color-text)', flex: '1', backgroundColor: 'var(--color-background-alt)' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-neobrutalism" 
              disabled={isLoading || !selectedUser}
              style={{ flex: '1' }}
            >
              {isLoading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendContactRequest;
