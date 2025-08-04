import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store';
import './Notifications.css';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

// Create a global notification system
export const notificationSystem = {
  notifications: [] as Notification[],
  listeners: [] as Function[],
  
  addNotification(type: 'info' | 'success' | 'warning' | 'error', message: string) {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now()
    };
    
    this.notifications = [...this.notifications, notification];
    this.notifyListeners();
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
    
    return notification.id;
  },
  
  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  },
  
  subscribe(listener: Function) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  useEffect(() => {
    // Only show notifications when authenticated
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    
    const unsubscribe = notificationSystem.subscribe((updatedNotifications: Notification[]) => {
      setNotifications([...updatedNotifications]);
    });
    
    return unsubscribe as () => void;
  }, [isAuthenticated]);
  
  const handleClose = (id: string) => {
    notificationSystem.removeNotification(id);
  };
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification ${notification.type}`}
        >
          <div className="notification-icon">
            {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
            {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
            {notification.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
            {notification.type === 'error' && <i className="fas fa-times-circle"></i>}
          </div>
          <div className="notification-content">
            {notification.message}
          </div>
          <button 
            className="notification-close" 
            onClick={() => handleClose(notification.id)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
