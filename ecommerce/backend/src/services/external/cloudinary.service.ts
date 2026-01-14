import cloudinary from '../../config/cloudinary';
import { BaseExternalService } from './base.service';
import { Readable } from 'stream';

class CloudinaryService extends BaseExternalService {
    protected readonly serviceName = 'Cloudinary';

    /**
     * Upload buffer to Cloudinary
     */
    async uploadStream(
        buffer: Buffer,
        folder: string,
        publicId: string
    ): Promise<{ secure_url: string; public_id: string }> {
        try {
            this.log('Uploading stream', { folder, publicId });
            return new Promise((resolve, reject) => {
                const upload = cloudinary.uploader.upload_stream(
                    {
                        folder,
                        public_id: publicId,
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) {
                            this.handleError(error, 'uploadStream');
                            reject(error);
                        } else {
                            resolve(result as any);
                        }
                    }
                );

                Readable.from(buffer).pipe(upload);
            });
        } catch (error) {
            this.handleError(error, 'uploadStream');
        }
    }

    /**
     * Delete file from Cloudinary
     */
    async deleteFile(publicId: string): Promise<void> {
        try {
            this.log('Deleting file', { publicId });
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            this.handleError(error, 'deleteFile');
        }
    }

    /**
     * Delete multiple files
     */
    async deleteMultiple(publicIds: string[]): Promise<void> {
        try {
            this.log('Deleting multiple files', { count: publicIds.length });
            await Promise.all(publicIds.map(id => cloudinary.uploader.destroy(id)));
        } catch (error) {
            this.handleError(error, 'deleteMultiple');
        }
    }
}

export const cloudinaryService = new CloudinaryService();
