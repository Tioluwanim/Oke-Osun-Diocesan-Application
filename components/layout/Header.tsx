'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileNavigation from './MobileNavigation';
import { NAV_LINKS } from './nav-links';

export default function Header() {
  const [groupsOpen, setGroupsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-navy shadow-diocese">
      <div className="container-diocese flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/images/logo.png" alt="Oke-Osun Diocese logo" width={48} height={48} priority className="h-12 w-12 object-contain" />
          <span className="font-display text-lg leading-tight text-white sm:text-xl">
            Diocese of<br className="sm:hidden" /> Oke-Osun
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="relative">
                {'children' in link && link.children ? (
                  <div
                    onMouseEnter={() => setGroupsOpen(true)}
                    onMouseLeave={() => setGroupsOpen(false)}
                  >
                    <button
                      type="button"
                      className="flex min-h-[48px] items-center gap-1 rounded-full px-3 text-sm font-medium text-white/90 hover:text-gold"
                      aria-expanded={groupsOpen}
                      aria-haspopup="true"
                      onClick={() => setGroupsOpen((v) => !v)}
                    >
                      {link.label}
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" />
                      </svg>
                    </button>
                    {groupsOpen && (
                      <ul className="absolute left-0 top-full min-w-[240px] rounded-card border border-line bg-white py-2 shadow-diocese">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="flex min-h-[48px] items-center px-4 text-sm text-navy hover:bg-cream hover:text-blue"
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
                    className="flex min-h-[48px] items-center rounded-full px-3 text-sm font-medium text-white/90 hover:text-gold"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <MobileNavigation />
      </div>
    </header>
  );
}
