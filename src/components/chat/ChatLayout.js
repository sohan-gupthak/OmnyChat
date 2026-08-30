import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { getProfile } from '../../store/slices/authSlice';
import { fetchContacts, selectContact } from '../../store/slices/contactsSlice';
import { fetchOfflineMessages } from '../../store/slices/messagesSlice';
import { getServerKey } from '../../store/slices/keysSlice';
import { websocketService } from '../../services';
import WebRTCIntegration from './WebRTCIntegration';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import './chat.css';
const ChatLayout = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, token, isAuthenticated } = useAppSelector((s) => s.auth);
    const { contacts, selectedContact } = useAppSelector((s) => s.contacts);
    const [mobileOpen, setMobileOpen] = useState(selectedContact ? 'chat' : 'list');
    useEffect(() => {
        if (!isAuthenticated)
            navigate('/login');
    }, [isAuthenticated, navigate]);
    useEffect(() => {
        if (!token)
            return;
        websocketService.connect(token);
        dispatch(getProfile());
        dispatch(fetchContacts());
        dispatch(fetchOfflineMessages());
        dispatch(getServerKey());
        return () => {
            if (websocketService.isConnected())
                websocketService.disconnect();
        };
    }, [dispatch, token]);
    useEffect(() => {
        if (!contacts || contacts.length === 0)
            return;
        if (!selectedContact) {
            const valid = contacts.find((c) => c &&
                typeof c.contactId === 'number' &&
                !isNaN(c.contactId) &&
                c.contactId > 0);
            if (valid)
                dispatch(selectContact(valid));
        }
    }, [dispatch, contacts, selectedContact]);
    // Mirror selection to mobile open state
    useEffect(() => {
        if (selectedContact)
            setMobileOpen('chat');
    }, [selectedContact?.contactId]);
    if (!isAuthenticated || !user)
        return null;
    return (_jsxs("div", { className: "chat", "data-open": mobileOpen, children: [_jsx(WebRTCIntegration, {}), _jsx(Sidebar, { onItemClick: () => setMobileOpen('chat') }), _jsx("div", { className: "chat-backdrop", onClick: () => setMobileOpen('chat'), "aria-hidden": "true" }), _jsx(ChatWindow, { onBack: () => setMobileOpen('list') })] }));
};
export default ChatLayout;
