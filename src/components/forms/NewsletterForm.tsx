'use client';

import { type FormEvent } from 'react';
import { Button } from '@ui/Button';

export function NewsletterForm() {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: newsletter submission
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
        Newsletter
      </h3>
      <p className="mb-3 text-sm text-muted">
        Info produk &amp; promo energi terbarukan.
      </p>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <label htmlFor="newsletter-email" className="sr-only">
          Email
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="Email Anda"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none"
        />
        <Button type="submit" variant="primary" size="sm">
          Ikuti
        </Button>
      </form>
    </div>
  );
}
