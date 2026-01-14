import React from 'react';
import { useSearchParams } from 'react-router-dom';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    showLimitSelector?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onLimitChange,
    showLimitSelector = true,
}) => {
    const [, setSearchParams] = useSearchParams();

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        onPageChange(page);
        setSearchParams((params) => {
            params.set('page', String(page));
            return params;
        });
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const limit = Number(e.target.value);
        onLimitChange?.(limit);
        setSearchParams((params) => {
            params.set('limit', String(limit));
            params.set('page', '1');
            return params;
        });
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            if (totalPages > 1) pages.push(totalPages);
        }
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            {totalItems && itemsPerPage && (
                <div className="text-gray-400 text-sm">
                    Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                </div>
            )}

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    ← Prev
                </button>

                {getPageNumbers().map((page, i) => (
                    <button
                        key={i}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={page === '...'}
                        className={`w-10 h-10 rounded-lg transition ${page === currentPage
                            ? 'bg-purple-600 text-white'
                            : page === '...'
                                ? 'text-gray-400 cursor-default'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Next →
                </button>
            </div>

            {showLimitSelector && onLimitChange && (
                <select
                    value={itemsPerPage}
                    onChange={handleLimitChange}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="10">10 / page</option>
                    <option value="20">20 / page</option>
                    <option value="50">50 / page</option>
                </select>
            )}
        </div>
    );
};

export default Pagination;
