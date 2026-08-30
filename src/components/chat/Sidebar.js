import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { selectContact } from '../../store/slices/contactsSlice';
import { addContact } from '../../store/slices/contactsSlice';
import { fetchPendingRequests } from '../../store/slices/contactRequestsSlice';
import { UserService } from '../../services';
import { SendContactRequest } from '../ContactRequests';
import Modal from '../ui/Modal';
import { Avatar, Icon, Spinner } from '../ui/Icon';
import './chat.css';
const Sidebar = ({ onItemClick }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((s) => s.auth);
    const { contacts, selectedContact } = useAppSelector((s) => s.contacts);
    const { pendingRequests } = useAppSelector((s) => s.contactRequests);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSendRequest, setShowSendRequest] = useState(false);
    const runSearch = async (q) => {
        if (!q.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await UserService.searchUsers(q);
            if (res.success && res.data?.users) {
                setSearchResults(res.data.users.filter((u) => u.id !== user?.id && !contacts.some((c) => c.contactId === u.id)));
            }
            else {
                setSearchResults([]);
            }
        }
        catch {
            setSearchResults([]);
        }
        finally {
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
    const select = (contactId) => {
        const c = contacts.find((x) => x.contactId === contactId);
        if (c) {
            dispatch(selectContact(c));
            onItemClick?.();
        }
    };
    const handleAddContact = async (userId) => {
        try {
            await dispatch(addContact(userId));
            setSearchResults([]);
            setSearchQuery('');
            setShowSendRequest(false);
            onItemClick?.();
        }
        catch {
            // swallow; UI shows nothing critical
        }
    };
    return (_jsxs("aside", { className: "chat__sidebar", "aria-label": "Conversations", children: [_jsxs("div", { className: "sidebar-head", children: [_jsxs("div", { className: "sidebar-head__top", children: [_jsxs("div", { className: "sidebar-head__brand", children: [_jsx("span", { className: "mark", "aria-hidden": "true", children: _jsx(Icon, { name: "shield", size: 14, strokeWidth: 2.25 }) }), "OmnyChat"] }), _jsxs("div", { style: { display: 'inline-flex', gap: 4 }, children: [_jsx("button", { type: "button", className: "om-icon-btn", onClick: () => setShowSendRequest(true), "aria-label": "Add contact", title: "Add contact", children: _jsx(Icon, { name: "user-plus", size: 16 }) }), _jsx("button", { type: "button", className: "om-icon-btn", onClick: () => {
                                            dispatch(logout());
                                            navigate('/login');
                                        }, "aria-label": "Sign out", title: "Sign out", children: _jsx(Icon, { name: "logout", size: 16 }) })] })] }), _jsxs("div", { className: "sidebar-profile", children: [_jsx(Avatar, { name: user?.username ?? '?', size: "md" }), _jsxs("div", { children: [_jsx("div", { className: "sidebar-profile__name", children: user?.username ?? 'You' }), _jsx("div", { className: "sidebar-profile__meta", children: user?.email })] })] }), _jsxs("label", { className: "sidebar-search", children: [_jsx(Icon, { name: "search", size: 14 }), _jsx("input", { value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search people\u2026", type: "text", inputMode: "search", "aria-label": "Search people" }), isSearching && _jsx(Spinner, { size: 14 })] }), searchQuery.trim() && (_jsxs("div", { className: "search-results", children: [searchResults.length === 0 && !isSearching && (_jsx("p", { style: {
                                    fontSize: 'var(--fs-xs)',
                                    color: 'var(--color-text-subtle)',
                                    padding: 'var(--sp-3)',
                                }, children: "No matches." })), searchResults.map((u) => (_jsxs("button", { type: "button", className: "user-row", onClick: () => handleAddContact(u.id), children: [_jsx(Avatar, { name: u.username }), _jsxs("div", { className: "user-row__meta", children: [_jsx("span", { className: "user-row__name", children: u.username }), _jsx("span", { className: "user-row__sub", children: u.email })] }), _jsxs("span", { className: "om-pill om-pill--accent", children: [_jsx(Icon, { name: "plus", size: 12 }), " Add"] })] }, u.id)))] }))] }), pendingRequests.length > 0 && (_jsxs("button", { type: "button", className: "request-banner", onClick: () => navigate('/contact-requests'), children: [_jsx("span", { className: "request-banner__icon", children: _jsx(Icon, { name: "bell", size: 14 }) }), _jsxs("span", { className: "request-banner__label", children: [pendingRequests.length, " pending", ' ', pendingRequests.length === 1 ? 'request' : 'requests'] }), _jsx("span", { className: "request-banner__cta", children: _jsx(Icon, { name: "arrow-right", size: 14 }) })] })), _jsx("div", { className: "sidebar-section", children: _jsx("div", { className: "sidebar-section__head", children: "Conversations" }) }), _jsx("div", { className: "sidebar-list", children: contacts.length === 0 ? (_jsxs("div", { className: "sidebar-empty", children: [_jsx("p", { children: "No conversations yet." }), _jsx("p", { style: { fontSize: 'var(--fs-xs)' }, children: "Search above to add your first contact." })] })) : (contacts.map((c) => {
                    const active = selectedContact?.contactId === c.contactId;
                    return (_jsxs("button", { type: "button", className: `contact-row ${active ? 'is-active' : ''}`, onClick: () => select(c.contactId), "aria-pressed": active, children: [_jsx(Avatar, { name: c.username, online: c.isOnline }), _jsxs("div", { className: "contact-row__meta", children: [_jsx("span", { className: "contact-row__name", children: c.username }), _jsx("span", { className: "contact-row__sub", children: c.isOnline ? 'Online' : c.lastSeen ? `Last seen ${formatRelative(c.lastSeen)}` : 'Offline' })] }), c.unreadCount > 0 && (_jsx("span", { className: "contact-row__badge", children: _jsx("span", { className: "om-pill om-pill--accent om-pill--num", children: c.unreadCount }) }))] }, c.contactId));
                })) }), _jsx(Modal, { isOpen: showSendRequest, onClose: () => setShowSendRequest(false), title: "Add contact", children: _jsx(SendContactRequest, { onClose: () => setShowSendRequest(false) }) })] }));
};
function formatRelative(iso) {
    try {
        const date = new Date(iso);
        const now = Date.now();
        const diff = (now - date.getTime()) / 1000;
        if (diff < 60)
            return 'just now';
        if (diff < 3600)
            return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400)
            return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    }
    catch {
        return 'recently';
    }
}
export default Sidebar;
