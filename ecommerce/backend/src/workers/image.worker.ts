import { imageQueue } from '../queues/image.queue';
import { cloudinaryService } from '../services/external/cloudinary.service';
import { generateImageSizes } from '../services/imageOptimization.service';
import { supabaseAdmin } from '../config/supabase';

/**
 * Process image optimization jobs
 */
export const imageWorker = () => {
    imageQueue.process('optimize', async (job) => {
        const { fileId, buffer, folder, basePublicId } = job.data;

        try {
            console.log(`Starting background optimization for file: ${fileId}`);
            const imageSizes = await generateImageSizes(Buffer.from(buffer));

            const [thumbnailRes, mediumRes, largeRes] = await Promise.all([
                cloudinaryService.uploadStream(imageSizes.thumbnail.buffer, folder, `${basePublicId}_thumbnail`),
                cloudinaryService.uploadStream(imageSizes.medium.buffer, folder, `${basePublicId}_medium`),
                cloudinaryService.uploadStream(imageSizes.large.buffer, folder, `${basePublicId}_large`),
            ]);

            const sizes = {
                thumbnail: thumbnailRes.secure_url,
                medium: mediumRes.secure_url,
                large: largeRes.secure_url,
            };

            await supabaseAdmin
                .from('files')
                .update({
                    url: largeRes.secure_url,
                    sizes,
                    is_optimized: true,
                    filename: `${basePublicId}_optimized`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', fileId);

            console.log(`Background optimization complete for file: ${fileId}`);
        } catch (error) {
            console.error(`Background optimization failed for file ${fileId}:`, error);
        }
    });

    console.log('Image worker started');
};
