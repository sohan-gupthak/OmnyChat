import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { sendContactRequest } from '../../store/slices/contactRequestsSlice';
import { UserService } from '../../services';
import { Avatar, Icon, Spinner } from '../ui/Icon';
import '../chat/chat.css';
const SendContactRequest = ({ onClose }) => {
    const dispatch = useAppDispatch();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState(null);
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
                }
                else {
                    setResults([]);
                }
            }
            catch {
                setError('Search failed');
                setResults([]);
            }
            finally {
                setSearching(false);
            }
        }, 400);
        return () => clearTimeout(t);
    }, [query, currentUser]);
    const submit = async (e) => {
        e.preventDefault();
        if (!selected) {
            setError('Pick someone from the list');
            return;
        }
        setError(null);
        try {
            await dispatch(sendContactRequest(selected.id)).unwrap();
            onClose();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to send contact request';
            setError(msg);
        }
    };
    return (_jsxs("form", { className: "modal__body", onSubmit: submit, style: { gap: 'var(--sp-4)' }, children: [_jsx("p", { style: { fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }, children: "Find a user by username or email, then send a contact request." }), _jsxs("div", { className: "searchbar", children: [_jsx(Icon, { name: "search", size: 14 }), _jsx("input", { autoFocus: true, value: selected ? selected.username : query, onChange: (e) => {
                            setSelected(null);
                            setQuery(e.target.value);
                        }, placeholder: "Username or email", "aria-label": "Search users" }), searching && _jsx(Spinner, { size: 14 })] }), error && (_jsx("div", { style: {
                    color: 'var(--color-danger)',
                    background: 'var(--color-danger-soft)',
                    padding: 'var(--sp-3)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--fs-sm)',
                }, children: error })), results.length > 0 && !selected && (_jsx("div", { role: "listbox", style: { display: 'flex', flexDirection: 'column', gap: 2 }, children: results.map((u) => (_jsxs("button", { type: "button", className: "user-row", onClick: () => setSelected(u), children: [_jsx(Avatar, { name: u.username }), _jsxs("div", { className: "user-row__meta", children: [_jsx("span", { className: "user-row__name", children: u.username }), _jsx("span", { className: "user-row__sub", children: u.email })] })] }, u.id))) })), selected && (_jsxs("div", { className: "user-row", "aria-pressed": "true", children: [_jsx(Avatar, { name: selected.username }), _jsxs("div", { className: "user-row__meta", children: [_jsx("span", { className: "user-row__name", children: selected.username }), _jsx("span", { className: "user-row__sub", children: selected.email })] }), _jsx("span", { className: "om-pill om-pill--accent", children: "Selected" })] })), _jsxs("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)' }, children: [_jsx("button", { type: "button", className: "om-btn om-btn--quiet", onClick: onClose, disabled: isLoading, children: "Cancel" }), _jsxs("button", { type: "submit", className: "om-btn om-btn--primary", disabled: isLoading || !selected, children: [isLoading ? _jsx(Spinner, { size: 14 }) : null, isLoading ? 'Sending…' : 'Send request'] })] })] }));
};
export default SendContactRequest;
