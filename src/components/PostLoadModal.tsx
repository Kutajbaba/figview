import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export type PostLoadChoice = 'designs' | 'explore';

interface Props {
  open: boolean;
  fileName: string;
  screenCount: number;
  onChoose: (choice: PostLoadChoice) => void;
}

export function PostLoadModal({ open, fileName, screenCount, onChoose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-load-title"
      aria-describedby="post-load-desc"
    >
      <Card className="relative z-10 w-full max-w-[364px] border-border/80 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle id="post-load-title" className="text-center text-xl">
            How do you want to start?
          </CardTitle>
          <CardDescription
            id="post-load-desc"
            className="text-center text-[13px] font-normal leading-4 text-foreground"
          >
            {`${fileName || 'Your file'} is ready — ${screenCount} screen${screenCount === 1 ? '' : 's'} indexed.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4">
          <Button type="button" className="w-full" size="lg" onClick={() => onChoose('designs')}>
            View designs
          </Button>
          <Button type="button" variant="outline" className="w-full" size="lg" onClick={() => onChoose('explore')}>
            Explore Figview
          </Button>
        </CardContent>
        <div className="px-6 pb-6">
          <p className="text-center text-xs text-muted-foreground">
            You can switch anytime from the sidebar — Dashboard, Designs, or your file’s pages.
          </p>
        </div>
      </Card>
    </div>
  );
}
