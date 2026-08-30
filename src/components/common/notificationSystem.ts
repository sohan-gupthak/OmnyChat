type ToastType = 'info' | 'success' | 'warning' | 'error';
export interface Notification {
  id: string;
  type: ToastType;
  message: string;
  timestamp: number;
}

export const notificationSystem = {
  notifications: [] as Notification[],
  listeners: new Set<(n: Notification[]) => void>(),

  add(type: ToastType, message: string) {
    const n: Notification = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      type,
      message,
      timestamp: Date.now(),
    };
    this.notifications = [...this.notifications, n];
    this.emit();
    setTimeout(() => this.remove(n.id), 5000);
    return n.id;
  },

  remove(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.emit();
  },

  subscribe(listener: (n: Notification[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },

  emit() {
    this.listeners.forEach((l) => l(this.notifications));
  },
};