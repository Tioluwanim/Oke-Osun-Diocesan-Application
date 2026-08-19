import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import PageHero from '@/components/ui/PageHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getNewsArticle, getNews } from '@/lib/api';

export async function generateStaticParams() {
  const news = await getNews();
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getNewsArticle(params.slug);
  return { title: article?.headline ?? 'News' };
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const article = await getNewsArticle(params.slug);
  if (!article) notFound();

  return (
    <>
      <PageHero title={article.headline} subtitle={`${article.category} · ${article.author}`} image={article.image} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'News', href: '/news' }, { label: article.headline }]} />
      <article className="section bg-white">
        <div className="container-diocese max-w-3xl">
          {article.image && (
            <div className="relative mb-8 aspect-video overflow-hidden rounded-card shadow-diocese">
              <Image src={article.image} alt="" fill className="object-cover" />
            </div>
          )}
          <p className="text-lg leading-relaxed text-ink-muted">{article.body}</p>
        </div>
      </article>
    </>
  );
}
