import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { selectContact } from '../../store/slices/contactsSlice';
import { addContact } from '../../store/slices/contactsSlice';
import { fetchPendingRequests } from '../../store/slices/contactRequestsSlice';
import { UserService } from '../../services';
import { User } from '../../types';
import { SendContactRequest } from '../ContactRequests';
import Modal from '../ui/Modal';
import { Avatar, Icon, Spinner } from '../ui/Icon';
import './chat.css';

const Sidebar: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((s) => s.auth);
  const { contacts, selectedContact } = useAppSelector((s) => s.contacts);
  const { pendingRequests } = useAppSelector((s) => s.contactRequests);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSendRequest, setShowSendRequest] = useState(false);

  const runSearch = async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await UserService.searchUsers(q);
      if (res.success && res.data?.users) {
        setSearchResults(
          res.data.users.filter(
            (u: User) =>
              u.id !== user?.id && !contacts.some((c) => c.contactId === u.id),
          ),
        );
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => runSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    dispatch(fetchPendingRequests());
    const id = setInterval(() => dispatch(fetchPendingRequests()), 30_000);
    return () => clearInterval(id);
  }, [dispatch]);

  const select = (contactId: number) => {
    const c = contacts.find((x) => x.contactId === contactId);
    if (c) {
      dispatch(selectContact(c));
      onItemClick?.();
    }
  };

  const handleAddContact = async (userId: number) => {
    try {
      await dispatch(addContact(userId));
      setSearchResults([]);
      setSearchQuery('');
      setShowSendRequest(false);
      onItemClick?.();
    } catch {
      // swallow; UI shows nothing critical
    }
  };

  return (
    <aside className="chat__sidebar" aria-label="Conversations">
      <div className="sidebar-head">
        <div className="sidebar-head__top">
          <div className="sidebar-head__brand">
            <span className="mark" aria-hidden="true">
              <Icon name="shield" size={14} strokeWidth={2.25} />
            </span>
            OmnyChat
          </div>
          <div style={{ display: 'inline-flex', gap: 4 }}>
            <button
              type="button"
              className="om-icon-btn"
              onClick={() => setShowSendRequest(true)}
              aria-label="Add contact"
              title="Add contact"
            >
              <Icon name="user-plus" size={16} />
            </button>
            <button
              type="button"
              className="om-icon-btn"
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
              aria-label="Sign out"
              title="Sign out"
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>

        <div className="sidebar-profile">
          <Avatar name={user?.username ?? '?'} size="md" />
          <div>
            <div className="sidebar-profile__name">{user?.username ?? 'You'}</div>
            <div className="sidebar-profile__meta">{user?.email}</div>
          </div>
        </div>

        <label className="sidebar-search">
          <Icon name="search" size={14} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people…"
            type="text"
            inputMode="search"
            aria-label="Search people"
          />
          {isSearching && <Spinner size={14} />}
        </label>

        {searchQuery.trim() && (
          <div className="search-results">
            {searchResults.length === 0 && !isSearching && (
              <p
                style={{
                  fontSize: 'var(--fs-xs)',
                  color: 'var(--color-text-subtle)',
                  padding: 'var(--sp-3)',
                }}
              >
                No matches.
              </p>
            )}
            {searchResults.map((u) => (
              <button
                key={u.id}
                type="button"
                className="user-row"
                onClick={() => handleAddContact(u.id)}
              >
                <Avatar name={u.username} />
                <div className="user-row__meta">
                  <span className="user-row__name">{u.username}</span>
                  <span className="user-row__sub">{u.email}</span>
                </div>
                <span className="om-pill om-pill--accent">
                  <Icon name="plus" size={12} /> Add
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {pendingRequests.length > 0 && (
        <button
          type="button"
          className="request-banner"
          onClick={() => navigate('/contact-requests')}
        >
          <span className="request-banner__icon">
            <Icon name="bell" size={14} />
          </span>
          <span className="request-banner__label">
            {pendingRequests.length} pending{' '}
            {pendingRequests.length === 1 ? 'request' : 'requests'}
          </span>
          <span className="request-banner__cta">
            <Icon name="arrow-right" size={14} />
          </span>
        </button>
      )}

      <div className="sidebar-section">
        <div className="sidebar-section__head">Conversations</div>
      </div>

      <div className="sidebar-list">
        {contacts.length === 0 ? (
          <div className="sidebar-empty">
            <p>No conversations yet.</p>
            <p style={{ fontSize: 'var(--fs-xs)' }}>
              Search above to add your first contact.
            </p>
          </div>
        ) : (
          contacts.map((c) => {
            const active = selectedContact?.contactId === c.contactId;
            return (
              <button
                key={c.contactId}
                type="button"
                className={`contact-row ${active ? 'is-active' : ''}`}
                onClick={() => select(c.contactId)}
                aria-pressed={active}
              >
                <Avatar name={c.username} online={c.isOnline} />
                <div className="contact-row__meta">
                  <span className="contact-row__name">{c.username}</span>
                  <span className="contact-row__sub">
                    {c.isOnline ? 'Online' : c.lastSeen ? `Last seen ${formatRelative(c.lastSeen)}` : 'Offline'}
                  </span>
                </div>
                {c.unreadCount > 0 && (
                  <span className="contact-row__badge">
                    <span className="om-pill om-pill--accent om-pill--num">
                      {c.unreadCount}
                    </span>
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      <Modal
        isOpen={showSendRequest}
        onClose={() => setShowSendRequest(false)}
        title="Add contact"
      >
        <SendContactRequest onClose={() => setShowSendRequest(false)} />
      </Modal>
    </aside>
  );
};

function formatRelative(iso: string): string {
  try {
    const date = new Date(iso);
    const now = Date.now();
    const diff = (now - date.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  } catch {
    return 'recently';
  }
}

export default Sidebar;