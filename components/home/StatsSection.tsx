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
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Our Diocese</p>
          <h2 className="mt-3">Growing Together in Christ</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.title} className="card p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-xl text-navy">
                ✦
              </div>
              <h3 className="text-4xl text-navy">{stat.value}</h3>
              <p className="mt-2 text-lg font-semibold text-navy">{stat.title}</p>
              <p className="mt-2 text-sm text-ink-muted">{stat.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
