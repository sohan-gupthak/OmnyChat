import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from 'react';
import { cryptoService } from '../../services';
import { Icon } from '../ui/Icon';
/**
 * Decrypts all messages in batch. The per-message `useResolvedContent` hook
 * was called inside `.map()` which violates the Rules of Hooks — order of
 * hook calls can't be guaranteed across renders. Computing once with an
 * effect over the message list is correct and still caches by message id.
 */
function useResolvedMessages(messages, sharedKey) {
    const [resolved, setResolved] = useState(() => messages.map((m) => ({
        text: m.content,
        decrypted: !m.isEncrypted,
    })));
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const next = [];
            for (const m of messages) {
                if (!m.isEncrypted) {
                    next.push({ text: m.content, decrypted: true });
                    continue;
                }
                if (!sharedKey) {
                    next.push({ text: m.content, decrypted: false });
                    continue;
                }
                try {
                    const plain = await cryptoService.decryptMessage(m.content, sharedKey);
                    next.push({ text: plain, decrypted: true });
                }
                catch {
                    next.push({ text: m.content, decrypted: false });
                }
            }
            if (!cancelled)
                setResolved(next);
        })();
        return () => {
            cancelled = true;
        };
    }, [messages, sharedKey]);
    return resolved;
}
function formatDay(ts) {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString())
        return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString())
        return 'Yesterday';
    return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
}
function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
const MessageList = ({ messages, currentUserId, sharedKey, }) => {
    const endRef = useRef(null);
    const resolved = useResolvedMessages(messages, sharedKey);
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages.length]);
    if (messages.length === 0) {
        return (_jsxs("div", { className: "conv-empty", children: [_jsx("span", { className: "conv-empty__title", children: "Say hello" }), _jsx("p", { className: "conv-empty__desc", children: "No messages yet. Anything you send is end-to-end encrypted with this contact." })] }));
    }
    return (_jsx("div", { className: "messages", "aria-live": "polite", children: _jsxs("div", { className: "messages__inner", children: [messages.map((m, i) => {
                    const isOut = m.senderId === currentUserId;
                    const r = resolved[i] ?? { text: m.content, decrypted: !m.isEncrypted };
                    const prev = messages[i - 1];
                    const showDay = !prev ||
                        new Date(prev.timestamp).toDateString() !==
                            new Date(m.timestamp).toDateString();
                    return (_jsxs(React.Fragment, { children: [showDay && _jsx("div", { className: "messages__day", children: formatDay(m.timestamp) }), _jsxs("div", { className: `msg ${isOut ? 'msg--out' : 'msg--in'}`, children: [_jsx("div", { className: "bubble", children: m.isEncrypted && !r.decrypted ? (_jsxs("span", { className: "bubble--encrypted", children: [_jsx(Icon, { name: "lock", size: 14 }), "Encrypted message"] })) : (r.text) }), _jsxs("div", { className: "msg__meta", children: [isOut && (_jsxs("span", { className: m.status === 'read' ? 'check read' : 'check', "aria-label": m.status ?? 'sent', children: [m.status === 'sent' && _jsx(Icon, { name: "check", size: 12 }), m.status === 'delivered' && (_jsx(Icon, { name: "check-double", size: 12 })), m.status === 'read' && (_jsx(Icon, { name: "check-double", size: 12 }))] })), _jsx("span", { children: formatTime(m.timestamp) })] })] })] }, m.id ?? `${m.senderId}-${m.timestamp}-${i}`));
                }), _jsx("div", { ref: endRef })] }) }));
};
export default MessageList;
