import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';

export default function QuickActionCards() {
  return (
    <section className="section bg-white">
      <div className="container-diocese grid gap-6 lg:grid-cols-2">
        <Reveal variant="left">
          <Link href="/prayer" className="stat-card card block p-8 transition-colors hover:border-gold">
            <div className="flex items-center gap-4">
              <div className="float-icon flex h-14 w-14 items-center justify-center rounded-full bg-gold text-2xl text-navy">✦</div>
              <div>
                <p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">Prayer Request</p>
                <h3 className="mt-2">Send Prayer Request</h3>
              </div>
            </div>
            <p className="mt-4 text-ink-muted">
              We believe in the power of prayer. Share your prayer requests with us and our prayer
              team will stand with you in faith.
            </p>
          </Link>
        </Reveal>

        <Reveal variant="right" delay={120}>
          <Link href="/support" className="stat-card card block p-8 transition-colors hover:border-gold">
            <div className="flex items-center gap-4">
              <div className="float-icon flex h-14 w-14 items-center justify-center rounded-full bg-gold text-2xl text-navy">❤</div>
              <div>
                <p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">Support</p>
                <h3 className="mt-2">Support the Diocese</h3>
              </div>
            </div>
            <p className="mt-4 text-ink-muted">
              Partner with us in spreading the Gospel and supporting ministry, missions, education,
              and community outreach through your generous giving.
            </p>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
