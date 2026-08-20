import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle } from '@/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative h-44 w-full bg-cream">
        {article.image && (
          <Image src={article.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-base font-semibold uppercase tracking-wide text-gold">
          {article.category} · {formatDate(article.date)}
        </p>
        <h3 className="text-lg">{article.headline}</h3>
        <p className="line-clamp-2 text-base text-ink-muted">{article.summary}</p>
        <Link href={`/news/${article.slug}`} className="mt-auto pt-3 font-semibold text-blue hover:text-gold">
          Read more →
        </Link>
      </div>
    </article>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="skeleton h-44 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-full" />
      </div>
    </div>
  );
}
