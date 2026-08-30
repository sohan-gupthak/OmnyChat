import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../../types';
import { cryptoService } from '../../services';
import { Icon } from '../ui/Icon';

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  sharedKey: CryptoKey | null;
}

interface Resolved {
  text: string;
  decrypted: boolean;
}

/**
 * Decrypts all messages in batch. The per-message `useResolvedContent` hook
 * was called inside `.map()` which violates the Rules of Hooks — order of
 * hook calls can't be guaranteed across renders. Computing once with an
 * effect over the message list is correct and still caches by message id.
 */
function useResolvedMessages(
  messages: Message[],
  sharedKey: CryptoKey | null,
): Resolved[] {
  const [resolved, setResolved] = useState<Resolved[]>(() =>
    messages.map((m) => ({
      text: m.content,
      decrypted: !m.isEncrypted,
    })),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: Resolved[] = [];
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
        } catch {
          next.push({ text: m.content, decrypted: false });
        }
      }
      if (!cancelled) setResolved(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [messages, sharedKey]);

  return resolved;
}

function formatDay(ts: string): string {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  sharedKey,
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  const resolved = useResolvedMessages(messages, sharedKey);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="conv-empty">
        <span className="conv-empty__title">Say hello</span>
        <p className="conv-empty__desc">
          No messages yet. Anything you send is end-to-end encrypted with this contact.
        </p>
      </div>
    );
  }

  return (
    <div className="messages" aria-live="polite">
      <div className="messages__inner">
        {messages.map((m, i) => {
          const isOut = m.senderId === currentUserId;
          const r = resolved[i] ?? { text: m.content, decrypted: !m.isEncrypted };
          const prev = messages[i - 1];
          const showDay =
            !prev ||
            new Date(prev.timestamp).toDateString() !==
              new Date(m.timestamp).toDateString();
          return (
            <React.Fragment key={m.id ?? `${m.senderId}-${m.timestamp}-${i}`}>
              {showDay && <div className="messages__day">{formatDay(m.timestamp)}</div>}
              <div className={`msg ${isOut ? 'msg--out' : 'msg--in'}`}>
                <div className="bubble">
                  {m.isEncrypted && !r.decrypted ? (
                    <span className="bubble--encrypted">
                      <Icon name="lock" size={14} />
                      Encrypted message
                    </span>
                  ) : (
                    r.text
                  )}
                </div>
                <div className="msg__meta">
                  {isOut && (
                    <span
                      className={m.status === 'read' ? 'check read' : 'check'}
                      aria-label={m.status ?? 'sent'}
                    >
                      {m.status === 'sent' && <Icon name="check" size={12} />}
                      {m.status === 'delivered' && (
                        <Icon name="check-double" size={12} />
                      )}
                      {m.status === 'read' && (
                        <Icon name="check-double" size={12} />
                      )}
                    </span>
                  )}
                  <span>{formatTime(m.timestamp)}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default MessageList;