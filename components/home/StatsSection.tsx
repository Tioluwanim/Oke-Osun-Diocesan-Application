import Reveal from '@/components/ui/Reveal';
import CountUp from '@/components/ui/CountUp';

const STATS = [
  { value: '12', title: 'Archdeaconries', copy: 'Serving communities through faithful Anglican ministry.' },
  { value: '150', title: 'Churches', copy: 'Growing congregations across the Diocese.' },
  { value: '180', title: 'Clergy', copy: 'Faithful ministers serving God’s people.' },
  { value: '30000', title: 'Church Members', copy: 'Worshipping, serving, and growing together in Christ.' },
];

export default function StatsSection() {
  return (
    <section className="section bg-white">
      <div className="container-diocese">
        <Reveal className="mb-8 text-center">
          <p className="text-base font-semibold uppercase tracking-[0.2em] text-gold">Our Diocese</p>
          <h2 className="mt-3">Growing Together in Christ</h2>
          <span className="underline-grow mx-auto mt-3 block h-[3px] w-16 rounded-full bg-gold" />
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <Reveal key={stat.title} variant="scale" delay={index * 120}>
              <div className="stat-card card p-6 text-center">
                <div className="float-icon glow-ring mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-xl text-navy">
                  ✦
                </div>
                <h3 className="text-4xl text-navy">
                  <CountUp value={stat.value} durationMs={1600 + index * 200} />
                </h3>
                <p className="mt-2 text-lg font-semibold text-navy">{stat.title}</p>
                <p className="mt-2 text-base text-ink-muted">{stat.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
