import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, label, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);

        return (
            <div className="space-y-2 w-full">
                {label && (
                    <label className="text-sm font-medium text-white/80">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        type={type}
                        className={cn(
                            'flex h-11 w-full rounded-lg border px-4 py-2 text-sm transition-all',
                            'bg-white/5 text-white placeholder:text-white/40',
                            'border-white/20 focus:border-[#a29bfe] focus:bg-white/10',
                            'focus:outline-none focus:ring-2 focus:ring-[#a29bfe]/50',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
                            isFocused && !error && 'shadow-[0_0_8px_rgba(162,147,254,0.3)]',
                            className
                        )}
                        ref={ref}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-400 animate-fade-slide-up">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
