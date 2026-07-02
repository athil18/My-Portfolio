import { supabaseAdmin } from '../config/supabase';
import { cloudinaryService } from './external/cloudinary.service';
import { isImage } from './imageOptimization.service';
import { addImageJob } from '../queues/image.queue';

/**
 * UPLOAD SERVICE — Supabase PostgreSQL Migration
 */

export const uploadFile = async (
    file: Express.Multer.File,
    userId: string,
    folder: 'products' | 'avatars' | 'documents'
) => {
    const timestamp = Date.now();
    const basePublicId = `${folder}/${userId}_${timestamp}`;

    const uploadResult = await cloudinaryService.uploadStream(file.buffer, folder, basePublicId);

    const { data: fileDoc, error } = await supabaseAdmin
        .from('files')
        .insert({
            user_id: userId,
            filename: basePublicId,
            original_name: file.originalname,
            url: uploadResult.secure_url,
            public_id: basePublicId,
            size_bytes: file.size,
            mime_type: file.mimetype,
            folder,
            is_optimized: false,
        })
        .select()
        .single();

    if (error || !fileDoc) throw new Error('Failed to save file record in database');

    const mappedDoc = { ...fileDoc, _id: fileDoc.id };

    if (isImage(file.mimetype)) {
        try {
            await addImageJob({
                fileId: fileDoc.id,
                buffer: file.buffer,
                folder,
                basePublicId
            });
        } catch (queueError) {
            console.error(`🛡️ [SELF-HEALING] Failed to queue image optimization for file ${fileDoc.id}:`, queueError);
        }
    }

    return mappedDoc;
};

export const getFileById = async (fileId: string, userId?: string) => {
    let query = supabaseAdmin
        .from('files')
        .select('*')
        .eq('id', fileId);

    if (userId) query = query.eq('user_id', userId);

    const { data: file } = await query.single();
    if (!file) return null;
    return { ...file, _id: file.id };
};

export const getUserFiles = async (
    userId: string,
    folder?: 'products' | 'avatars' | 'documents'
) => {
    let query = supabaseAdmin
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (folder) query = query.eq('folder', folder);

    const { data: files } = await query;
    return (files || []).map(f => ({ ...f, _id: f.id }));
};

export const deleteFile = async (fileId: string, userId: string): Promise<void> => {
    const { data: file } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single();

    if (!file) throw new Error('File not found or unauthorized');

    try {
        if (file.is_optimized) {
            await cloudinaryService.deleteMultiple([
                `${file.public_id}_thumbnail`,
                `${file.public_id}_medium`,
                `${file.public_id}_large`
            ]);
        } else {
            await cloudinaryService.deleteFile(file.public_id);
        }
    } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError);
    }

    await supabaseAdmin
        .from('files')
        .delete()
        .eq('id', fileId);
};
