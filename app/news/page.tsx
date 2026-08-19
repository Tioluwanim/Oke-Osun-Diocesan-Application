import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import NewsCard from '@/components/cards/NewsCard';
import EmptyState from '@/components/ui/EmptyState';
import { getNews } from '@/lib/api';

export const metadata: Metadata = { title: 'News' };

export default async function NewsPage() {
  const news = await getNews();
  return (
    <>
      <PageHero title="News" subtitle="Announcements and updates from across the Diocese" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'News' }]} />
      <section className="section bg-white">
        <div className="container-diocese">
          {news.length === 0 ? (
            <EmptyState title="No news has been published yet." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((n) => (
                <NewsCard key={n.id} article={n} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
