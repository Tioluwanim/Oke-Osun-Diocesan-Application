'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { NAV_LINKS } from './nav-links';

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setOpen(false);
    setGroupsOpen(false);
    buttonRef.current?.focus();
  }

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
        className="mobile-menu-trigger flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition-all duration-200 hover:border-gold/60 hover:bg-white/10 hover:text-gold focus-visible:outline-none"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-navy/75 backdrop-blur-sm"
            onClick={closeMenu}
          />

          <div
            id="mobile-nav-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className="mobile-menu-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-white/10 bg-navy p-5 pb-8 shadow-[0_0_50px_rgba(0,0,0,0.4)] animate-[slide-in-right_300ms_cubic-bezier(0.22,1,0.36,1)] sm:p-7"
          >
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-3">
                <Image src="/images/logo-transparent.png" alt="" width={42} height={42} className="h-10 w-10 object-contain" />
                <span className="font-display text-lg leading-tight text-white">Oke-Osun<br />Diocese</span>
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white transition-colors duration-200 hover:border-gold/60 hover:bg-white/10 hover:text-gold"
                aria-label="Close menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="flex-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-gold">Explore the Diocese</p>
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    {'children' in link && link.children ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
                        <button
                          type="button"
                          onClick={() => setGroupsOpen((v) => !v)}
                          aria-expanded={groupsOpen}
                          className="flex min-h-[54px] w-full items-center justify-between rounded-2xl px-4 text-left text-base font-medium text-white transition-colors duration-200 hover:text-gold"
                        >
                          <span className="font-medium">{link.label}</span>
                          <span aria-hidden="true" className={`flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 text-lg leading-none text-gold transition-transform ${groupsOpen ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        {groupsOpen && (
                          <ul className="border-t border-white/10 px-3 pb-3 pt-2">
                            <li>
                              <Link href={link.href} onClick={closeMenu} className="flex min-h-[42px] items-center rounded-xl px-3 text-sm font-semibold text-gold transition-colors hover:bg-white/10">View all groups</Link>
                            </li>
                            {link.children.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={closeMenu}
                                  className="flex min-h-[42px] items-center rounded-xl px-3 text-sm text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-gold"
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
                        onClick={closeMenu}
                        className="mobile-nav-link flex min-h-[54px] items-center rounded-2xl border border-transparent px-4 text-base text-white transition-colors duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-gold"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8 border-t border-white/10 pt-5">
              <Link href="/support" onClick={closeMenu} className="btn-primary flex w-full">Support the Diocese</Link>
              <p className="mt-3 text-center text-xs leading-relaxed text-white/45">Serving Christ through worship, mission, and compassionate service.</p>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
