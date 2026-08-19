import Image from 'next/image';
import Link from 'next/link';

export default function WelcomeSection() {
  return (
    <section className="section bg-white">
      <div className="container-diocese grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="relative overflow-hidden rounded-card shadow-diocese">
          <Image src="/images/hero5.png" alt="Oke-Osun Diocese" width={700} height={500} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 to-transparent p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Oke-Osun Diocese</p>
            <h3 className="mt-2 text-white">Serving God &amp; His People</h3>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Welcome to</p>
          <h2 className="mt-3">Diocese of Oke-Osun Church of Nigeria (Anglican Communion)</h2>
          <p className="mt-4 text-lg text-ink-muted">
            We warmly welcome you to the official website of the Oke-Osun Diocese. We are a
            Christ-centred Diocese committed to proclaiming the Gospel of Jesus Christ, nurturing
            believers, serving our communities, and raising faithful disciples through worship,
            evangelism, education, and compassionate service.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <h3 className="text-lg">Our Mission</h3>
              <p className="mt-2 text-sm text-ink-muted">
                Oke-Osun shall be a Bible-based Diocese devoted to worship in Spirit and truth,
                evangelism, discipleship, and social transformation.
              </p>
            </div>
            <div className="card p-5">
              <h3 className="text-lg">Our Vision</h3>
              <p className="mt-2 text-sm text-ink-muted">
                To build a vibrant Diocese, shining brighter every day through the proclamation of
                the Gospel of our Lord Jesus Christ.
              </p>
            </div>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm font-medium text-navy">
            {['Biblical Teaching', 'Faithful Worship', 'Evangelism', 'Compassionate Service', 'Integrity', 'Unity in Christ'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-gold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link href="/about" className="btn-secondary mt-8 inline-flex">
            Read More
          </Link>
        </div>
      </div>
    </section>
  );
}
