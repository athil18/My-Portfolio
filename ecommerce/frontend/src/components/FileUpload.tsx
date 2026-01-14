import React, { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { uploadService } from '../services/uploadService';
import type { FileMetadata } from '../services/uploadService';
import toast from 'react-hot-toast';

interface FileUploadProps {
    folder: 'products' | 'avatars' | 'documents';
    multiple?: boolean;
    maxSize?: number; // in bytes, default 10MB
    acceptedTypes?: string[];
    onUploadComplete?: (files: FileMetadata[]) => void;
    className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
    folder,
    multiple = false,
    maxSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    onUploadComplete,
    className = '',
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Validate file
    const validateFile = (file: File): boolean => {
        if (!acceptedTypes.includes(file.type)) {
            toast.error(`Invalid file type: ${file.name}`);
            return false;
        }
        if (file.size > maxSize) {
            toast.error(`File too large: ${file.name} (max ${(maxSize / 1024 / 1024).toFixed(1)}MB)`);
            return false;
        }
        return true;
    };

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        const valid = selected.filter(validateFile);

        if (!multiple && valid.length > 0) {
            setFiles([valid[0]]);
        } else {
            setFiles((prev) => (multiple ? [...prev, ...valid] : [...valid]));
        }
    };

    // Handle drag and drop
    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const dropped = Array.from(e.dataTransfer.files);
        const valid = dropped.filter(validateFile);

        if (!multiple && valid.length > 0) {
            setFiles([valid[0]]);
        } else {
            setFiles((prev) => (multiple ? [...prev, ...valid] : [...valid]));
        }
    };

    // Remove file from list
    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Upload files
    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error('No files selected');
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            let uploadedFiles: FileMetadata[];

            if (files.length === 1) {
                const uploaded = await uploadService.uploadFile(files[0], folder, setProgress);
                uploadedFiles = [uploaded];
            } else {
                uploadedFiles = await uploadService.uploadFiles(files, folder, setProgress);
            }

            toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
            setFiles([]);
            onUploadComplete?.(uploadedFiles);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className={`file-upload ${className}`}>
            {/* Drop Zone */}
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white/10'
                    }`}
                onDragEnter={handleDragEnter}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>

                <p className="text-white mb-2">
                    {isDragging ? 'Drop files here' : 'Drag and drop files here'}
                </p>
                <p className="text-gray-400 text-sm mb-4">or</p>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                    Browse Files
                </button>
                <p className="text-gray-400 text-xs mt-4">
                    Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB
                </p>
            </div>

            {/* File Previews */}
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h4 className="text-white font-medium">Selected Files:</h4>
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/10 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                                {file.type.startsWith('image/') ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-purple-600 rounded flex items-center justify-center text-white font-bold">
                                        {file.name.split('.').pop()?.toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="text-white text-sm">{file.name}</p>
                                    <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="text-red-400 hover:text-red-300"
                                disabled={uploading}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                    >
                        {uploading ? `Uploading... ${progress}%` : 'Upload Files'}
                    </button>
                </div>
            )}

            {/* Progress Bar */}
            {uploading && (
                <div className="mt-4">
                    <div className="bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
