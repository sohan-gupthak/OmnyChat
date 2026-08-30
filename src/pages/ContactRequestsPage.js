import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactRequests } from '../components/ContactRequests';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPendingRequests, fetchSentRequests, } from '../store/slices/contactRequestsSlice';
import { Icon } from '../components/ui/Icon';
const ContactRequestsPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((s) => s.auth);
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        dispatch(fetchPendingRequests());
        dispatch(fetchSentRequests());
    }, [user, navigate, dispatch]);
    return (_jsxs("div", { className: "req-page", children: [_jsxs("header", { className: "req-page__head", children: [_jsx("button", { type: "button", className: "om-icon-btn", onClick: () => navigate('/chat'), "aria-label": "Back to chat", title: "Back to chat", children: _jsx(Icon, { name: "arrow-left", size: 16 }) }), _jsx("h1", { className: "req-page__title", children: "Contact requests" })] }), _jsx("main", { className: "req-page__body", children: _jsx(ContactRequests, {}) })] }));
};
export default ContactRequestsPage;
