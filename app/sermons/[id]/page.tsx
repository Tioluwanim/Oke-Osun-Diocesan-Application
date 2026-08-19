import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LiveStreamEmbed from '@/components/forms/LiveStreamEmbed';
import { getSermon, getSermons } from '@/lib/api';

export async function generateStaticParams() {
  const sermons = await getSermons();
  return sermons.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const sermon = await getSermon(params.id);
  return { title: sermon?.title ?? 'Sermon' };
}

export default async function SermonDetailPage({ params }: { params: { id: string } }) {
  const sermon = await getSermon(params.id);
  if (!sermon) notFound();

  return (
    <>
      <PageHero title={sermon.title} subtitle={`${sermon.preacher} · ${sermon.scripture}`} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Sermons', href: '/sermons' }, { label: sermon.title }]} />
      <section className="section bg-white">
        <div className="container-diocese max-w-3xl">
          {sermon.youtubeId && <LiveStreamEmbed youtubeId={sermon.youtubeId} title={sermon.title} />}
          {sermon.audioUrl && !sermon.youtubeId && (
            <audio controls className="w-full" src={sermon.audioUrl}>
              Your browser does not support the audio element.
            </audio>
          )}
          <p className="mt-6 text-lg text-ink-muted">{sermon.description}</p>
          {sermon.downloadUrl && (
            <a href={sermon.downloadUrl} className="btn-secondary mt-6 inline-flex">
              Download
            </a>
          )}
        </div>
      </section>
    </>
  );
}
