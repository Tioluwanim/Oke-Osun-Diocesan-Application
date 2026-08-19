import Link from 'next/link';

export default function QuickActionCards() {
  return (
    <section className="section bg-white">
      <div className="container-diocese grid gap-6 lg:grid-cols-2">
        <Link href="/prayer" className="card block p-8 transition-colors hover:border-gold">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-2xl text-navy">✦</div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Prayer Request</p>
              <h3 className="mt-2">Send Prayer Request</h3>
            </div>
          </div>
          <p className="mt-4 text-ink-muted">
            We believe in the power of prayer. Share your prayer requests with us and our prayer
            team will stand with you in faith.
          </p>
        </Link>

        <Link href="/support" className="card block p-8 transition-colors hover:border-gold">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-2xl text-navy">❤</div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Support</p>
              <h3 className="mt-2">Support the Diocese</h3>
            </div>
          </div>
          <p className="mt-4 text-ink-muted">
            Partner with us in spreading the Gospel and supporting ministry, missions, education,
            and community outreach through your generous giving.
          </p>
        </Link>
      </div>
    </section>
  );
}
