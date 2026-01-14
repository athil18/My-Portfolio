import React from 'react';

const LoadingSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-white/10 rounded-xl"></div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-white/10 rounded-xl"></div>
                <div className="h-64 bg-white/10 rounded-xl"></div>
            </div>
        </div>
    );
};

export default LoadingSkeleton;
