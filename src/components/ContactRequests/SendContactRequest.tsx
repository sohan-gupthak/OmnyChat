import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { sendContactRequest } from '../../store/slices/contactRequestsSlice';
import { UserService } from '../../services';
import { User } from '../../types';
import { Avatar, Icon, Spinner } from '../ui/Icon';
import '../chat/chat.css';

interface SendContactRequestProps {
  onClose: () => void;
}

const SendContactRequest: React.FC<SendContactRequestProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const { isLoading } = useAppSelector((s) => s.contactRequests);
  const { user: currentUser } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const res = await UserService.searchUsers(query);
        if (res.success && res.data) {
          setResults(res.data.users.filter((u) => currentUser && u.id !== currentUser.id));
        } else {
          setResults([]);
        }
      } catch {
        setError('Search failed');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query, currentUser]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      setError('Pick someone from the list');
      return;
    }
    setError(null);
    try {
      await dispatch(sendContactRequest(selected.id)).unwrap();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send contact request';
      setError(msg);
    }
  };

  return (
    <form className="modal__body" onSubmit={submit} style={{ gap: 'var(--sp-4)' }}>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
        Find a user by username or email, then send a contact request.
      </p>

      <div className="searchbar">
        <Icon name="search" size={14} />
        <input
          autoFocus
          value={selected ? selected.username : query}
          onChange={(e) => {
            setSelected(null);
            setQuery(e.target.value);
          }}
          placeholder="Username or email"
          aria-label="Search users"
        />
        {searching && <Spinner size={14} />}
      </div>

      {error && (
        <div
          style={{
            color: 'var(--color-danger)',
            background: 'var(--color-danger-soft)',
            padding: 'var(--sp-3)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--fs-sm)',
          }}
        >
          {error}
        </div>
      )}

      {results.length > 0 && !selected && (
        <div role="listbox" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {results.map((u) => (
            <button
              type="button"
              key={u.id}
              className="user-row"
              onClick={() => setSelected(u)}
            >
              <Avatar name={u.username} />
              <div className="user-row__meta">
                <span className="user-row__name">{u.username}</span>
                <span className="user-row__sub">{u.email}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="user-row" aria-pressed="true">
          <Avatar name={selected.username} />
          <div className="user-row__meta">
            <span className="user-row__name">{selected.username}</span>
            <span className="user-row__sub">{selected.email}</span>
          </div>
          <span className="om-pill om-pill--accent">Selected</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)' }}>
        <button type="button" className="om-btn om-btn--quiet" onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
        <button
          type="submit"
          className="om-btn om-btn--primary"
          disabled={isLoading || !selected}
        >
          {isLoading ? <Spinner size={14} /> : null}
          {isLoading ? 'Sending…' : 'Send request'}
        </button>
      </div>
    </form>
  );
};

export default SendContactRequest;