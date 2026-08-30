import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchPendingRequests, fetchSentRequests, acceptContactRequest, rejectContactRequest, cancelContactRequest, } from '../../store/slices/contactRequestsSlice';
import { Avatar, Spinner } from '../ui/Icon';
import '../chat/chat.css';
const ContactRequests = () => {
    const dispatch = useAppDispatch();
    const { pendingRequests, sentRequests, isLoading, error } = useAppSelector((s) => s.contactRequests);
    const [activeTab, setActiveTab] = useState('pending');
    useEffect(() => {
        dispatch(fetchPendingRequests());
        dispatch(fetchSentRequests());
    }, [dispatch]);
    return (_jsxs("div", { children: [_jsxs("nav", { className: "req-tabs", role: "tablist", children: [_jsxs("button", { type: "button", className: `req-tab ${activeTab === 'pending' ? 'is-active' : ''}`, onClick: () => setActiveTab('pending'), role: "tab", "aria-selected": activeTab === 'pending', children: ["Inbox", pendingRequests.length > 0 && (_jsx("span", { className: "om-pill om-pill--num", children: pendingRequests.length }))] }), _jsxs("button", { type: "button", className: `req-tab ${activeTab === 'sent' ? 'is-active' : ''}`, onClick: () => setActiveTab('sent'), role: "tab", "aria-selected": activeTab === 'sent', children: ["Sent", sentRequests.length > 0 && (_jsx("span", { className: "om-pill om-pill--num", children: sentRequests.length }))] })] }), error && (_jsx("div", { style: {
                    marginTop: 'var(--sp-4)',
                    padding: 'var(--sp-3)',
                    background: 'var(--color-danger-soft)',
                    color: 'var(--color-danger)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--fs-sm)',
                }, children: error })), _jsx("div", { style: { marginTop: 'var(--sp-5)' }, children: isLoading ? (_jsxs("div", { className: "empty-state", children: [_jsx(Spinner, { size: 16 }), _jsx("span", { children: "Loading\u2026" })] })) : activeTab === 'pending' ? (_jsx(PendingList, { requests: pendingRequests, onAccept: (id) => dispatch(acceptContactRequest(id)), onReject: (id) => dispatch(rejectContactRequest(id)) })) : (_jsx(SentList, { requests: sentRequests, onCancel: (id) => dispatch(cancelContactRequest(id)) })) })] }));
};
function PendingList({ requests, onAccept, onReject, }) {
    if (requests.length === 0) {
        return (_jsxs("div", { className: "empty-state", children: [_jsx("h3", { className: "empty-state__title", children: "Inbox is empty" }), _jsx("p", { className: "empty-state__desc", children: "When someone sends you a contact request, it'll show up here." })] }));
    }
    return (_jsx("ul", { className: "req-list", role: "list", children: requests.map((r) => (_jsxs("li", { className: "req-row", children: [_jsx(Avatar, { name: r.sender?.username ?? '?' }), _jsxs("div", { className: "req-row__meta", children: [_jsx("span", { className: "req-row__name", children: r.sender?.username }), _jsx("span", { className: "req-row__sub", children: r.sender?.email }), _jsx("span", { className: "req-row__sub", children: new Date(r.created_at).toLocaleDateString() })] }), _jsxs("div", { className: "req-row__actions", children: [_jsx("button", { type: "button", className: "om-btn om-btn--quiet om-btn--sm", onClick: () => onReject(r.id), children: "Decline" }), _jsx("button", { type: "button", className: "om-btn om-btn--primary om-btn--sm", onClick: () => onAccept(r.id), children: "Accept" })] })] }, r.id))) }));
}
function SentList({ requests, onCancel, }) {
    if (requests.length === 0) {
        return (_jsxs("div", { className: "empty-state", children: [_jsx("h3", { className: "empty-state__title", children: "No sent requests" }), _jsx("p", { className: "empty-state__desc", children: "Use \u201CAdd contact\u201D in the chat sidebar to send your first request." })] }));
    }
    return (_jsx("ul", { className: "req-list", role: "list", children: requests.map((r) => (_jsxs("li", { className: "req-row", children: [_jsx(Avatar, { name: r.recipient?.username ?? '?' }), _jsxs("div", { className: "req-row__meta", children: [_jsx("span", { className: "req-row__name", children: r.recipient?.username }), _jsx("span", { className: "req-row__sub", children: r.recipient?.email }), _jsxs("span", { className: "req-row__sub", children: [new Date(r.created_at).toLocaleDateString(), " \u00B7 ", r.status] })] }), r.status === 'pending' && (_jsx("div", { className: "req-row__actions", children: _jsx("button", { type: "button", className: "om-btn om-btn--quiet om-btn--sm", onClick: () => onCancel(r.id), children: "Cancel" }) }))] }, r.id))) }));
}
export default ContactRequests;
