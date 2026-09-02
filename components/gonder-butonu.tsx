'use client';

import { useFormStatus } from 'react-dom';

type Props = {
  children: React.ReactNode;
  bekleyenMetin?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * Server Action formları için, gönderim sırasında yükleme durumu gösteren buton.
 */
export default function GonderButonu({
  children,
  bekleyenMetin = 'İşleniyor...',
  className = 'btn-birincil',
  disabled = false,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending || disabled} aria-busy={pending}>
      {pending && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden="true"
        />
      )}
      {pending ? bekleyenMetin : children}
    </button>
  );
}
