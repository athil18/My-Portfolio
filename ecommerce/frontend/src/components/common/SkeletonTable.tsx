import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonTableProps {
    rows?: number;
    columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
    return (
        <div className="space-y-3">
            {/* Table Header */}
            <div className="flex gap-4 pb-3 border-b">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={`header-${i}`} className="h-4 flex-1" />
                ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-4 py-3">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}
