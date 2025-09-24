'use client';
import '../components/Navbar';
import Navbar from '../components/Navbar';
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-20">
      <Navbar />  
      {children}
    </div>
  );
}
