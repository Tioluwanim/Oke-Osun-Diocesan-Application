import Link from 'next/link';

export default function LandingLinks() {
  return (
    <section className="section bg-white">
      <div className="container-diocese">
        <div className="mb-8 text-left">
          <p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">Get Involved</p>
          <h2 className="mt-3">A Diocese Rooted in Faith and Service</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Prayer', href: '/prayer', blurb: 'Join our diocesan prayer network and requests.' },
            { title: 'Ministries', href: '/ministries', blurb: 'Explore the ministries active across the Diocese.' },
            { title: 'Events & Programs', href: '/events', blurb: 'Find diocesan events and register for programs.' },
            { title: 'Groups', href: '/groups', blurb: 'Women\'s Organization, AYF, and more.' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="card flex flex-col gap-2 p-6">
              <h3 className="text-lg">{item.title}</h3>
              <p className="text-base text-ink-muted">{item.blurb}</p>
              <span className="mt-auto pt-2 font-semibold text-blue">Learn more →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
