import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { selectContact } from '../../store/slices/contactsSlice';
import { addContact } from '../../store/slices/contactsSlice';
import { fetchPendingRequests } from '../../store/slices/contactRequestsSlice';
import { UserService } from '../../services';
import { User, UserSearchResponse } from '../../types';
import { SendContactRequest } from '../ContactRequests';
import './Chat.css';

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { user } = useAppSelector(state => state.auth);
  const { contacts, selectedContact } = useAppSelector(state => state.contacts);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showSendRequest, setShowSendRequest] = useState(false);
  
  const { pendingRequests } = useAppSelector(state => state.contactRequests);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await UserService.searchUsers(searchQuery);
      if (response.success && response.data && response.data.users) {
        // Filter out current user and existing contacts
        const filteredResults = response.data.users.filter((u: User) => 
          u.id !== user?.id && 
          !contacts.some(c => c.contactId === u.id)
        );
        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddContact = async (userId: number) => {
    try {
      await dispatch(addContact(userId));
      setSearchResults([]);
      setSearchQuery('');
      setShowAddContact(false);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };
  
  useEffect(() => {
    // Fetch pending contact requests when component mounts
    dispatch(fetchPendingRequests());
    
    // Set up interval to periodically check for new requests (every 30 seconds)
    const intervalId = setInterval(() => {
      dispatch(fetchPendingRequests());
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [dispatch]);
  
  const handleSelectContact = (contactId: number) => {
    const contact = contacts.find(c => c.contactId === contactId);
    if (contact) {
      dispatch(selectContact(contact));
    }
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>OmnyChat</h2>
        <div className="user-info">
          <span className="username">{user?.username}</span>
          <div className="user-actions">
            <button 
              className="icon-button"
              onClick={() => {
                setShowAddContact(false);
                setShowSendRequest(!showSendRequest);
              }}
              title="Send Contact Request"
            >
              <i className="fas fa-user-plus"></i>
            </button>
            <button 
              className="icon-button"
              onClick={() => {
                setShowSendRequest(false);
                setShowAddContact(!showAddContact);
              }}
              title="Search Users"
            >
              <i className="fas fa-search"></i>
            </button>
            <button 
              className="icon-button"
              onClick={handleLogout}
              title="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Contact Requests Badge */}
      {pendingRequests.length > 0 && (
        <div className="contact-requests-badge" onClick={() => navigate('/contact-requests')}>
          <i className="fas fa-bell"></i>
          <span>{pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}</span>
          <i className="fas fa-chevron-right"></i>
        </div>
      )}
      
      {/* Send Contact Request Form */}
      {showSendRequest && (
        <SendContactRequest onClose={() => setShowSendRequest(false)} />
      )}
      
      {/* Search Users Form */}
      {showAddContact && (
        <div className="add-contact">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className="search-button"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(user => (
                <div key={user.id} className="search-result-item">
                  <div className="user-info">
                    <span className="username">{user.username}</span>
                    <span className="email">{user.email}</span>
                  </div>
                  <button 
                    className="add-button"
                    onClick={() => handleAddContact(user.id)}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="contacts-list">
        <div className="contacts-header">
          <h3>Contacts</h3>
          <button 
            className="view-requests-button"
            onClick={() => navigate('/contact-requests')}
            title="View Contact Requests"
          >
            <i className="fas fa-user-clock"></i>
            {pendingRequests.length > 0 && <span className="badge">{pendingRequests.length}</span>}
          </button>
        </div>
        {contacts.length === 0 ? (
          <div className="no-contacts">
            <p>No contacts yet</p>
            <button 
              className="add-contact-button"
              onClick={() => setShowAddContact(true)}
            >
              Add your first contact
            </button>
          </div>
        ) : (
          contacts.map(contact => (
            <div 
              key={contact.contactId}
              className={`contact-item ${selectedContact?.contactId === contact.contactId ? 'selected' : ''}`}
              onClick={() => handleSelectContact(contact.contactId)}
            >
              <div className="contact-avatar">
                {contact.username.charAt(0).toUpperCase()}
                <span className={`status-indicator ${contact.isOnline ? 'online' : 'offline'}`}></span>
              </div>
              <div className="contact-info">
                <div className="contact-name">{contact.username}</div>
                <div className="contact-status">
                  {contact.isOnline ? 'Online' : `Last seen: ${contact.lastSeen ? new Date(contact.lastSeen).toLocaleString() : 'Unknown'}`}
                </div>
              </div>
              {contact.unreadCount > 0 && (
                <div className="unread-badge">
                  {contact.unreadCount}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
