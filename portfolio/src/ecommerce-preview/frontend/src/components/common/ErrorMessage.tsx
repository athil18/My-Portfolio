import { AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
    title?: string;
    message: string;
    variant?: 'error' | 'warning';
    className?: string;
    onDismiss?: () => void;
}

export function ErrorMessage({
    title,
    message,
    variant = 'error',
    className,
    onDismiss,
}: ErrorMessageProps) {
    const Icon = variant === 'error' ? AlertCircle : AlertCircle;
    const bgColor = variant === 'error' ? 'bg-destructive/10' : 'bg-yellow-500/10';
    const textColor = variant === 'error' ? 'text-destructive' : 'text-yellow-600';
    const borderColor = variant === 'error' ? 'border-destructive/20' : 'border-yellow-500/20';

    return (
        <div
            className={cn(
                'relative rounded-lg border p-4',
                bgColor,
                borderColor,
                className
            )}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', textColor)} />
                <div className="flex-1">
                    {title && (
                        <h3 className={cn('font-semibold mb-1', textColor)}>{title}</h3>
                    )}
                    <p className={cn('text-sm', textColor)}>{message}</p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className={cn(
                            'flex-shrink-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity',
                            textColor
                        )}
                        aria-label="Dismiss"
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
