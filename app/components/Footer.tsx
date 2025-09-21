import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full flex flex-col items-center gap-4 p-8">
      <p className="text-sm text-gray-700">Follow us for the latest updates</p>
      <div className="flex items-center gap-4 text-2xl">
        <a href="#" aria-label="Facebook" className="text-[#20b2aa] hover:text-[#1a8f85]">
          📘
        </a>
        <a href="#" aria-label="Twitter" className="text-[#20b2aa] hover:text-[#1a8f85]">
          🐦
        </a>
        <a href="#" aria-label="LinkedIn" className="text-[#20b2aa] hover:text-[#1a8f85]">
          💼
        </a>
      </div>
      <div className="text-xs text-gray-500 mt-2">© ofroot 2025</div>
    </footer>
  );
}
