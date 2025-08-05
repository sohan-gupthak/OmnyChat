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
import Modal from '../ui/Modal';
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
    <div className="sidebar" style={{ overflow: 'hidden' }}>
      <div className="sidebar-header" style={{ marginBottom: '1rem' }}>
        <h2 style={{ color: 'var(--color-text)', fontWeight: 'bold', fontSize: '1.8rem' }}>OmnyChat</h2>
        <div className="user-info card-neobrutalism" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
          <span className="username" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{user?.username}</span>
          <div className="user-actions">
            <button 
              className="btn-neobrutalism"
              onClick={() => {
                setShowAddContact(false);
                setShowSendRequest(!showSendRequest);
              }}
              title="Send Contact Request"
            >
              <i className="fas fa-user-plus font-size-lg"></i>
            </button>
            {/* <button 
              className="btn-neobrutalism"
              onClick={() => {
                setShowSendRequest(false);
                setShowAddContact(!showAddContact);
              }}
              title="Search Users"
            >
              <i className="fas fa-search font-size-lg"></i>
            </button> */}
            <button 
              className="btn-neobrutalism"
              onClick={handleLogout}
              title="Logout"
            >
              <i className="fas fa-sign-out-alt font-size-lg"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Contact Requests Badge */}
      {pendingRequests.length > 0 && (
        <div 
          className="badge-neobrutalism" 
          onClick={() => navigate('/contact-requests')}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '0.75rem',
            margin: '0.5rem 1rem',
            cursor: 'pointer',
            backgroundColor: 'var(--color-warning)'
          }}
        >
          <i className="fas fa-bell mr-2"></i>
          <span>{pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}</span>
          <i className="fas fa-chevron-right ml-2"></i>
        </div>
      )}
      
      {/* Send Contact Request Form */}
      <Modal isOpen={showSendRequest} onClose={() => setShowSendRequest(false)}>
        <SendContactRequest onClose={() => setShowSendRequest(false)} />
      </Modal>
      
      {/* Search Users Form */}
      {showAddContact && (
        <div className="add-contact card-neobrutalism" style={{ margin: '0.5rem 1rem', padding: '1rem' }}>
          <div className="search-container" style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input-neobrutalism"
              style={{ flex: 1 }}
            />
            <button 
              className="btn-neobrutalism"
              onClick={handleSearch}
              disabled={isSearching}
              style={{ transform: 'rotate(1deg)' }}
            >
              {isSearching ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search font-size-lg"></i>}
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="search-results" style={{ marginTop: '1rem' }}>
              {searchResults.map(user => (
                <div 
                  key={user.id} 
                  className="card-neobrutalism" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div className="user-info">
                    <span className="username" style={{ fontWeight: 'bold', display: 'block' }}>{user.username}</span>
                    <span className="email" style={{ fontSize: '0.8rem' }}>{user.email}</span>
                  </div>
                  <button 
                    className="btn-neobrutalism"
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
            className="btn-neobrutalism"
            onClick={() => navigate('/contact-requests')}
            title="View Contact Requests"
            style={{ position: 'relative' }}
          >
            <i className="fas fa-user-clock font-size-lg"></i>
            {pendingRequests.length > 0 && (
              <span className="badge-neobrutalism" style={{ 
                position: 'absolute', 
                top: '-8px', 
                right: '-8px', 
                minWidth: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                padding: '0 4px',
                backgroundColor: 'var(--color-primary)',
                transform: 'rotate(8deg)'
              }}>
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
        {contacts.length === 0 ? (
          <div className="no-contacts card-neobrutalism" style={{ padding: '2rem', textAlign: 'center' }}>
            <i className="fas fa-user-slash" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
            <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>No contacts yet</p>
            <button 
              className="btn-neobrutalism"
              onClick={() => setShowAddContact(true)}
              style={{ transform: 'rotate(1deg)' }}
            >
              Add your first contact
            </button>
          </div>
        ) : (
          contacts.map((contact, index) => {
            // No rotation for contact cards to keep them horizontally straight
            
            return (
              <div 
                key={contact.contactId}
                className={`card-neobrutalism ${selectedContact?.contactId === contact.contactId ? 'border-primary' : ''}`}
                onClick={() => handleSelectContact(contact.contactId)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  cursor: 'pointer',

                  borderColor: selectedContact?.contactId === contact.contactId ? 'var(--color-primary)' : undefined,
                  borderWidth: selectedContact?.contactId === contact.contactId ? '4px' : undefined,
                  backgroundColor: selectedContact?.contactId === contact.contactId ? 'var(--color-background-alt)' : undefined
                }}
              >
                <div className="avatar-neobrutalism" style={{ marginRight: '0.75rem' }}>
                  {contact.username.charAt(0).toUpperCase()}
                  <span className={`status-indicator ${contact.isOnline ? 'status-online' : 'status-offline'}`}></span>
                </div>
                <div className="contact-info" style={{ flex: 1 }}>
                  <div className="contact-name" style={{ fontWeight: 'bold' }}>{contact.username}</div>
                  <div className="contact-status" style={{ fontSize: '0.8rem' }}>
                    {contact.isOnline ? 'Online' : `Last seen: ${contact.lastSeen ? new Date(contact.lastSeen).toLocaleString() : 'Unknown'}`}
                  </div>
                </div>
                {contact.unreadCount > 0 && (
                  <div className="badge-neobrutalism" style={{ 
                    minWidth: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    backgroundColor: 'var(--color-primary)',

                  }}>
                    {contact.unreadCount}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
