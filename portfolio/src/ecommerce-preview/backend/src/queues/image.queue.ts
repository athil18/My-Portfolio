import { createQueue } from './config';

export const imageQueue = createQueue('image-queue');

export const addImageJob = (data: {
    fileId: string;
    buffer: Buffer;
    folder: string;
    basePublicId: string;
}) => {
    return imageQueue.add('optimize', data);
};
