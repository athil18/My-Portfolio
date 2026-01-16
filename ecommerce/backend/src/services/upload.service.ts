import File, { IFile } from '../models/file.model';
import { cloudinaryService } from './external/cloudinary.service';
import { generateImageSizes, isImage } from './imageOptimization.service';

import { addImageJob } from '../queues/image.queue';

/**
 * Upload file with optional background image optimization
 */
export const uploadFile = async (
    file: Express.Multer.File,
    userId: string,
    folder: 'products' | 'avatars' | 'documents'
): Promise<IFile> => {
    const timestamp = Date.now();
    const basePublicId = `${folder}/${userId}_${timestamp}`;

    const uploadResult = await cloudinaryService.uploadStream(file.buffer, folder, basePublicId);

    const fileDoc = await File.create({
        userId,
        filename: basePublicId,
        originalName: file.originalname,
        url: uploadResult.secure_url,
        publicId: basePublicId,
        size: file.size,
        mimeType: file.mimetype,
        folder,
        isOptimized: false,
    });

    if (isImage(file.mimetype)) {
        await addImageJob({
            fileId: fileDoc._id.toString(),
            buffer: file.buffer,
            folder,
            basePublicId
        });
    }

    return fileDoc;
};

/**
 * Get file by ID
 */
export const getFileById = async (fileId: string, userId?: string): Promise<IFile | null> => {
    const query: any = { _id: fileId };
    if (userId) query.userId = userId;

    return File.findOne(query);
};

/**
 * Get user's files with optional folder filter
 */
export const getUserFiles = async (
    userId: string,
    folder?: 'products' | 'avatars' | 'documents'
): Promise<IFile[]> => {
    const query: any = { userId };
    if (folder) query.folder = folder;

    return File.find(query).sort({ createdAt: -1 });
};

/**
 * Delete file from Cloudinary and database
 */
export const deleteFile = async (fileId: string, userId: string): Promise<void> => {
    const file = await File.findOne({ _id: fileId, userId });
    if (!file) throw new Error('File not found or unauthorized');

    try {
        if (file.isOptimized && file.sizes) {
            await cloudinaryService.deleteMultiple([
                `${file.publicId}_thumbnail`,
                `${file.publicId}_medium`,
                `${file.publicId}_large`
            ]);
        } else {
            await cloudinaryService.deleteFile(file.publicId);
        }
    } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError);
    }

    await File.findByIdAndDelete(fileId);
};
