'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();

  // Don't show navbar on login page to keep it clean
  if (pathname === '/login') return null;

  const links = [
    { name: 'Dashboard', href: '/' },
    { name: 'Audit', href: '/audit' },
    { name: 'Admin', href: '/admin' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex h-16 items-center px-6 justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">Wakaf<span className="text-primary">Chain</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-primary relative py-5 ${
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.name}
                {pathname === link.href && (
                  <motion.div
                    className="absolute bottom-[0px] left-0 right-0 h-0.5 bg-primary"
                    layoutId="navbar-indicator"
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
