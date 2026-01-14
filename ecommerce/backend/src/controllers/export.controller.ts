import { Request, Response } from 'express';
import * as exportService from '../services/export.service';

/**
 * Export data to CSV/JSON
 */
export const exportData = async (req: Request, res: Response) => {
    try {
        const { entity } = req.params;
        const { format = 'csv', ...query } = req.query;

        const data = await exportService.getEntityData(entity, query);

        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=${exportService.generateExportFilename(entity, 'json')}`);
            return res.json(data);
        }

        // Default to CSV
        const csv = exportService.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${exportService.generateExportFilename(entity, 'csv')}`);
        res.status(200).send(csv);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Export failed',
        });
    }
};
