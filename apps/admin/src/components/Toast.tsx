'use client';

import { useEffect, useState } from 'react';

type ToastKind = 'success' | 'error' | 'info';

type ToastPayload = { message: string; kind?: ToastKind; id: number };

let pushToastImpl: ((message: string, kind?: ToastKind) => void) | null = null;

/** Call from any client component after save/create actions. */
export function showToast(message: string, kind: ToastKind = 'success') {
  pushToastImpl?.(message, kind);
}

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);

  useEffect(() => {
    pushToastImpl = (message, kind = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { message, kind, id }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => {
      pushToastImpl = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto rounded border px-3 py-2 text-sm shadow ${
            t.kind === 'error'
              ? 'border-red-200 bg-red-50 text-[var(--color-error,#C62828)]'
              : t.kind === 'info'
                ? 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)]'
                : 'border-green-200 bg-green-50 text-[var(--color-success,#2E7D32)]'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
