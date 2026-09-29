'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.warn('[SW] Registration failed:', error);
        });
    }
  }, []);

  return null;
}
