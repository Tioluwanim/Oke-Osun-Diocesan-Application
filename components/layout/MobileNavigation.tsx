'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { NAV_LINKS } from './nav-links';

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = open ? 'hidden' : previousOverflow;
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all duration-200 hover:border-gold/60 hover:text-gold focus-visible:outline-none"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-navy/75 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div
            id="mobile-nav-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col overflow-y-auto border-l border-white/10 bg-navy/95 p-5 pb-10 shadow-[0_0_50px_rgba(0,0,0,0.35)] animate-[slide-in-right_240ms_cubic-bezier(0.22,1,0.36,1)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-xl text-white">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-200 hover:border-gold/60 hover:text-gold"
                aria-label="Close menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1">
              <ul className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    {'children' in link && link.children ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5">
                        <button
                          type="button"
                          onClick={() => setGroupsOpen((v) => !v)}
                          aria-expanded={groupsOpen}
                          className="flex min-h-[48px] w-full items-center justify-between rounded-2xl px-3 text-left text-white transition-colors duration-200 hover:text-gold"
                        >
                          <span className="font-medium">{link.label}</span>
                          <span aria-hidden="true" className="text-lg text-gold">{groupsOpen ? '−' : '+'}</span>
                        </button>
                        {groupsOpen && (
                          <ul className="border-t border-white/10 px-3 pb-2 pt-2">
                            {link.children.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={() => setOpen(false)}
                                  className="flex min-h-[44px] items-center rounded-xl px-2 text-sm text-white/80 transition-colors duration-200 hover:bg-white/5 hover:text-gold"
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
                        onClick={() => setOpen(false)}
                        className="flex min-h-[48px] items-center rounded-2xl px-3 text-white transition-colors duration-200 hover:bg-white/5 hover:text-gold"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
