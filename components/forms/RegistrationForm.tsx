'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import LogoLoader from '@/components/ui/LogoLoader';
import { submitRegistration } from '@/lib/api';
import { Program } from '@/types';

interface FormState {
  name: string;
  phone: string;
  email: string;
  parish: string;
  groupAffiliation: string;
}

const EMPTY: FormState = { name: '', phone: '', email: '', parish: '', groupAffiliation: '' };

export default function RegistrationForm({ program }: { program: Program }) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');

  function validate(): boolean {
    const next: Partial<FormState> = {};
    if (!values.name.trim()) next.name = 'Please enter your full name.';
    if (!values.phone.trim()) next.phone = 'Please enter your phone number.';
    if (!values.email.trim() || !values.email.includes('@')) next.email = 'Please enter a valid email address.';
    if (!values.parish.trim()) next.parish = 'Please enter your parish.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    try {
      const registration = await submitRegistration({
        programId: program.id,
        name: values.name,
        phone: values.phone,
        email: values.email,
        parish: values.parish,
        groupAffiliation: values.groupAffiliation || undefined,
      });
      // In a real app this would be persisted server-side and fetched on the success
      // page by ID; for the fixture build we pass it via sessionStorage.
      sessionStorage.setItem('lastRegistration', JSON.stringify(registration));
      router.push(`/programs/${program.id}/register/success`);
    } catch {
      setStatus('error');
    }
  }

  const field = (
    key: keyof FormState,
    label: string,
    type: string = 'text'
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={key} className="text-sm font-semibold text-navy">
        {label} <span aria-hidden="true" className="text-gold">*</span>
      </label>
      <input
        id={key}
        name={key}
        type={type}
        value={values[key]}
        onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
        className="min-h-[48px] rounded-lg border border-line px-4 text-base focus:border-gold"
      />
      {errors[key] && (
        <p id={`${key}-error`} className="text-sm font-medium text-red-700">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="card flex flex-col gap-5 p-6 sm:p-8">
      {field('name', 'Full Name')}
      {field('phone', 'Phone Number', 'tel')}
      {field('email', 'Email Address', 'email')}
      {field('parish', 'Parish')}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="groupAffiliation" className="text-sm font-semibold text-navy">
          Group Affiliation (optional)
        </label>
        <input
          id="groupAffiliation"
          name="groupAffiliation"
          type="text"
          value={values.groupAffiliation}
          onChange={(e) => setValues((v) => ({ ...v, groupAffiliation: e.target.value }))}
          className="min-h-[48px] rounded-lg border border-line px-4 text-base focus:border-gold"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm font-medium text-red-700">
          We could not submit your registration. Please check your internet connection and try again.
        </p>
      )}

      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full">
        {status === 'submitting' ? (
          <LogoLoader size="sm" showLabel={false} label="Submitting" />
        ) : (
          'Submit Registration'
        )}
        <span>{status === 'submitting' ? 'Submitting…' : ''}</span>
      </button>
    </form>
  );
}
