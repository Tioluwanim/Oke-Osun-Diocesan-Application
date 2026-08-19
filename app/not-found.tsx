import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-diocese flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <h1>Page Not Found</h1>
      <p className="max-w-md text-ink-muted">
        The page you are looking for may have moved or no longer exists.
      </p>
      <Link href="/" className="btn-primary">
        Return Home
      </Link>
    </div>
  );
}
