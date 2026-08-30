import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { getUserKey } from '../../store/slices/keysSlice';
import { KeyService } from '../../services';
import { updateUnreadCount } from '../../store/slices/contactsSlice';
import { fetchConversationHistory } from '../../store/slices/messagesSlice';
import { setSharedKey as setSharedKeyMap, useSharedKey } from '../../store/sharedKeyStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import KeyVerification from './KeyVerification';
import ConnectionStatus from './ConnectionStatus';
import EncryptionStatus from './EncryptionStatus';
import { Avatar, Icon } from '../ui/Icon';
import './chat.css';
const ChatWindow = ({ onBack }) => {
    const dispatch = useAppDispatch();
    const [showKeyVerification, setShowKeyVerification] = useState(false);
    const { user } = useAppSelector((s) => s.auth);
    const { selectedContact } = useAppSelector((s) => s.contacts);
    const { conversations } = useAppSelector((s) => s.messages);
    const { keyPair, contactKeys } = useAppSelector((s) => s.keys);
    const currentUserId = user?.id || 0;
    const conversation = selectedContact ? conversations[selectedContact.contactId] : undefined;
    const messages = conversation?.messages || [];
    const sharedKey = useSharedKey(selectedContact?.contactId);
    const derivedFor = React.useRef(new Map());
    React.useEffect(() => {
        const id = selectedContact?.contactId;
        if (!id)
            return;
        dispatch(fetchConversationHistory(id));
        dispatch(updateUnreadCount({ contactId: id, increment: false }));
    }, [dispatch, selectedContact?.contactId]);
    React.useEffect(() => {
        const id = selectedContact?.contactId;
        if (!id)
            return;
        if (!contactKeys[id])
            dispatch(getUserKey(id));
    }, [dispatch, selectedContact?.contactId]);
    React.useEffect(() => {
        const id = selectedContact?.contactId;
        if (!id || !keyPair?.privateKey)
            return;
        const ck = contactKeys[id];
        if (sharedKey)
            return;
        if (!ck) {
            dispatch(getUserKey(id));
            return;
        }
        if (!ck.publicKey)
            return;
        const attempt = `${keyPair.privateKey}::${ck.publicKey}`;
        if (derivedFor.current.get(id) === attempt)
            return;
        derivedFor.current.set(id, attempt);
        void (async () => {
            try {
                const derived = await KeyService.deriveSharedKey(keyPair.privateKey, ck.publicKey);
                setSharedKeyMap(id, derived);
            }
            catch (e) {
                console.error('Error deriving shared key:', e);
            }
        })();
    }, [dispatch, selectedContact, keyPair, contactKeys[selectedContact?.contactId ?? -1]]);
    if (!selectedContact) {
        return (_jsx("main", { className: "chat__main", children: _jsxs("div", { className: "chat-empty", children: [_jsx("span", { style: { color: 'var(--color-text-subtle)' }, children: _jsx(Icon, { name: "message", size: 36, strokeWidth: 1.25 }) }), _jsx("h2", { className: "chat-empty__title", children: "Pick a conversation" }), _jsx("p", { className: "chat-empty__desc", children: "Select a contact on the left to start a private, end-to-end encrypted conversation. Or search above to add someone." })] }) }));
    }
    const online = selectedContact.isOnline;
    const lastSeen = selectedContact.lastSeen
        ? new Date(selectedContact.lastSeen).toLocaleString()
        : null;
    return (_jsxs("main", { className: "chat__main", children: [_jsxs("header", { className: "chat-topbar", children: [_jsx("button", { type: "button", className: "om-icon-btn chat-topbar__back", onClick: onBack, "aria-label": "Back to conversations", children: _jsx(Icon, { name: "arrow-left", size: 16 }) }), _jsx(Avatar, { name: selectedContact.username, online: online }), _jsxs("div", { className: "chat-topbar__who", children: [_jsx("div", { className: "chat-topbar__name", children: selectedContact.username }), _jsxs("div", { className: "chat-topbar__sub", children: [_jsx("span", { className: `dot ${online ? 'dot--online' : ''}`, "aria-hidden": "true" }), online ? 'Online now' : lastSeen ? `Last seen ${lastSeen}` : 'Offline'] })] }), _jsxs("div", { className: "chat-topbar__actions", children: [_jsx(ConnectionStatus, {}), _jsx(EncryptionStatus, {}), _jsx("button", { type: "button", className: "om-icon-btn", onClick: () => {
                                    if (!selectedContact.contactId)
                                        return;
                                    if (!contactKeys[selectedContact.contactId]?.publicKey) {
                                        dispatch(getUserKey(selectedContact.contactId));
                                    }
                                    setShowKeyVerification(true);
                                }, "aria-label": "Verify keys", title: "Verify keys", children: _jsx(Icon, { name: "shield", size: 16 }) })] })] }), _jsx(MessageList, { messages: messages, currentUserId: currentUserId, sharedKey: sharedKey || null }), _jsx(MessageInput, { recipientId: selectedContact.contactId, sharedKey: sharedKey || null }), showKeyVerification && (_jsx(KeyVerification, { contactId: Number(selectedContact.contactId), onClose: () => setShowKeyVerification(false) }))] }));
};
export default ChatWindow;
