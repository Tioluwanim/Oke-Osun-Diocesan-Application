import Image from 'next/image';
import Link from 'next/link';

const HOME_NEWS = [
  {
    id: 'home-synod',
    date: '25',
    month: 'JUL',
    image: '/images/hero4.png',
    category: 'News',
    title: 'Diocesan Synod 2026',
    summary: 'Join clergy and laity for our annual Diocesan Synod as we pray, plan, and strengthen our mission together.',
    href: '/news',
  },
  {
    id: 'home-youth',
    date: '12',
    month: 'AUG',
    image: '/images/events.png',
    category: 'Event',
    title: 'Youth Convention',
    summary: 'A life-transforming gathering of young people with worship, Bible study, leadership training, and fellowship.',
    href: '/events',
  },
  {
    id: 'home-women',
    date: '18',
    month: 'SEP',
    image: '/images/news3.png',
    category: 'Conference',
    title: 'Women’s Conference',
    summary: 'Empowering women through biblical teaching, fellowship, worship, and community outreach.',
    href: '/events',
  },
];

export default function NewsHighlights() {
  return (
    <section className="section bg-white">
      <div className="container-diocese">
        <div className="mb-8 text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Latest Updates</p>
          <h2 className="mt-3">News &amp; Upcoming Events</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_NEWS.map((item) => (
            <article key={item.id} className="card overflow-hidden">
              <div className="relative h-48 w-full">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy">
                  {item.date}
                  <span className="ml-1">{item.month}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
                  <span>{item.category}</span>
                </div>
                <h3 className="text-xl">{item.title}</h3>
                <p className="mt-3 text-sm text-ink-muted">{item.summary}</p>
                <Link href={item.href} className="mt-4 inline-flex font-semibold text-blue hover:text-gold">
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
