'use client';

import { useState } from 'react';
import { BookOpen, Check, Code2, Headphones, Send, Users } from 'lucide-react';
import { track } from '@/app/lib/ab';

const workspaces = [
  { name: 'Company', icon: BookOpen },
  { name: 'Engineering', icon: Code2 },
  { name: 'Sales', icon: Users },
  { name: 'Support', icon: Headphones },
];

export default function PrivateAiDemo() {
  const [active, setActive] = useState('Company');
  const [asked, setAsked] = useState(false);
  const ask = () => {
    setAsked(true);
    track({ category: 'demo', action: 'demo_question_asked', label: active.toLowerCase(), meta: { path: '/demo/private-ai' } });
  };
  return <div className="overflow-hidden rounded-3xl border border-slate-700 bg-[#0b172b] shadow-2xl">
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs text-slate-400"><span>OfRoot Company AI</span><span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 font-semibold text-amber-200">Demo data only</span></div>
    <div className="grid min-h-[560px] md:grid-cols-[220px_1fr]">
      <aside className="border-b border-white/10 p-4 md:border-b-0 md:border-r" aria-label="Demo workspaces"><p className="mb-3 px-3 text-xs font-bold uppercase tracking-[.14em] text-slate-500">Workspaces</p><div className="grid grid-cols-2 gap-2 md:grid-cols-1">{workspaces.map(({ name, icon: Icon }) => <button type="button" key={name} onClick={() => { setActive(name); setAsked(false); }} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active === name ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`} aria-pressed={active === name}><Icon className="h-4 w-4" />{name}</button>)}</div></aside>
      <section className="flex flex-col p-5 sm:p-8" aria-live="polite">
        <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#FFC46B]">{active} workspace</p><h2 className="mt-2 text-2xl font-bold text-white">Ask approved company knowledge</h2></div>
        <div className="flex-1 space-y-5">
          <div className="ml-auto max-w-xl rounded-2xl rounded-br-sm bg-[#FF9312] p-4 text-sm font-semibold text-slate-950">How does enterprise onboarding work?</div>
          {asked ? <div className="max-w-2xl rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 p-5 text-slate-200"><p>The onboarding process has four controlled stages: discovery, security review, migration, and launch. Each stage has an assigned owner and a completion check before work moves forward.</p><ol className="mt-4 space-y-2 text-sm">{['Discovery confirms goals, systems, and success measures.', 'Security review documents sources, permissions, and risks.', 'Migration connects approved knowledge and validates access.', 'Launch begins with a measured pilot and an adoption review.'].map(item => <li key={item} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-[#37FFE0]" />{item}</li>)}</ol><div className="mt-5 border-t border-white/10 pt-4"><p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-slate-500">Sources</p><div className="flex flex-wrap gap-2">{['Customer Launch Guide', 'Enterprise Onboarding SOP', 'Security Review Checklist'].map(source => <span key={source} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{source}</span>)}</div></div></div> : <button type="button" onClick={ask} className="mx-auto mt-16 flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"><Send className="h-4 w-4" />Run simulated answer</button>}
        </div>
        <p className="mt-8 text-center text-xs text-slate-500">This simulation uses fixed fictional content. It does not call an AI provider or connect to company data.</p>
      </section>
    </div>
  </div>;
}
