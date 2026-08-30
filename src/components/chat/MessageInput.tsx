import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../../store';
import { sendMessage } from '../../store/slices/messagesSlice';
import { Icon, Spinner } from '../ui/Icon';

interface MessageInputProps {
  recipientId: number;
  sharedKey: CryptoKey | null;
}

const MessageInput: React.FC<MessageInputProps> = ({ recipientId, sharedKey }) => {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea up to a max
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const send = async () => {
    const text = value.trim();
    if (!text || !recipientId) return;
    setSending(true);
    try {
      await dispatch(
        sendMessage({ recipientId, content: text, sharedKey: sharedKey || undefined }),
      );
      setValue('');
      // reset textarea height
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (e) {
      console.error('Error sending message:', e);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const canSend = value.trim().length > 0 && !sending;

  return (
    <div className="composer" role="region" aria-label="Message composer">
      <div className="composer__inner">
        <textarea
          ref={textareaRef}
          className="composer__textarea"
          placeholder="Write a message…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          aria-label="Message"
          disabled={sending}
        />
        <button
          type="button"
          className={`composer__send ${canSend ? 'composer__send--active' : ''}`}
          onClick={send}
          disabled={!canSend}
          aria-label="Send message"
          title="Send (Enter)"
        >
          {sending ? <Spinner size={16} /> : <Icon name="arrow-up" size={18} />}
        </button>
      </div>
      <p className="composer__hint">
        Press <kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line
      </p>
    </div>
  );
};

export default MessageInput;