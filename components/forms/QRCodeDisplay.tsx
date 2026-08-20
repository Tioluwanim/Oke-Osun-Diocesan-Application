'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Registration } from '@/types';

export default function QRCodeDisplay({ registration }: { registration: Registration }) {
  return (
    <div className="card flex flex-col items-center gap-4 p-6 text-center sm:p-8">
      <p className="text-base font-semibold uppercase tracking-wide text-gold">Registration Confirmed</p>

      <div className="rounded-card border border-line bg-white p-4">
        <QRCodeSVG value={registration.qrData ?? registration.id} size={220} includeMargin />
      </div>
      <p className="text-base text-ink-muted">Present this code at check-in.</p>

      <dl className="grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2">
        <div>
          <dt className="text-base font-semibold uppercase text-ink-muted">Name</dt>
          <dd className="text-base font-medium text-navy">{registration.name}</dd>
        </div>
        <div>
          <dt className="text-base font-semibold uppercase text-ink-muted">Registration ID</dt>
          <dd className="text-base font-medium text-navy">{registration.id}</dd>
        </div>
        {registration.hostel && (
          <div>
            <dt className="text-base font-semibold uppercase text-ink-muted">Hostel</dt>
            <dd className="text-base font-medium text-navy">{registration.hostel}</dd>
          </div>
        )}
        {registration.room && (
          <div>
            <dt className="text-base font-semibold uppercase text-ink-muted">Room</dt>
            <dd className="text-base font-medium text-navy">{registration.room}</dd>
          </div>
        )}
        {registration.checkIn && (
          <div className="sm:col-span-2">
            <dt className="text-base font-semibold uppercase text-ink-muted">Check-in</dt>
            <dd className="text-base font-medium text-navy">{registration.checkIn}</dd>
          </div>
        )}
      </dl>
      <p className="text-base text-ink-muted">
        Hostel and room details appear here once assigned by the Diocesan Secretariat.
      </p>
    </div>
  );
}
