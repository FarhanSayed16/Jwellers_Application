'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { CHAT_CANNED_REPLIES } from '@/lib/chatCannedReplies';

export type ChatThread = {
  id: string;
  customerId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  subject: string | null;
  itemId: string | null;
  itemSku?: string | null;
  itemTitle?: string | null;
  status: 'open' | 'pending_customer' | 'pending_staff' | 'closed';
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCustomer: number;
  unreadStaff: number;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  senderType: 'customer' | 'staff';
  senderId: string;
  body: string | null;
  attachmentUrls: string[];
  sentAt: string;
};

const STATUSES: ChatThread['status'][] = [
  'open',
  'pending_customer',
  'pending_staff',
  'closed',
];

export function ChatInbox({ initialThreadId }: { initialThreadId?: string }) {
  const router = useRouter();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | undefined>(initialThreadId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [attachUrl, setAttachUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => threads.find((t) => t.id === selectedId) ?? null,
    [threads, selectedId],
  );

  const loadThreads = useCallback(async () => {
    try {
      const q = statusFilter ? `?status=${statusFilter}` : '';
      const data = await api.get<{ threads: ChatThread[] }>(`/admin/chat/threads${q}`);
      setThreads(data.threads);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Failed to load threads');
    }
  }, [statusFilter]);

  const loadMessages = useCallback(async (threadId: string) => {
    try {
      const data = await api.get<{ messages: ChatMessage[] }>(
        `/chat/threads/${threadId}/messages?limit=100`,
      );
      setMessages(data.messages);
      await api.post(`/chat/threads/${threadId}/read`, {});
      setError(null);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Failed to load messages');
    }
  }, []);

  useEffect(() => {
    void loadThreads();
    const id = window.setInterval(() => void loadThreads(), 8000);
    return () => window.clearInterval(id);
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    void loadMessages(selectedId);
    const id = window.setInterval(() => void loadMessages(selectedId), 5000);
    return () => window.clearInterval(id);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!selectedId || (!draft.trim() && !attachUrl.trim())) return;
    setSending(true);
    try {
      const attachmentUrls = attachUrl.trim() ? [attachUrl.trim()] : [];
      await api.post(`/chat/threads/${selectedId}/messages`, {
        body: draft.trim() || null,
        attachmentUrls,
        clientMessageId: `admin-${crypto.randomUUID()}`,
      });
      setDraft('');
      setAttachUrl('');
      await loadMessages(selectedId);
      await loadThreads();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Send failed');
    } finally {
      setSending(false);
    }
  }

  async function patchStatus(status: ChatThread['status']) {
    if (!selectedId) return;
    try {
      await api.patch(`/chat/threads/${selectedId}`, { status });
      await loadThreads();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Status update failed');
    }
  }

  return (
    <div className="grid min-h-[70vh] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-[var(--color-border)] lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] p-3">
          <select
            className="w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded px-2 py-1 text-sm text-[var(--color-primary)]"
            onClick={() => void loadThreads()}
          >
            Refresh
          </button>
        </div>
        <ul className="max-h-[40vh] overflow-y-auto lg:max-h-[calc(70vh-52px)]">
          {threads.map((t) => {
            const active = t.id === selectedId;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  className={[
                    'flex w-full flex-col gap-0.5 border-b border-[var(--color-border)] px-3 py-3 text-left text-sm',
                    active ? 'bg-[var(--color-background)]' : 'hover:bg-[var(--color-background)]',
                  ].join(' ')}
                  onClick={() => {
                    setSelectedId(t.id);
                    router.replace(`/chat/${t.id}`);
                  }}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {t.customerName || t.customerPhone || 'Customer'}
                    </span>
                    {t.unreadStaff > 0 && (
                      <span className="rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] text-white">
                        {t.unreadStaff}
                      </span>
                    )}
                  </span>
                  <span className="truncate text-xs text-[var(--color-text-secondary)]">
                    {t.itemSku ? `${t.itemSku} · ` : ''}
                    {t.lastMessagePreview || t.subject || 'No messages'}
                  </span>
                </button>
              </li>
            );
          })}
          {threads.length === 0 && (
            <li className="p-4 text-sm text-[var(--color-text-secondary)]">No threads yet.</li>
          )}
        </ul>
      </aside>

      <section className="flex min-h-[50vh] flex-col">
        {error && (
          <p className="border-b border-[var(--color-border)] bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {!selected ? (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-[var(--color-text-secondary)]">
            Select a conversation
          </div>
        ) : (
          <>
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
              <div>
                <p className="font-medium">
                  {selected.customerName || selected.customerPhone || 'Customer'}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {selected.itemTitle || selected.subject || 'General'}
                  {selected.itemSku ? ` · ${selected.itemSku}` : ''}
                </p>
              </div>
              <select
                className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                value={selected.status}
                onChange={(e) => void patchStatus(e.target.value as ChatThread['status'])}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => {
                const mine = m.senderType === 'staff';
                return (
                  <div
                    key={m.id}
                    className={['flex', mine ? 'justify-end' : 'justify-start'].join(' ')}
                  >
                    <div
                      className={[
                        'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                        mine
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-background)] text-[var(--color-text-primary)]',
                      ].join(' ')}
                    >
                      {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
                      {m.attachmentUrls?.map((url) => (
                        <Link
                          key={url}
                          href={url}
                          target="_blank"
                          className={mine ? 'underline' : 'text-[var(--color-primary)] underline'}
                        >
                          Attachment
                        </Link>
                      ))}
                      <p className={['mt-1 text-[10px] opacity-70', mine ? '' : ''].join(' ')}>
                        {new Date(m.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <footer className="border-t border-[var(--color-border)] p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {CHAT_CANNED_REPLIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    onClick={() =>
                      setDraft((prev) => (prev.trim() ? `${prev.trim()}\n\n${c.body}` : c.body))
                    }
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="mb-2">
                <input
                  className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
                  placeholder="Attachment URL (optional HTTPS)"
                  value={attachUrl}
                  onChange={(e) => setAttachUrl(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <textarea
                  className="min-h-[72px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
                  placeholder="Reply…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => void send()}
                  className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Send
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
