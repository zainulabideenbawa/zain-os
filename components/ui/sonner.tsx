'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[var(--card)] group-[.toaster]:text-[var(--fg)] group-[.toaster]:border-[var(--line)] group-[.toaster]:shadow-lg group-[.toaster]:rounded-[12px] group-[.toaster]:font-sans',
          description: 'group-[.toast]:text-[var(--muted)]',
          actionButton:
            'group-[.toast]:bg-[var(--gold)] group-[.toast]:text-[var(--bg)]',
          cancelButton:
            'group-[.toast]:bg-[var(--surface)] group-[.toast]:text-[var(--fg)]',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
