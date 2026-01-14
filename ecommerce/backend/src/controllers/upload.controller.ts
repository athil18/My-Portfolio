import { Request, Response } from 'express';
import * as uploadService from '../services/upload.service';
import { cloudinaryService } from '../services/external/cloudinary.service';
import File from '../models/file.model';

/**
 * Upload single file
 */
export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { folder = 'documents' } = req.body;
        const userId = (req as any).user.id;

        const file = await uploadService.uploadFile(req.file, userId, folder);

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: file,
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload file',
        });
    }
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const { folder = 'documents' } = req.body;
        const userId = (req as any).user.id;

        const uploadedFiles = await Promise.all(
            req.files.map((file) => uploadService.uploadFile(file, userId, folder))
        );

        res.status(201).json({
            success: true,
            message: 'Files uploaded successfully',
            data: uploadedFiles,
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload files',
        });
    }
};

/**
 * Get user's uploaded files
 */
export const getFiles = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { folder } = req.query;

        const files = await uploadService.getUserFiles(
            userId,
            folder as 'products' | 'avatars' | 'documents' | undefined
        );

        res.json({
            success: true,
            data: files,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch files',
        });
    }
};

/**
 * Get file by ID
 */
export const getFileById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const file = await uploadService.getFileById(id, userId);

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        res.json({
            success: true,
            data: file,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch file',
        });
    }
};

/**
 * Delete file
 */
export const deleteFile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        await uploadService.deleteFile(id, userId);

        res.json({
            success: true,
            message: 'File deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete file',
        });
    }
};
