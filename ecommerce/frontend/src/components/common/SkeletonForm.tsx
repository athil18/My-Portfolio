import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonForm() {
    return (
        <div className="space-y-6">
            {/* Form Field 1 */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>

            {/* Form Field 2 */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24 w-full" />
            </div>

            {/* Form Field 3 & 4 (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            {/* Submit Button */}
            <Skeleton className="h-10 w-32" />
        </div>
    );
}
