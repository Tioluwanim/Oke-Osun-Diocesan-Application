'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { NAV_LINKS } from './nav-links';

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Lock background scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape-to-close and basic focus handling.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
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
        className="flex min-h-[48px] min-w-[48px] items-center justify-center gap-2 rounded-full border border-white/30 px-4 text-white"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-semibold">Menu</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-navy/70"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-navy p-6 shadow-diocese animate-fade-up"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-lg text-white">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-white"
                aria-label="Close menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobile">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    {'children' in link && link.children ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => setGroupsOpen((v) => !v)}
                          aria-expanded={groupsOpen}
                          className="flex min-h-[48px] w-full items-center justify-between rounded-lg px-3 text-left text-white"
                        >
                          <span>{link.label}</span>
                          <span aria-hidden="true">{groupsOpen ? '−' : '+'}</span>
                        </button>
                        {groupsOpen && (
                          <ul className="ml-4 border-l border-white/20 pl-4">
                            {link.children.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={() => setOpen(false)}
                                  className="flex min-h-[48px] items-center text-white/85 hover:text-gold"
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
                        className="flex min-h-[48px] items-center rounded-lg px-3 text-white hover:text-gold"
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
