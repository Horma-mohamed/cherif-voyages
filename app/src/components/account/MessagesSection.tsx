'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Message } from '@prisma/client';

export default function MessagesSection({ initialMessages }: { initialMessages: Message[] }) {
  const t = useTranslations('Account.msg');
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  async function send() {
    if (!draft.trim()) return;
    setSending(true);
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: draft })
    });
    const data = await res.json();
    if (res.ok) {
      setMessages((prev) => [...prev, data.message]);
      setDraft('');
    }
    setSending(false);
  }

  return (
    <div>
      <h2 className="mb-4 text-[22px]">{t('title')}</h2>
      <div className="flex min-h-[340px] flex-col gap-3.5 border-2 border-[var(--color-divider)] p-5">
        {messages.length === 0 && <p className="text-[14px] text-[rgba(15,17,21,0.6)]">{t('none')}</p>}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[70%] p-2.75 text-[13px] ${
              m.fromAdmin
                ? 'self-start border border-[var(--color-divider)]'
                : 'self-end bg-[var(--color-accent)] text-white'
            }`}
          >
            <strong className={`mb-0.5 block text-[11px] ${m.fromAdmin ? 'text-[rgba(15,17,21,0.55)]' : 'text-white/65'}`}>
              {m.fromAdmin ? t('agency') : t('you')}
            </strong>
            {m.body}
          </div>
        ))}
        <div className="mt-auto flex flex-wrap gap-2.5">
          <input
            className="input flex-[1_1_220px] bg-white"
            placeholder={t('placeholder')}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            disabled={sending}
            className="cursor-pointer border-0 bg-[var(--color-accent)] px-4.5 py-2.5 font-sans text-[13px] font-extrabold text-white disabled:opacity-60"
          >
            {t('send')}
          </button>
        </div>
      </div>
    </div>
  );
}
