import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
    message?: string;
    className?: string;
}

export function PageLoader({ message = 'Loading...', className }: PageLoaderProps) {
    return (
        <div
            className={cn(
                'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm',
                className
            )}
        >
            <LoadingSpinner size="lg" />
            {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
        </div>
    );
}
