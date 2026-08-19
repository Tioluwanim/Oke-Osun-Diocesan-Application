import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import RegistrationForm from '@/components/forms/RegistrationForm';
import { getProgram, getPrograms } from '@/lib/api';

export async function generateStaticParams() {
  const programs = await getPrograms();
  return programs.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const program = await getProgram(params.id);
  return { title: program?.title ?? 'Program' };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  const program = await getProgram(params.id);
  if (!program) notFound();

  return (
    <>
      <PageHero title={program.title} subtitle={`${formatDate(program.date)} · ${program.location}`} image={program.image} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Programs', href: '/programs' }, { label: program.title }]} />

      <section className="section bg-white">
        <div className="container-diocese grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <p className="text-lg text-ink-muted">{program.description}</p>

            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold uppercase text-ink-muted">Eligibility</dt>
                <dd className="text-lg text-navy">{program.eligibility}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase text-ink-muted">Registration Deadline</dt>
                <dd className="text-lg text-navy">{formatDate(program.registrationDeadline)}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase text-ink-muted">Places Available</dt>
                <dd className="text-lg text-navy">{program.availablePlaces} of {program.totalPlaces}</dd>
              </div>
              {program.fee && (
                <div>
                  <dt className="text-sm font-semibold uppercase text-ink-muted">Fee</dt>
                  <dd className="text-lg text-navy">{program.fee}</dd>
                </div>
              )}
            </dl>

            <h2 className="mt-10">Schedule</h2>
            <ul className="mt-4 space-y-3">
              {program.schedule.map((s) => (
                <li key={s.time} className="flex gap-4 border-b border-line pb-3">
                  <span className="w-40 shrink-0 font-semibold text-navy">{s.time}</span>
                  <span className="text-ink-muted">{s.activity}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4">Register</h2>
            <RegistrationForm program={program} />
          </div>
        </div>
      </section>
    </>
  );
}
