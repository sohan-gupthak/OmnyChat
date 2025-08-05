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
import './ContactRequestsNeobrutalism.css';

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
      return <p className="no-requests-neobrutalism">No pending contact requests</p>;
    }

    return (
      <ul className="request-list-neobrutalism">
        {pendingRequests.map((request) => (
          <li key={request.id} className="request-item-neobrutalism">
            <div className="request-info-neobrutalism">
              <div className="avatar-neobrutalism" style={{ marginBottom: '0.5rem' }}>
                {request.sender?.username.charAt(0).toUpperCase()}
              </div>
              <span className="username-neobrutalism">{request.sender?.username}</span>
              <span className="email-neobrutalism">{request.sender?.email}</span>
              <span className="date-neobrutalism">
                {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="request-actions-neobrutalism">
              <button
                className="btn-neobrutalism"
                style={{ backgroundColor: 'var(--color-success)' }}
                onClick={() => handleAccept(request.id)}
                disabled={isLoading}
              >
                <i className="fas fa-check mr-2"></i> Accept
              </button>
              <button
                className="btn-neobrutalism"
                style={{ backgroundColor: 'var(--color-error)' }}
                onClick={() => handleReject(request.id)}
                disabled={isLoading}
              >
                <i className="fas fa-times mr-2"></i> Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderSentRequests = () => {
    if (sentRequests.length === 0) {
      return <p className="no-requests-neobrutalism">No sent contact requests</p>;
    }

    return (
      <ul className="request-list-neobrutalism">
        {sentRequests.map((request) => (
          <li key={request.id} className="request-item-neobrutalism">
            <div className="request-info-neobrutalism">
              <div className="avatar-neobrutalism" style={{ marginBottom: '0.5rem' }}>
                {request.recipient?.username.charAt(0).toUpperCase()}
              </div>
              <span className="username-neobrutalism">{request.recipient?.username}</span>
              <span className="email-neobrutalism">{request.recipient?.email}</span>
              <span className="date-neobrutalism">
                {new Date(request.created_at).toLocaleDateString()}
              </span>
              <span className={`status-neobrutalism ${request.status}`}>{request.status}</span>
            </div>
            {request.status === 'pending' && (
              <div className="request-actions-neobrutalism">
                <button
                  className="btn-neobrutalism"
                  style={{ backgroundColor: 'var(--color-warning)' }}
                  onClick={() => handleCancel(request.id)}
                  disabled={isLoading}
                >
                  <i className="fas fa-ban mr-2"></i> Cancel
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="contact-requests-container-neobrutalism">
      <h2>Contact Requests</h2>
      
      <div className="tabs-neobrutalism">
        <button
          className={`tab-neobrutalism ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="badge-neobrutalism">{pendingRequests.length}</span>
          )}
        </button>
        <button
          className={`tab-neobrutalism ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent Requests
          {sentRequests.length > 0 && (
            <span className="badge-neobrutalism">{sentRequests.length}</span>
          )}
        </button>
      </div>

      {error && (
        <div className="error-message-neobrutalism">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="requests-content-neobrutalism">
        {isLoading ? (
          <div className="loading-neobrutalism">
            <i className="fas fa-spinner fa-spin mr-2"></i> Loading...
          </div>
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
