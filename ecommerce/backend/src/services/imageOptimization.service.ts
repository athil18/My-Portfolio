import sharp from 'sharp';

export interface OptimizedImage {
  buffer: Buffer;
  width: number;
  height: number;
}

export interface ImageSizes {
  thumbnail: OptimizedImage;
  medium: OptimizedImage;
  large: OptimizedImage;
}

/**
 * Optimize a single image to WebP format
 */
const optimizeImage =  async (
  buffer: Buffer,
  width: number,
  height: number,
  quality: number = 80
): Promise<OptimizedImage> => {
  const optimized = await sharp(buffer)
    .resize(width, height, {
      fit: 'inside', // Maintain aspect ratio
      withoutEnlargement: true, // Don't upscale
    })
    .webp({ quality })
    .toBuffer();

  const metadata = await sharp(optimized).metadata();

  return {
    buffer: optimized,
    width: metadata.width || width,
    height: metadata.height || height,
  };
};

/**
 * Create a square thumbnail with center crop
 */
export const createThumbnail = async (buffer: Buffer, size: number = 200): Promise<OptimizedImage> => {
  const optimized = await sharp(buffer)
    .resize(size, size, {
      fit: 'cover', // Crop to fill square
      position: 'center',
    })
    .webp({ quality: 80 })
    .toBuffer();

  return {
    buffer: optimized,
    width: size,
    height: size,
  };
};

/**
 * Generate all required image sizes (thumbnail, medium, large)
 */
export const generateImageSizes = async (buffer: Buffer): Promise<ImageSizes> => {
  const [thumbnail, medium, large] = await Promise.all([
    createThumbnail(buffer, 200), // 200x200 square
    optimizeImage(buffer, 800, 800, 80), // Max 800x800
    optimizeImage(buffer, 1200, 1200, 80), // Max 1200x1200
  ]);

  return {
    thumbnail,
    medium,
    large,
  };
};

/**
 * Check if a file is an image based on mimetype
 */
export const isImage = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};
