import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../../store';
import { Message } from '../../types';
import { cryptoService } from '../../services';

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  sharedKey: CryptoKey | null;
}

interface Resolved {
  /** Resolved display text (always non-empty when a shared key was provided). */
  text: string;
  /** True if decryption actually ran and produced a plain string. */
  decrypted: boolean;
}

/**
 * Per-message decryption: if the message is still flagged `isEncrypted` and we
 * hold a shared key, attempt decryption inline. The result is cached by
 * `(clientMessageId|id|timestamp|sharedKey)` so re-renders do not redo the
 * WebCrypto work. If decryption fails, we fall back to the raw content so
 * the user always sees something rather than a stuck "Encrypted message".
 */
function useResolvedContent(
  message: Message,
  sharedKey: CryptoKey | null
): Resolved {
  const [resolved, setResolved] = useState<Resolved>({
    text: message.content,
    decrypted: !message.isEncrypted,
  });
  const cacheKey = sharedKey
    ? `k=${sharedKey ? '1' : '0'}|id=${message.id ?? ''}|cmid=${message.clientMessageId ?? ''}|ts=${message.timestamp}|enc=${message.isEncrypted ? 1 : 0}`
    : '';

  useEffect(() => {
    let cancelled = false;
    if (!message.isEncrypted) {
      setResolved({ text: message.content, decrypted: true });
      return () => {
        cancelled = true;
      };
    }
    if (!sharedKey) {
      setResolved({ text: message.content, decrypted: false });
      return () => {
        cancelled = true;
      };
    }
    cryptoService
      .decryptMessage(message.content, sharedKey)
      .then((plain) => {
        if (cancelled) return;
        setResolved({ text: plain, decrypted: true });
      })
      .catch(() => {
        if (cancelled) return;
        setResolved({ text: message.content, decrypted: false });
      });
    return () => {
      cancelled = true;
    };
    // cacheKey change triggers a fresh attempt; identity is irrelevant.
  }, [cacheKey, message.content, message.isEncrypted, sharedKey]);

  return resolved;
}

function MessageBubble({
  message,
  currentUserId,
  sharedKey,
  showTimestamp,
  isFirst,
  formatTime,
}: {
  message: Message;
  currentUserId: number;
  sharedKey: CryptoKey | null;
  showTimestamp: boolean;
  isFirst: boolean;
  formatTime: (ts: string) => string;
}) {
  const isSender = message.senderId === currentUserId;
  const resolved = useResolvedContent(message, sharedKey);

  return (
    <React.Fragment>
      {showTimestamp && (
        <div
          className="timestamp-divider badge-neobrutalism"
          style={{
            margin: '1rem auto',
            textAlign: 'center',
            width: 'fit-content',
          }}
        >
          {new Date(message.timestamp).toLocaleDateString()}
        </div>
      )}
      <div className={isSender ? 'message-neobrutalism-sent' : 'message-neobrutalism-received'}>
        <div className="message-content">
          {message.isEncrypted && !resolved.decrypted ? (
            <div className="encrypted-message">
              <i className="fas fa-lock mr-2"></i> Encrypted message
            </div>
          ) : (
            <span>{resolved.text}</span>
          )}
          <span
            className="message-time"
            style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              display: 'block',
              textAlign: isSender ? 'right' : 'left',
            }}
          >
            {formatTime(message.timestamp)}
            {isSender && (
              <span className={`message-status ${message.status} ml-1`}>
                {message.status === 'sent' && <i className="fas fa-check"></i>}
                {message.status === 'delivered' && <i className="fas fa-check-double"></i>}
                {message.status === 'read' && <i className="fas fa-check-double read"></i>}
              </span>
            )}
          </span>
        </div>
      </div>
    </React.Fragment>
  );
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, sharedKey }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (messages.length === 0) {
    return (
      <div
        className="no-messages card-neobrutalism"
        style={{ padding: '2rem', textAlign: 'center' }}
      >
        <i
          className="fas fa-comment-slash"
          style={{ fontSize: '2rem', marginBottom: '1rem' }}
        ></i>
        <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>No messages yet</p>
        <p style={{ display: 'inline-block', marginTop: '1rem' }}>
          Send a message to start the conversation
        </p>
      </div>
    );
  }

  return (
    <>
      {messages.map((message, index) => {
        const showTimestamp =
          index === 0 ||
          new Date(message.timestamp).getTime() -
            new Date(messages[index - 1].timestamp).getTime() >
            5 * 60 * 1000;
        return (
          <MessageBubble
            key={message.id ?? `${message.senderId}-${message.timestamp}-${index}`}
            message={message}
            currentUserId={currentUserId}
            sharedKey={sharedKey}
            showTimestamp={showTimestamp}
            isFirst={index === 0}
            formatTime={formatTime}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </>
  );
};

export default MessageList;
