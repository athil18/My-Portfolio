import {
    Package,
    Search,
    Filter,
    AlertCircle,
    Inbox,
    type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    variant?: 'default' | 'search' | 'filter' | 'error';
    className?: string;
}

const variantIcons: Record<string, LucideIcon> = {
    default: Inbox,
    search: Search,
    filter: Filter,
    error: AlertCircle,
};

export function EmptyState({
    icon,
    title,
    description,
    action,
    variant = 'default',
    className,
}: EmptyStateProps) {
    const Icon = icon || variantIcons[variant];

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 px-4 text-center',
                className
            )}
        >
            <div className="rounded-full bg-muted p-6 mb-4">
                <Icon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
            {action && (
                <Button onClick={action.onClick} variant="default">
                    {action.label}
                </Button>
            )}
        </div>
    );
}

// Preset empty states for common scenarios
export function NoProductsFound({ onClearFilters }: { onClearFilters?: () => void }) {
    return (
        <EmptyState
            variant="search"
            title="No products found"
            description="We couldn't find any products matching your criteria. Try adjusting your filters or search terms."
            action={
                onClearFilters
                    ? {
                        label: 'Clear Filters',
                        onClick: onClearFilters,
                    }
                    : undefined
            }
        />
    );
}

export function NoProductsYet({ onCreate }: { onCreate: () => void }) {
    return (
        <EmptyState
            icon={Package}
            title="No products yet"
            description="Get started by creating your first product. It only takes a minute!"
            action={{
                label: 'Create Product',
                onClick: onCreate,
            }}
        />
    );
}

export function NoNotifications() {
    return (
        <EmptyState
            icon={Inbox}
            title="No notifications"
            description="You're all caught up! We'll notify you when something new happens."
        />
    );
}

export function ErrorFallback({ onRetry }: { onRetry?: () => void }) {
    return (
        <EmptyState
            variant="error"
            title="Something went wrong"
            description="We encountered an error while loading this content. Please try again."
            action={
                onRetry
                    ? {
                        label: 'Try Again',
                        onClick: onRetry,
                    }
                    : undefined
            }
        />
    );
}
