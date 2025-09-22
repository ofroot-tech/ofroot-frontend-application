'use client';
import { useEffect, useState } from 'react';

export default function ResourceHealth() {
  const [health, setHealth] = useState<Record<string, string>>(() => (typeof window !== 'undefined' ? (window as any).__OFROOT_HEALTH || {} : {}));

  useEffect(() => {
    const onUpdate = (ev: Event) => {
      const detail = (ev as CustomEvent)?.detail as { resource: string; status: string } | undefined;
      if (detail) {
        setHealth((h) => ({ ...h, [detail.resource]: detail.status }));
      } else {
        // read global snapshot
        setHealth((window as any).__OFROOT_HEALTH || {});
      }
    };

    window.addEventListener('ofroot:healthupdate', onUpdate as EventListener);
    return () => window.removeEventListener('ofroot:healthupdate', onUpdate as EventListener);
  }, []);

  const renderBadge = (key: string) => {
    const status = health[key];
    if (status === 'ok') return <span className="text-green-600">●</span>;
    if (status === 'loading') return <span className="text-yellow-500">●</span>;
    if (status === 'failed') return <span className="text-red-600">●</span>;
    return <span className="text-gray-400">●</span>;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-gray-500">External</div>
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">{renderBadge('vanta')}<span className="hidden sm:inline">Vanta</span></div>
        <div className="flex items-center gap-1">{renderBadge('calendly')}<span className="hidden sm:inline">Calendly</span></div>
      </div>
    </div>
  );
}
