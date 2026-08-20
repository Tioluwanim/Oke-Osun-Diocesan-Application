'use client';

import { useState } from 'react';
import LogoLoader from '@/components/ui/LogoLoader';

const CATEGORIES = ['Tithe', 'Offering', 'Building Fund', 'Program Fee', 'Other'] as const;
const SUGGESTED = [1000, 2000, 5000, 10000];

export default function DonateWidget() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Tithe');
  const [amount, setAmount] = useState<number | null>(2000);
  const [customAmount, setCustomAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing'>('idle');

  const finalAmount = amount ?? (Number(customAmount) || 0);

  function handleGive() {
    setStatus('processing');
    // Real implementation: POST to the backend to initialize a Paystack transaction,
    // then redirect to the returned authorization_url. Card details are never handled here.
    setTimeout(() => setStatus('idle'), 1500);
  }

  return (
    <div className="card flex flex-col gap-6 p-6 sm:p-8">
      <div>
        <p className="mb-2 text-base font-semibold text-navy">Giving Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`min-h-[48px] rounded-full border px-4 text-base font-medium ${
                category === c ? 'border-gold bg-gold text-navy' : 'border-line text-ink-muted hover:border-gold'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-base font-semibold text-navy">Amount (₦)</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SUGGESTED.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setAmount(a);
                setCustomAmount('');
              }}
              className={`min-h-[48px] rounded-lg border px-3 text-base font-semibold ${
                amount === a ? 'border-gold bg-gold text-navy' : 'border-line text-navy hover:border-gold'
              }`}
            >
              ₦{a.toLocaleString()}
            </button>
          ))}
        </div>
        <label htmlFor="custom-amount" className="mt-3 block text-base font-semibold text-navy">
          Custom Amount
        </label>
        <input
          id="custom-amount"
          type="number"
          min={100}
          inputMode="numeric"
          placeholder="Enter amount"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setAmount(null);
          }}
          className="mt-1 min-h-[48px] w-full rounded-lg border border-line px-4 text-base focus:border-gold"
        />
      </div>

      <button
        type="button"
        onClick={handleGive}
        disabled={status === 'processing' || finalAmount <= 0}
        className="btn-primary w-full"
      >
        {status === 'processing' ? (
          <>
            <LogoLoader size="sm" showLabel={false} />
            Processing payment…
          </>
        ) : (
          `Give ₦${finalAmount.toLocaleString()} via Paystack`
        )}
      </button>
      <p className="text-center text-base text-ink-muted">
        You will be redirected to Paystack&apos;s secure checkout to complete your payment.
      </p>
    </div>
  );
}
