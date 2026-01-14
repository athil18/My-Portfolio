import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    children: React.ReactNode;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LoadingButton({
    loading = false,
    children,
    disabled,
    className,
    variant = 'default',
    size = 'default',
    ...props
}: LoadingButtonProps) {
    return (
        <Button
            variant={variant}
            size={size}
            disabled={disabled || loading}
            className={cn(className)}
            {...props}
        >
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            {children}
        </Button>
    );
}
