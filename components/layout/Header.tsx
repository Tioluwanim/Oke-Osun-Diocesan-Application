'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileNavigation from './MobileNavigation';
import { NAV_LINKS } from './nav-links';

export default function Header() {
  const [groupsOpen, setGroupsOpen] = useState(false);
  const primaryLinks = NAV_LINKS.filter((link) => ['Home', 'About', 'Bishop', 'Events', 'Programs & Registration', 'Contact'].includes(link.label));
  const moreLinks = NAV_LINKS.filter((link) => !primaryLinks.includes(link));

  return (
    <header className="site-header sticky top-0 z-50 border-b border-white/10 bg-navy/90 backdrop-blur-xl">
      <div className="container-diocese flex h-20 items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-3 py-2 transition-transform duration-300 hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center">
            <Image src="/images/logo-transparent.png" alt="Oke-Osun Diocese logo" width={48} height={48} priority className="h-11 w-11 object-contain" />
          </div>
          <span className="font-display text-base leading-tight text-white sm:text-lg lg:text-xl">
            Diocese of<br className="sm:hidden" /> Oke-Osun
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1.5 shadow-inner shadow-white/5 backdrop-blur-md">
            {primaryLinks.map((link) => (
              <li key={link.href} className="relative">
                <Link href={link.href} className="nav-link flex min-h-[48px] items-center rounded-full px-4 text-base font-medium text-white/90 hover:bg-white/10 hover:text-gold">{link.label}</Link>
              </li>
            ))}
            <li className="relative">
              <button type="button" onClick={() => setGroupsOpen((value) => !value)} aria-expanded={groupsOpen} aria-haspopup="menu" className="nav-link flex min-h-[48px] items-center gap-2 rounded-full px-4 text-base font-medium text-white/90 hover:bg-white/10 hover:text-gold">
                More <span aria-hidden="true" className={`transition-transform ${groupsOpen ? 'rotate-180' : ''}`}>⌄</span>
              </button>
              {groupsOpen && <ul role="menu" className="absolute right-0 top-[calc(100%+10px)] grid min-w-[230px] gap-1 rounded-2xl border border-line bg-white p-2 shadow-diocese">
                {moreLinks.map((link) => <li key={link.href} role="none"><Link role="menuitem" href={link.href} onClick={() => setGroupsOpen(false)} className="flex min-h-[48px] items-center rounded-xl px-4 text-base text-navy transition-colors hover:bg-cream hover:text-blue">{link.label}</Link></li>)}
              </ul>}
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/support" className="hidden sm:inline-flex min-h-[48px] items-center justify-center rounded-full bg-gold px-5 text-base font-semibold text-navy transition-all duration-200 hover:bg-gold-light hover:shadow-[0_8px_20px_rgba(201,162,39,0.25)]">
            Support
          </Link>
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
