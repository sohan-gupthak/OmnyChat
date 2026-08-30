import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Icon } from './Icon';
import '../chat/chat.css';
const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        if (!isOpen)
            return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "modal-overlay", role: "dialog", "aria-modal": "true", onClick: onClose, children: _jsxs("div", { className: "modal", onClick: (e) => e.stopPropagation(), children: [title && (_jsxs("header", { className: "modal__head", children: [_jsx("h3", { className: "modal__title", children: title }), _jsx("button", { type: "button", className: "om-icon-btn", onClick: onClose, "aria-label": "Close", children: _jsx(Icon, { name: "x", size: 16 }) })] })), children] }) }));
};
export default Modal;
