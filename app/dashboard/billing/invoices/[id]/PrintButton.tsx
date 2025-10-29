"use client";

import React from 'react';

export default function PrintButton({ id }: { id: number }) {
  return (
    <button
      className="text-xs rounded border border-gray-300 px-2 py-1 hover:border-black"
      onClick={async () => {
        const url = `/dashboard/billing/invoices/${id}/print`;
        const w = window.open(url, '_blank');
        if (w) {
          setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 600);
        } else {
          window.location.href = url;
        }
      }}
    >
      Print / Download
    </button>
  );
}
