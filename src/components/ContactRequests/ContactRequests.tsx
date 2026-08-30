import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchPendingRequests,
  fetchSentRequests,
  acceptContactRequest,
  rejectContactRequest,
  cancelContactRequest,
} from '../../store/slices/contactRequestsSlice';
import { ContactRequest } from '../../types';
import { Avatar, Spinner } from '../ui/Icon';
import '../chat/chat.css';

const ContactRequests: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pendingRequests, sentRequests, isLoading, error } = useAppSelector(
    (s) => s.contactRequests,
  );
  const [activeTab, setActiveTab] = useState<'pending' | 'sent'>('pending');

  useEffect(() => {
    dispatch(fetchPendingRequests());
    dispatch(fetchSentRequests());
  }, [dispatch]);

  return (
    <div>
      <nav className="req-tabs" role="tablist">
        <button
          type="button"
          className={`req-tab ${activeTab === 'pending' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('pending')}
          role="tab"
          aria-selected={activeTab === 'pending'}
        >
          Inbox
          {pendingRequests.length > 0 && (
            <span className="om-pill om-pill--num">{pendingRequests.length}</span>
          )}
        </button>
        <button
          type="button"
          className={`req-tab ${activeTab === 'sent' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('sent')}
          role="tab"
          aria-selected={activeTab === 'sent'}
        >
          Sent
          {sentRequests.length > 0 && (
            <span className="om-pill om-pill--num">{sentRequests.length}</span>
          )}
        </button>
      </nav>

      {error && (
        <div
          style={{
            marginTop: 'var(--sp-4)',
            padding: 'var(--sp-3)',
            background: 'var(--color-danger-soft)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--fs-sm)',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: 'var(--sp-5)' }}>
        {isLoading ? (
          <div className="empty-state">
            <Spinner size={16} />
            <span>Loading…</span>
          </div>
        ) : activeTab === 'pending' ? (
          <PendingList
            requests={pendingRequests}
            onAccept={(id) => dispatch(acceptContactRequest(id))}
            onReject={(id) => dispatch(rejectContactRequest(id))}
          />
        ) : (
          <SentList
            requests={sentRequests}
            onCancel={(id) => dispatch(cancelContactRequest(id))}
          />
        )}
      </div>
    </div>
  );
};

function PendingList({
  requests,
  onAccept,
  onReject,
}: {
  requests: ContactRequest[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) {
  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <h3 className="empty-state__title">Inbox is empty</h3>
        <p className="empty-state__desc">
          When someone sends you a contact request, it&apos;ll show up here.
        </p>
      </div>
    );
  }
  return (
    <ul className="req-list" role="list">
      {requests.map((r) => (
        <li key={r.id} className="req-row">
          <Avatar name={r.sender?.username ?? '?'} />
          <div className="req-row__meta">
            <span className="req-row__name">{r.sender?.username}</span>
            <span className="req-row__sub">{r.sender?.email}</span>
            <span className="req-row__sub">
              {new Date(r.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="req-row__actions">
            <button
              type="button"
              className="om-btn om-btn--quiet om-btn--sm"
              onClick={() => onReject(r.id)}
            >
              Decline
            </button>
            <button
              type="button"
              className="om-btn om-btn--primary om-btn--sm"
              onClick={() => onAccept(r.id)}
            >
              Accept
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SentList({
  requests,
  onCancel,
}: {
  requests: ContactRequest[];
  onCancel: (id: number) => void;
}) {
  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <h3 className="empty-state__title">No sent requests</h3>
        <p className="empty-state__desc">
          Use “Add contact” in the chat sidebar to send your first request.
        </p>
      </div>
    );
  }
  return (
    <ul className="req-list" role="list">
      {requests.map((r) => (
        <li key={r.id} className="req-row">
          <Avatar name={r.recipient?.username ?? '?'} />
          <div className="req-row__meta">
            <span className="req-row__name">{r.recipient?.username}</span>
            <span className="req-row__sub">{r.recipient?.email}</span>
            <span className="req-row__sub">
              {new Date(r.created_at).toLocaleDateString()} · {r.status}
            </span>
          </div>
          {r.status === 'pending' && (
            <div className="req-row__actions">
              <button
                type="button"
                className="om-btn om-btn--quiet om-btn--sm"
                onClick={() => onCancel(r.id)}
              >
                Cancel
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default ContactRequests;