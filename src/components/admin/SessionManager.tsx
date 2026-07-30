'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const IDLE_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_ADMIN_IDLE_TIMEOUT || '1800000', 10); // default 30 min
const WARNING_BEFORE = Math.min(120000, IDLE_TIMEOUT / 4); // 2 min or 1/4 of timeout

export function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setShowWarning(false);
    setCountdown(0);

    // Set warning timer at 28 min
    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(120);
      countdownTimer.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, IDLE_TIMEOUT - WARNING_BEFORE);

    // Set logout timer at 30 min
    idleTimer.current = setTimeout(() => {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/admin/login?callbackUrl=${callbackUrl}&reason=idle`);
    }, IDLE_TIMEOUT);
  }, [pathname, router]);

  const handleStayLoggedIn = useCallback(async () => {
    resetIdleTimer();
    // Also refresh the server-side JWT
    try {
      await fetch('/api/admin/session/refresh', { method: 'POST' });
    } catch { /* silent failure — idle timer already reset */ }
  }, [resetIdleTimer]);

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: '/admin/login' });
  }, []);

  useEffect(() => {
    resetIdleTimer();

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const onActivity = () => resetIdleTimer();

    activityEvents.forEach(event => {
      window.addEventListener(event, onActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, onActivity);
      });
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [resetIdleTimer]);

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-xl max-w-sm w-full mx-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⏰</span>
              <h2 className="text-lg font-semibold text-primary">Session Expiring</h2>
            </div>
            <p className="text-sm text-muted mb-1">
              Your admin session will expire due to inactivity.
            </p>
            <p className="text-2xl font-mono font-bold text-amber-600 text-center my-4">
              {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-muted mb-4">
              Click &ldquo;Stay Logged In&rdquo; to continue your session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface transition"
              >
                Log Out
              </button>
              <button
                onClick={handleStayLoggedIn}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
