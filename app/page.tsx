import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import EventCard from '@/components/cards/EventCard';
import NewsCard from '@/components/cards/NewsCard';
import SermonCard from '@/components/cards/SermonCard';
import EmptyState from '@/components/ui/EmptyState';
import { getEvents, getNews, getSermons } from '@/lib/api';

export default async function HomePage() {
  const [events, news, sermons] = await Promise.all([getEvents(), getNews(), getSermons()]);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-navy">
        <Image
          src="/images/hero1.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-10 object-cover opacity-40"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/70 via-navy/80 to-navy" />
        <div className="container-diocese flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
          <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Church of Nigeria — Anglican Communion
          </p>
          <h1 className="animate-fade-up text-white [animation-delay:80ms]">
            Diocese of Oke-Osun
          </h1>
          <p className="animate-fade-up max-w-2xl text-lg text-white/85 [animation-delay:160ms]">
            Proclaiming the Gospel of Jesus Christ through worship, evangelism, discipleship and
            community service across our archdeaconries and parishes.
          </p>
          <div className="animate-fade-up flex flex-wrap items-center justify-center gap-4 [animation-delay:240ms]">
            <Link href="/give" className="btn-primary">
              Give Online
            </Link>
            <Link href="/sermons" className="btn-outline">
              Watch Sermons
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="section bg-white">
        <div className="container-diocese">
          <SectionHeader eyebrow="Get Involved" title="A Diocese Rooted in Faith and Service" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Prayer', href: '/prayer', blurb: 'Join our diocesan prayer network and requests.' },
              { title: 'Ministries', href: '/ministries', blurb: 'Explore the ministries active across the Diocese.' },
              { title: 'Programs', href: '/programs', blurb: 'Register for retreats, camps, and conferences.' },
              { title: 'Groups', href: '/groups', blurb: 'Women\'s Organization, AYF, and more.' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="card flex flex-col gap-2 p-6">
                <h3 className="text-lg">{item.title}</h3>
                <p className="text-sm text-ink-muted">{item.blurb}</p>
                <span className="mt-auto pt-2 font-semibold text-blue">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="section bg-cream">
        <div className="container-diocese">
          <SectionHeader eyebrow="What's On" title="Upcoming Events" align="left" />
          {events.length === 0 ? (
            <EmptyState title="No upcoming events at the moment." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link href="/events" className="btn-secondary">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* LATEST SERMONS */}
      <section className="section bg-white">
        <div className="container-diocese">
          <SectionHeader eyebrow="Word & Worship" title="Latest Sermons" align="left" />
          {sermons.length === 0 ? (
            <EmptyState title="No sermons have been published yet." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sermons.slice(0, 3).map((sermon) => (
                <SermonCard key={sermon.id} sermon={sermon} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link href="/sermons" className="btn-secondary">
              Browse All Sermons
            </Link>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="section bg-cream">
        <div className="container-diocese">
          <SectionHeader eyebrow="Stay Informed" title="Diocesan News" align="left" />
          {news.length === 0 ? (
            <EmptyState title="No news has been published yet." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GIVING CTA */}
      <section className="bg-navy py-16 text-center text-white">
        <div className="container-diocese">
          <h2 className="text-white">Partner With Us in Ministry</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Your tithes, offerings, and gifts sustain the mission and ministries of the Diocese.
          </p>
          <Link href="/give" className="btn-primary mt-6 inline-flex">
            Give Now
          </Link>
        </div>
      </section>
    </>
  );
}
