import { Parser } from '@json2csv/plainjs';
import { supabaseAdmin } from '../config/supabase';

/**
 * EXPORT SERVICE — Supabase PostgreSQL Migration
 */

export const convertToCSV = (data: any[], fields?: string[]): string => {
    const parser = new Parser({ fields });
    return parser.parse(data);
};

export const generateExportFilename = (entity: string, format: 'csv' | 'json'): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${entity}_export_${timestamp}.${format}`;
};

export const getEntityData = async (entity: string, query: any = {}): Promise<any[]> => {
    let tableName = '';

    switch (entity.toLowerCase()) {
        case 'users':
            tableName = 'profiles';
            break;
        case 'products':
            tableName = 'products';
            break;
        case 'orders':
            tableName = 'orders';
            break;
        case 'notifications':
            tableName = 'notifications';
            break;
        case 'analytics':
            tableName = 'analytics_events';
            break;
        default:
            throw new Error(`Export not supported for entity: ${entity}`);
    }

    let supabaseQuery = supabaseAdmin
        .from(tableName)
        .select('*');

    // Basic map of query params to Supabase equality filters
    // A robust version would translate MongoDB syntax to PostgREST syntax
    for (const [key, value] of Object.entries(query)) {
        if (typeof value !== 'object') {
            supabaseQuery = supabaseQuery.eq(key, value);
        }
    }

    const { data, error } = await supabaseQuery;

    if (error) {
        throw new Error(`Failed to fetch data for ${entity}`);
    }

    return data || [];
};
