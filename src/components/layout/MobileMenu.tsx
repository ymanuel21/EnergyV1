'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NAV_LINKS } from '@lib/constants';
import { Modal } from '@ui/Modal';
import { SearchBar } from '@components/forms/SearchBar';
import { HamburgerIcon, CloseIcon } from '@ui/Icons';

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:text-brand-700 hover:bg-gray-100 lg:hidden"
        aria-label="Menu"
      >
        <HamburgerIcon />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} size="full">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-extrabold text-brand-700">
              Energi<span className="text-accent-500">.Click</span>
            </span>
          </div>

          <SearchBar />

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Kategori
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.categories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-brand-700 hover:border-brand-200 transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            {NAV_LINKS.utility.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:text-brand-700 hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
