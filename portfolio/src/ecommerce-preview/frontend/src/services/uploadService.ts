import apiClient from './api';

export interface FileMetadata {
    _id: string;
    userId: string;
    filename: string;
    originalName: string;
    url: string;
    sizes?: {
        thumbnail?: string;
        medium?: string;
        large?: string;
    };
    publicId: string;
    size: number;
    mimeType: string;
    folder: 'products' | 'avatars' | 'documents';
    isOptimized: boolean;
    createdAt: string;
    updatedAt: string;
}

export const uploadService = {
    /**
     * Upload single file
     */
    uploadFile: async (
        file: File,
        folder: 'products' | 'avatars' | 'documents',
        onProgress?: (progress: number) => void
    ): Promise<FileMetadata> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await apiClient.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });

        return response.data.data;
    },

    /**
     * Upload multiple files
     */
    uploadFiles: async (
        files: File[],
        folder: 'products' | 'avatars' | 'documents',
        onProgress?: (progress: number) => void
    ): Promise<FileMetadata[]> => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        formData.append('folder', folder);

        const response = await apiClient.post('/upload/multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });

        return response.data.data;
    },

    /**
     * Get user's files
     */
    getUserFiles: async (folder?: 'products' | 'avatars' | 'documents'): Promise<FileMetadata[]> => {
        const params = folder ? { folder } : {};
        const response = await apiClient.get('/upload/files', { params });
        return response.data.data;
    },

    /**
     * Get file by ID
     */
    getFileById: async (fileId: string): Promise<FileMetadata> => {
        const response = await apiClient.get(`/upload/files/${fileId}`);
        return response.data.data;
    },

    /**
     * Delete file
     */
    deleteFile: async (fileId: string): Promise<void> => {
        await apiClient.delete(`/upload/files/${fileId}`);
    },
};
