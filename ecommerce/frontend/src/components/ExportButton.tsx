import React, { useState } from 'react';
import { exportService } from '../services/exportService';
import toast from 'react-hot-toast';

interface ExportButtonProps {
    entity: string;
    filters?: Record<string, any>;
    className?: string;
    label?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
    entity,
    filters = {},
    className = '',
    label = 'Export',
}) => {
    const [loading, setLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            setLoading(true);
            setShowOptions(false);
            await exportService.exportData(entity, format, filters);
            toast.success(`${entity} exported successfully`);
        } catch (error) {
            toast.error(`Failed to export ${entity}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setShowOptions(!showOptions)}
                disabled={loading}
                className={`px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition disabled:opacity-50 ${className}`}
            >
                {loading ? (
                    <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Exporting...</span>
                    </span>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{label}</span>
                    </>
                )}
            </button>

            {showOptions && !loading && (
                <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                    <button
                        onClick={() => handleExport('csv')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                    >
                        Export as CSV
                    </button>
                    <button
                        onClick={() => handleExport('json')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                    >
                        Export as JSON
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportButton;
