import { IProduct } from '../models/product.model';

/**
 * AI Service for Vector-based similarity and metadata analysis
 */
export class AIService {
    /**
     * Calculates cosine similarity between two vectors
     */
    static cosineSimilarity(vecA: number[], vecB: number[]): number {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
        if (magnitude === 0) return 0;

        return dotProduct / magnitude;
    }

    /**
     * Ranks products by similarity to a target product's embedding
     */
    static getSimilarProducts(targetProduct: IProduct, allProducts: IProduct[], limit = 5): IProduct[] {
        if (!targetProduct.metadata?.ai_embedding) return [];

        const targetVector = targetProduct.metadata.ai_embedding;

        const ranked = allProducts
            .filter(p => p._id.toString() !== targetProduct._id.toString())
            .map(product => {
                const score = this.cosineSimilarity(
                    targetVector,
                    product.metadata?.ai_embedding || []
                );
                return { product, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.product);

        return ranked;
    }
}
