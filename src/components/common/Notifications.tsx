import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../store';
import { Icon } from '../ui/Icon';
import { notificationSystem, Notification } from './notificationSystem';

const ICON: Record<Notification['type'], 'info' | 'check-circle' | 'warning' | 'error'> = {
  info: 'info',
  success: 'check-circle',
  warning: 'warning',
  error: 'error',
};

const Notifications: React.FC = () => {
  const [items, setItems] = useState<Notification[]>([]);
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    const unsub = notificationSystem.subscribe((next) => setItems([...next]));
    return unsub as () => void;
  }, [isAuthenticated]);

  if (items.length === 0) return null;

  return (
    <div className="om-toasts" aria-live="polite">
      {items.map((n) => (
        <div key={n.id} className="om-toast" role="status">
          <span className="om-toast__icon">
            <Icon name={ICON[n.type]} size={16} />
          </span>
          <div className="om-toast__body">{n.message}</div>
          <button
            type="button"
            className="om-icon-btn om-toast__close"
            onClick={() => notificationSystem.remove(n.id)}
            aria-label="Dismiss"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;