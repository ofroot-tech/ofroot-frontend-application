'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-2">
        <div className="flex items-center">
          <Image src="/ofroot-logo.png" alt="OfRoot" width={64} height={64} priority />
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#services" className="text-gray-700 hover:text-[#20b2aa]">Services</a>
          <a href="#featured" className="text-gray-700 hover:text-[#20b2aa]">Featured</a>
          <a href="#case-studies" className="text-gray-700 hover:text-[#20b2aa]">Case Studies</a>
          <a href="#how" className="text-gray-700 hover:text-[#20b2aa]">How</a>
          <a href="#proof" className="text-gray-700 hover:text-[#20b2aa]">Proof</a>
          <a href="#contact" className="bg-[#20b2aa] text-white py-2 px-4 rounded-full">Contact</a>
        </nav>

        <button
          className="md:hidden p-2 text-2xl"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="flex flex-col p-3 gap-3 max-w-6xl mx-auto">
            <a href="#services" onClick={() => setOpen(false)} className="text-gray-700">Services</a>
            <a href="#featured" onClick={() => setOpen(false)} className="text-gray-700">Featured</a>
            <a href="#case-studies" onClick={() => setOpen(false)} className="text-gray-700">Case Studies</a>
            <a href="#how" onClick={() => setOpen(false)} className="text-gray-700">How</a>
            <a href="#proof" onClick={() => setOpen(false)} className="text-gray-700">Proof</a>
            <a href="#contact" onClick={() => setOpen(false)} className="text-gray-700">Contact</a>
          </div>
        </div>
      )}
    </header>
  );
}
