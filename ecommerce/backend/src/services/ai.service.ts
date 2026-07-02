

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
    static getSimilarProducts(targetProduct: any, allProducts: any[], limit = 5): any[] {
        if (!targetProduct.metadata?.ai_embedding) return [];

        const targetVector = targetProduct.metadata.ai_embedding;

        const ranked = allProducts
            .filter(p => p.id !== targetProduct.id)
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

    /**
     * Generates a deterministic mock embedding locally (unit length normalized)
     */
    static generateDeterministicMockEmbedding(text: string, dimensions = 128): number[] {
        const hash = (str: string) => {
            let h = 0;
            for (let i = 0; i < str.length; i++) {
                h = (h << 5) - h + str.charCodeAt(i);
                h |= 0;
            }
            return h;
        };

        const result: number[] = [];
        const baseHash = hash(text);

        for (let i = 0; i < dimensions; i++) {
            const val = Math.sin(baseHash + i * 2.718);
            result.push(val);
        }

        const magnitude = Math.sqrt(result.reduce((sum, v) => sum + v * v, 0));
        return magnitude === 0 ? result : result.map(v => v / magnitude);
    }

    /**
     * Dynamically generates a vector embedding via Gemini API (with local fallback if offline)
     */
    static async generateProductEmbedding(title: string, description = ''): Promise<number[]> {
        const apiKey = process.env.GEMINI_API_KEY;
        const text = `${title} ${description}`.trim();

        if (!apiKey) {
            console.log(`[AI] GEMINI_API_KEY not configured. Falling back to local deterministic embedding.`);
            return this.generateDeterministicMockEmbedding(text);
        }

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "models/text-embedding-004",
                    content: { parts: [{ text }] }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API returned status ${response.status}`);
            }

            const result = await response.json();
            const values = result?.embedding?.values;

            if (Array.isArray(values)) {
                console.log(`[AI] Generated vector embedding via Gemini API successfully (${values.length} dimensions).`);
                return values;
            }

            throw new Error('Invalid response structure from Gemini API');
        } catch (error) {
            console.error('[AI] Gemini API embedding generation failed, falling back to local generator:', error);
            return this.generateDeterministicMockEmbedding(text);
        }
    }
}
