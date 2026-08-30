import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { contactRequestService } from '../../services';
import { Avatar, Spinner } from '../ui/Icon';
import '../chat/chat.css';
const UserProfile = ({ user, isContact = false, onClose }) => {
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const send = async () => {
        setSending(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await contactRequestService.sendRequest(user.id);
            if (res.success)
                setSuccess('Contact request sent');
            else
                setError(res.error || 'Failed to send contact request');
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to send contact request';
            setError(msg);
        }
        finally {
            setSending(false);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "modal__body", children: [_jsxs("div", { className: "profile-modal", children: [_jsx(Avatar, { name: user.username, size: "xl" }), _jsx("h2", { className: "profile-modal__name", children: user.username }), _jsxs("dl", { className: "profile-modal__meta", children: [_jsxs("div", { children: [_jsx("dt", { children: "Email" }), _jsx("dd", { children: user.email })] }), _jsxs("div", { children: [_jsx("dt", { children: "User ID" }), _jsxs("dd", { children: ["#", user.id] })] })] })] }), error && (_jsx("div", { style: {
                            color: 'var(--color-danger)',
                            background: 'var(--color-danger-soft)',
                            padding: 'var(--sp-3)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--fs-sm)',
                        }, children: error })), success && (_jsx("div", { style: {
                            color: 'var(--color-success)',
                            background: 'var(--color-success-soft)',
                            padding: 'var(--sp-3)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--fs-sm)',
                        }, children: success }))] }), _jsxs("footer", { className: "modal__foot", children: [_jsx("button", { type: "button", className: "om-btn om-btn--quiet", onClick: onClose, children: "Close" }), !isContact && (_jsxs("button", { type: "button", className: "om-btn om-btn--primary", onClick: send, disabled: sending || !!success, children: [sending && _jsx(Spinner, { size: 14 }), success
                                ? 'Request sent'
                                : sending
                                    ? 'Sending…'
                                    : 'Send contact request'] }))] })] }));
};
export default UserProfile;
