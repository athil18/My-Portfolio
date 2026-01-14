import React from 'react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    title: string;
    itemName: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    title,
    itemName,
    onConfirm,
    onCancel,
    loading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-white/20 shadow-2xl">
                <div className="mb-4">
                    <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white text-center">{title}</h3>
                </div>
                <p className="text-gray-300 text-center mb-2">
                    Are you sure you want to delete <span className="font-semibold text-white">"{itemName}"</span>?
                </p>
                <p className="text-gray-400 text-sm text-center mb-6">This action cannot be undone.</p>
                <div className="flex space-x-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
