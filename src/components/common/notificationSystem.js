export const notificationSystem = {
    notifications: [],
    listeners: new Set(),
    add(type, message) {
        const n = {
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
    remove(id) {
        this.notifications = this.notifications.filter((n) => n.id !== id);
        this.emit();
    },
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    },
    emit() {
        this.listeners.forEach((l) => l(this.notifications));
    },
};
