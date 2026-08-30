import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store';
import { Icon } from '../ui/Icon';
import { notificationSystem } from './notificationSystem';
const ICON = {
    info: 'info',
    success: 'check-circle',
    warning: 'warning',
    error: 'error',
};
const Notifications = () => {
    const [items, setItems] = useState([]);
    const { isAuthenticated } = useAppSelector((s) => s.auth);
    useEffect(() => {
        if (!isAuthenticated) {
            setItems([]);
            return;
        }
        const unsub = notificationSystem.subscribe((next) => setItems([...next]));
        return unsub;
    }, [isAuthenticated]);
    if (items.length === 0)
        return null;
    return (_jsx("div", { className: "om-toasts", "aria-live": "polite", children: items.map((n) => (_jsxs("div", { className: "om-toast", role: "status", children: [_jsx("span", { className: "om-toast__icon", children: _jsx(Icon, { name: ICON[n.type], size: 16 }) }), _jsx("div", { className: "om-toast__body", children: n.message }), _jsx("button", { type: "button", className: "om-icon-btn om-toast__close", onClick: () => notificationSystem.remove(n.id), "aria-label": "Dismiss", children: _jsx(Icon, { name: "x", size: 14 }) })] }, n.id))) }));
};
export default Notifications;
