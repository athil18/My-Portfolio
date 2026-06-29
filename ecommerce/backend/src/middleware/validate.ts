import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = schema.parse(req[source]);
            req[source] = data;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');

                return res.status(400).json({
                    success: false,
                    message: `Validation failed: ${errorMessages}`,
                    errors: formattedErrors,
                });
            }
            next(error);
        }
    };
};
