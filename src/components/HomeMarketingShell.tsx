import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function HomeMarketingShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative min-h-full overflow-hidden font-sfCompactRounded',
        'bg-gradient-to-b from-[#FDF8F1] via-[#FAF4EC] to-[#F3EBE0] text-[#1c1917]',
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] opacity-[0.14]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #78716c 1px, transparent 0)`,
          backgroundSize: '14px 14px',
          maskImage: 'linear-gradient(to top, black, transparent)',
        }}
      />
      {children}
    </div>
  );
}
