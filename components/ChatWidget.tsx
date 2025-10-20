"use client";

import { useEffect, useState } from 'react';
import { toast } from '@/components/Toaster';

type ChatMessage = {
  id: string;
  from: 'user' | 'ofroot';
  text: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'hello',
      from: 'ofroot',
      text: 'Hey there! Ask anything about setup, automations, or pricing and a teammate will respond.',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  // Live region text for screen readers; updated on assistant replies
  const [announcement, setAnnouncement] = useState('');

  const toggle = () => setOpen((v) => !v);
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    const handleToggle = () => setOpen((v) => !v);
    window.addEventListener('ofroot:chat-open', handleOpen);
    window.addEventListener('ofroot:chat-toggle', handleToggle);
    try {
      const saved = JSON.parse(localStorage.getItem('ofroot_recent_chats_v1') || '[]');
      if (Array.isArray(saved)) setRecent(saved.slice(0, 10));
    } catch {}
    return () => {
      window.removeEventListener('ofroot:chat-open', handleOpen);
      window.removeEventListener('ofroot:chat-toggle', handleToggle);
    };
  }, []);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = { id: Date.now().toString(36), from: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    // store in recent list (front-end only, $0 infra)
    try {
      const next = [trimmed, ...recent.filter((t) => t !== trimmed)].slice(0, 10);
      setRecent(next);
      localStorage.setItem('ofroot_recent_chats_v1', JSON.stringify(next));
    } catch {}
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error?.message || 'Unable to reach the chat service');
      }
      const replyText = json?.data?.reply || 'Thanks for reaching out—we will reply soon!';
      setMessages((prev) => [
        ...prev,
        { id: `${userMessage.id}-reply`, from: 'ofroot', text: replyText },
      ]);
      // Update live region so screen readers announce the new reply
      setAnnouncement(replyText);
    } catch (err: any) {
      toast({ type: 'error', title: 'Chat unavailable', message: err?.message || 'Please try again in a moment.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-14 right-4 z-[9000] flex flex-col items-end gap-3">
      {/* ARIA live region: polite announcements for assistant replies */}
      <div aria-live="polite" aria-atomic="true" role="status" className="sr-only">{announcement}</div>
      {open && (
        <div id="ofroot-chat-widget" className="w-80 max-w-[90vw] rounded-xl border border-gray-200 bg-white shadow-2xl" role="dialog" aria-modal="false" aria-label="OfRoot Assistant chat window">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">OfRoot Assistant</div>
              <div className="text-xs text-gray-500">We usually reply in under a day.</div>
            </div>
            <button
              type="button"
              onClick={toggle}
              className="text-gray-500 hover:text-gray-800"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          {recent.length > 0 && (
            <div className="border-b px-4 py-2">
              <div className="text-xs font-medium text-gray-600 mb-1">Recent messages</div>
              <ul className="space-y-1 max-h-24 overflow-auto pr-1">
                {recent.map((t, i) => (
                  <li key={`${i}-${t}`} className="group flex items-start gap-2 text-xs text-gray-700">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-300" />
                    <button
                      type="button"
                      onClick={() => setInput(t)}
                      className="text-left hover:underline line-clamp-2"
                      title={t}
                    >
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="max-h-72 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.from === 'user'
                    ? 'ml-auto max-w-[80%] rounded-lg bg-[#20b2aa] px-3 py-2 text-white'
                    : 'mr-auto max-w-[85%] rounded-lg bg-gray-100 px-3 py-2 text-gray-800'
                }
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="border-t px-3 py-2">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={sending ? 'Sending…' : 'Ask a question or request help'}
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#20b2aa] focus:outline-none focus:ring-2 focus:ring-[#20b2aa]"
              disabled={sending}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={sendMessage}
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-md bg-[#20b2aa] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1a8f85] disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-gray-800 border border-white"
        aria-expanded={open}
        aria-controls="ofroot-chat-widget"
      >
        {open ? 'Hide chat' : 'Chat with OfRoot'}
      </button>
    </div>
  );
}
