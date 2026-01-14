import { Parser } from '@json2csv/plainjs';

/**
 * Convert JSON data to CSV
 */
export const convertToCSV = (data: any[], fields?: string[]): string => {
    const parser = new Parser({ fields });
    return parser.parse(data);
};

/**
 * Generate a filename for export
 */
export const generateExportFilename = (entity: string, format: 'csv' | 'json'): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${entity}_export_${timestamp}.${format}`;
};

/**
 * Entities allowed for export mapping
 */
export const getEntityData = async (entity: string, query: any = {}): Promise<any[]> => {
    // This would typically involve dynamically importing models or using a registry
    // For now, let's keep it simple with a switch case for the main entities

    // NOTE: This should be expanded as needed
    switch (entity.toLowerCase()) {
        case 'users':
            return await (await import('../models/user.model')).default.find(query).select('-password');
        case 'products':
            return await (await import('../models/product.model')).default.find(query);
        case 'orders':
            return await (await import('../models/order.model')).default.find(query);
        case 'notifications':
            return await (await import('../models/notification.model')).default.find(query);
        case 'analytics':
            return await (await import('../models/analyticsEvent.model')).default.find(query);
        default:
            throw new Error(`Export not supported for entity: ${entity}`);
    }
};
