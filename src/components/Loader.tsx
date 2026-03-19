import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  message: string;
  className?: string;
}

export function Loader({ message, className }: Props) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="max-w-sm text-center text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
