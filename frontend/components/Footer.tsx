'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  return (
    <footer className="border-t py-8 mt-auto bg-background/50 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} WakafChain. Data dijamin transparan oleh teknologi Blockchain.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
          <a href="#" className="hover:text-primary transition-colors">Privasi</a>
        </div>
      </div>
    </footer>
  );
}
