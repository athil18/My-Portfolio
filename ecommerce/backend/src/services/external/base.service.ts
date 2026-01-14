import env from '../../config/env';

/**
 * Abstract Base Service for external API integrations
 */
export abstract class BaseExternalService {
    protected abstract readonly serviceName: string;

    /**
     * Log service interactions
     */
    protected log(message: string, data?: any) {
        if (env.NODE_ENV === 'development') {
            console.log(`[${this.serviceName}] ${message}`, data || '');
        }
    }

    /**
     * Handle service errors consistently
     */
    protected handleError(error: any, operation: string): never {
        const errorMessage = error.message || 'Unknown error';
        console.error(`[${this.serviceName}] Error during ${operation}:`, errorMessage);

        // Wrap or rethrow based on strategy
        throw new Error(`${this.serviceName} ${operation} failed: ${errorMessage}`);
    }
}
