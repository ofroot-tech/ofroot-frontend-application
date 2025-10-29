'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import ResourceHealth from './ResourceHealth';

export default function Footer() {
  const isProd = process.env.NODE_ENV === 'production';
  const [showHealth, setShowHealth] = useState<boolean>(() => !isProd);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('ofroot.showHealth') : null;
      if (stored !== null) {
        setShowHealth(stored === 'true');
      }
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const toggleShowHealth = () => {
    try {
      const next = !showHealth;
      setShowHealth(next);
      if (typeof window !== 'undefined') localStorage.setItem('ofroot.showHealth', String(next));
    } catch (e) {
      console.warn('Failed to persist health visibility preference', e);
      setShowHealth((s) => !s);
    }
  };

  return (
    <footer className="w-full p-0 bg-black text-white animate-fade-in shadow-2xl">
      <div className="w-full h-1.5 bg-gradient-to-r from-[#20b2aa] via-[#1a8f85] to-[#20b2aa]" aria-hidden="true" />
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between py-10 px-6 gap-8">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3 mb-4">
            <Image src="/ofroot-logo.png" alt="OfRoot Logo" width={40} height={40} className="rounded-full shadow-lg" />
            <span className="font-extrabold text-2xl tracking-tight">ofroot</span>
          </div>
          <ul className="flex flex-wrap gap-4 text-base font-medium">
            <li>
              <a href="/" className="hover:underline hover:text-[#ffe082] transition">Home</a>
            </li>
            <li>
              <a href="/marketing" className="hover:underline hover:text-[#ffe082] transition">Marketing</a>
            </li>
            <li>
              <a href="#" onClick={e => {e.preventDefault(); window.open('https://form.jotform.com/252643454932157', '_blank');}} className="hover:underline hover:text-[#ffe082] transition">Helpr</a>
            </li>
            <li>
              <a href="/ontask" className="hover:underline hover:text-[#ffe082] transition">OnTask</a>
            </li>
            <li>
              <a href="https://form.jotform.com/252643454932157" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#ffe082] transition">Waitlist</a>
            </li>
            <li>
              <a href="#" onClick={e => {e.preventDefault(); window.open('https://form.jotform.com/252643426225151', '_blank');}} className="hover:underline hover:text-[#ffe082] transition">Contact</a>
            </li>
          </ul>
        </div>
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex items-center gap-4 text-2xl">
            <a href="#" aria-label="Facebook" className="hover:text-[#ffe082] transition scale-110">📘</a>
            <a href="#" aria-label="Twitter" className="hover:text-[#ffe082] transition scale-110">🐦</a>
            <a href="https://www.linkedin.com/company/106671711/admin/dashboard/" aria-label="OfRoot on LinkedIn" target="_blank" rel="noopener noreferrer" className="hover:text-[#ffe082] transition scale-110">💼</a>
          </div>
          <div className="text-xs opacity-80 font-light tracking-wide">
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> OfRoot. All rights reserved.
          </div>
        </div>
      </div>
      <div className="w-full h-2 bg-gradient-to-r from-[#ffe082] via-[#20b2aa] to-[#1a8f85] animate-gradient-move" />
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient-move {
          background-size: 200% 100%;
          animation: gradientMove 3s linear infinite;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </footer>
  );
}
