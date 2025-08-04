import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchPendingRequests,
  fetchSentRequests,
  acceptContactRequest,
  rejectContactRequest,
  cancelContactRequest
} from '../../store/slices/contactRequestsSlice';
import { ContactRequest } from '../../types';
import './ContactRequests.css';

const ContactRequests: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pendingRequests, sentRequests, isLoading, error } = useAppSelector(
    (state) => state.contactRequests
  );
  const [activeTab, setActiveTab] = useState<'pending' | 'sent'>('pending');

  useEffect(() => {
    dispatch(fetchPendingRequests());
    dispatch(fetchSentRequests());
  }, [dispatch]);

  const handleAccept = (requestId: number) => {
    dispatch(acceptContactRequest(requestId));
  };

  const handleReject = (requestId: number) => {
    dispatch(rejectContactRequest(requestId));
  };

  const handleCancel = (requestId: number) => {
    dispatch(cancelContactRequest(requestId));
  };

  const renderPendingRequests = () => {
    if (pendingRequests.length === 0) {
      return <p className="no-requests">No pending contact requests</p>;
    }

    return (
      <ul className="request-list">
        {pendingRequests.map((request) => (
          <li key={request.id} className="request-item">
            <div className="request-info">
              <span className="username">{request.sender?.username}</span>
              <span className="email">{request.sender?.email}</span>
              <span className="date">
                {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="request-actions">
              <button
                className="accept-btn"
                onClick={() => handleAccept(request.id)}
                disabled={isLoading}
              >
                Accept
              </button>
              <button
                className="reject-btn"
                onClick={() => handleReject(request.id)}
                disabled={isLoading}
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderSentRequests = () => {
    if (sentRequests.length === 0) {
      return <p className="no-requests">No sent contact requests</p>;
    }

    return (
      <ul className="request-list">
        {sentRequests.map((request) => (
          <li key={request.id} className="request-item">
            <div className="request-info">
              <span className="username">{request.recipient?.username}</span>
              <span className="email">{request.recipient?.email}</span>
              <span className="date">
                {new Date(request.created_at).toLocaleDateString()}
              </span>
              <span className="status">{request.status}</span>
            </div>
            {request.status === 'pending' && (
              <div className="request-actions">
                <button
                  className="cancel-btn"
                  onClick={() => handleCancel(request.id)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="contact-requests-container">
      <h2>Contact Requests</h2>
      
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="badge">{pendingRequests.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent Requests
          {sentRequests.length > 0 && (
            <span className="badge">{sentRequests.length}</span>
          )}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="requests-content">
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'pending' && renderPendingRequests()}
            {activeTab === 'sent' && renderSentRequests()}
          </>
        )}
      </div>
    </div>
  );
};

export default ContactRequests;
