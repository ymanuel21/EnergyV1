'use client';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-semibold text-primary">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted max-w-md">We encountered an error loading this page.</p>
      <button onClick={reset} className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition">Try again</button>
    </div>
  );
}
