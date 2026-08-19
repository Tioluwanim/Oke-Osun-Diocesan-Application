'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileNavigation from './MobileNavigation';
import { NAV_LINKS } from './nav-links';

export default function Header() {
  const [groupsOpen, setGroupsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/85 backdrop-blur-xl shadow-[0_16px_32px_rgba(4,21,45,0.18)]">
      <div className="container-diocese flex h-20 items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition-transform duration-200 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-white/10">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
            <Image src="/images/logo.png" alt="Oke-Osun Diocese logo" width={36} height={36} priority className="h-8 w-8 object-contain" />
          </div>
          <span className="font-display text-sm leading-tight text-white sm:text-base lg:text-lg">
            Diocese of<br className="sm:hidden" /> Oke-Osun
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1.5 shadow-inner shadow-white/5 backdrop-blur-md">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="relative">
                {'children' in link && link.children ? (
                  <div
                    onMouseEnter={() => setGroupsOpen(true)}
                    onMouseLeave={() => setGroupsOpen(false)}
                    className="relative"
                  >
                    <button
                      type="button"
                      className="flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-medium text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-gold"
                      aria-expanded={groupsOpen}
                      aria-haspopup="true"
                      onClick={() => setGroupsOpen((v) => !v)}
                    >
                      {link.label}
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="transition-transform duration-200">
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" />
                      </svg>
                    </button>
                    {groupsOpen && (
                      <ul className="absolute left-0 top-[calc(100%+12px)] min-w-[260px] rounded-2xl border border-line bg-white p-2 shadow-diocese">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="flex min-h-[44px] items-center rounded-xl px-3 text-sm text-navy transition-colors duration-200 hover:bg-cream hover:text-blue"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="flex min-h-[44px] items-center rounded-full px-3 text-sm font-medium text-white/90 transition-colors duration-200 hover:bg-white/10 hover:text-gold"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/give" className="hidden sm:inline-flex min-h-[44px] items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-navy transition-all duration-200 hover:bg-gold-light hover:shadow-[0_8px_20px_rgba(201,162,39,0.25)]">
            Give
          </Link>
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
