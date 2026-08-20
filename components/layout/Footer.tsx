import Link from 'next/link';
import Image from 'next/image';

const QUICK_LINKS = [
  { label: 'Groups', href: '/groups' },
  { label: 'Events', href: '/events' },
  { label: 'Sermons', href: '/sermons' },
  { label: 'Support & Giving', href: '/support' },
  { label: 'Contact', href: '/contact' },
];

const SOCIAL = [
  { label: 'Facebook', href: '#' },
  { label: 'YouTube', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'X (Twitter)', href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-navy-darker bg-navy text-white/85">
      <div className="container-diocese grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Image src="/images/logo-transparent.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
            <span className="font-display text-lg text-white">Oke-Osun Diocese</span>
          </div>
          <p className="text-base leading-relaxed">
            Oke-Osun Diocese is part of the Church of Nigeria (Anglican Communion), committed to
            proclaiming the Gospel of Jesus Christ through worship, evangelism, discipleship and
            community service.
          </p>
          <ul className="mt-4 flex gap-3">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-white/25 hover:border-gold hover:text-gold"
                >
                  {s.label.charAt(0)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-base font-semibold text-white">Quick Links</h2>
          <ul className="space-y-2 text-base">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-base font-semibold text-white">Contact</h2>
          <ul className="space-y-2 text-base">
            <li>Bishop Court, Osogbo Road, Gbongan, Osun State, Nigeria</li>
            <li>
              <a href="tel:+2340000000000" className="hover:text-gold">+234 000 000 0000</a>
            </li>
            <li>
              <a href="mailto:info@okeosundiocese.org" className="hover:text-gold">info@okeosundiocese.org</a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-base font-semibold text-white">Service Times</h2>
          <ul className="space-y-2 text-base">
            <li>Sunday Holy Communion — 8:00 AM</li>
            <li>Sunday Second Service — 10:00 AM</li>
            <li>Wednesday Bible Study — 5:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="container-diocese text-center text-base text-white/60">
          © {new Date().getFullYear()} Diocese of Oke-Osun (Church of Nigeria, Anglican Communion). All rights reserved.
        </p>
      </div>
    </footer>
  );
}
