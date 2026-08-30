import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../../store';
import { sendMessage } from '../../store/slices/messagesSlice';
import { Icon, Spinner } from '../ui/Icon';
const MessageInput = ({ recipientId, sharedKey }) => {
    const dispatch = useAppDispatch();
    const [value, setValue] = useState('');
    const [sending, setSending] = useState(false);
    const textareaRef = useRef(null);
    // Auto-grow textarea up to a max
    useEffect(() => {
        const el = textareaRef.current;
        if (!el)
            return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }, [value]);
    const send = async () => {
        const text = value.trim();
        if (!text || !recipientId)
            return;
        setSending(true);
        try {
            await dispatch(sendMessage({ recipientId, content: text, sharedKey: sharedKey || undefined }));
            setValue('');
            // reset textarea height
            if (textareaRef.current)
                textareaRef.current.style.height = 'auto';
        }
        catch (e) {
            console.error('Error sending message:', e);
        }
        finally {
            setSending(false);
        }
    };
    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void send();
        }
    };
    const canSend = value.trim().length > 0 && !sending;
    return (_jsxs("div", { className: "composer", role: "region", "aria-label": "Message composer", children: [_jsxs("div", { className: "composer__inner", children: [_jsx("textarea", { ref: textareaRef, className: "composer__textarea", placeholder: "Write a message\u2026", value: value, onChange: (e) => setValue(e.target.value), onKeyDown: onKeyDown, rows: 1, "aria-label": "Message", disabled: sending }), _jsx("button", { type: "button", className: `composer__send ${canSend ? 'composer__send--active' : ''}`, onClick: send, disabled: !canSend, "aria-label": "Send message", title: "Send (Enter)", children: sending ? _jsx(Spinner, { size: 16 }) : _jsx(Icon, { name: "arrow-up", size: 18 }) })] }), _jsxs("p", { className: "composer__hint", children: ["Press ", _jsx("kbd", { children: "Enter" }), " to send \u00B7 ", _jsx("kbd", { children: "Shift" }), "+", _jsx("kbd", { children: "Enter" }), " for a new line"] })] }));
};
export default MessageInput;
