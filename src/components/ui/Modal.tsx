import React, { useEffect } from 'react';
import { Icon } from './Icon';
import '../chat/chat.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && (
          <header className="modal__head">
            <h3 className="modal__title">{title}</h3>
            <button
              type="button"
              className="om-icon-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <Icon name="x" size={16} />
            </button>
          </header>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;