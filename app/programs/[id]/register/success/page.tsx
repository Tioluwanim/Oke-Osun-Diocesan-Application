'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCodeDisplay from '@/components/forms/QRCodeDisplay';
import { Registration } from '@/types';

export default function RegistrationSuccessPage() {
  const [registration, setRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('lastRegistration');
    if (raw) setRegistration(JSON.parse(raw));
  }, []);

  return (
    <section className="section bg-cream">
      <div className="container-diocese max-w-xl">
        <h1 className="mb-2 text-center">Registration Confirmed</h1>
        <p className="mb-8 text-center text-ink-muted">
          Thank you for registering. A confirmation has also been sent to your email.
        </p>

        {registration ? (
          <QRCodeDisplay registration={registration} />
        ) : (
          <div className="card p-8 text-center text-ink-muted">
            We could not find your registration details on this device. Please check your
            confirmation email, or contact the Diocesan Secretariat.
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/programs" className="btn-secondary">
            Back to Programs
          </Link>
        </div>
      </div>
    </section>
  );
}
