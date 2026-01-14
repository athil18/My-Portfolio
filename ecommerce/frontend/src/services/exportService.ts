import apiClient from '../services/api';

export const exportService = {
    /**
     * Export entity data
     */
    exportData: async (entity: string, format: 'csv' | 'json' = 'csv', filters: Record<string, any> = {}) => {
        try {
            const response = await apiClient.get(`/export/${entity}`, {
                params: { ...filters, format },
                responseType: 'blob', // Important for file downloads
            });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from content-disposition if possible, or generate one
            const contentDisposition = response.headers['content-disposition'];
            let filename = `${entity}_export_${new Date().getTime()}.${format}`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename=(.+)/);
                if (match && match[1]) filename = match[1];
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    },
};
