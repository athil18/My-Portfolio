/**
 * Premium Unique & Diverse Product Seeder
 * Generates 150+ high-quality products with realistic Unsplash images.
 */

import mongoose from 'mongoose';
import Product from '../models/product.model';
import env from '../config/env';

const TOTAL_PRODUCTS = 150;

const categories = [
    'Electronics', 'Fashion', 'Home & Living', 'Sports', 'Wellness',
    'Gaming', 'Automotive', 'Photography', 'Outdoor', 'Office',
    'Music', 'Kitchen'
];

const categoryImages: Record<string, string[]> = {
    'Electronics': [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
        'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'
    ],
    'Fashion': [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
        'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800'
    ],
    'Home & Living': [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
        'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800'
    ],
    'Sports': [
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'
    ],
    'Wellness': [
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        'https://images.unsplash.com/photo-1552046122-03184de85ec0?w=800',
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800'
    ],
    'Gaming': [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
        'https://images.unsplash.com/photo-1593305841991-05c237ba8265?w=800'
    ],
    'Automotive': [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
        'https://images.unsplash.com/photo-1583121274602-3e247165a4bb?w=800'
    ],
    'Photography': [
        'https://images.unsplash.com/photo-1516035069371-29a1b24473a1?w=800',
        'https://images.unsplash.com/photo-1526170315835-fdf01438210f?w=800',
        'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800'
    ],
    'Outdoor': [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
        'https://images.unsplash.com/photo-1533675116905-f0637308d9be?w=800',
        'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800'
    ],
    'Office': [
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800'
    ],
    'Music': [
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
        'https://images.unsplash.com/photo-1510915228340-29c85a430c15?w=800',
        'https://images.unsplash.com/photo-1514525253361-b59fe599a53c?w=800'
    ],
    'Kitchen': [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
        'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800',
        'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=800'
    ]
};

const dataPool: Record<string, { nouns: string[], adjectives: string[], features: string[] }> = {
    'Electronics': {
        nouns: ['Smartphone', 'Tablet', 'Laptop', 'Earbuds', 'Charger', 'Powerbank', 'Smart TV', 'Drone'],
        adjectives: ['Ultra', 'Pro', 'Neo', 'Quantum', 'Stealth', 'Hyper', 'Elite', 'Titan'],
        features: ['with 5G', 'Waterproof', 'Noise-Cancelling', 'High-Speed', 'Ultra-Slim', 'Foldable']
    },
    'Fashion': {
        nouns: ['Hoodie', 'Sneakers', 'Jacket', 'Watch', 'Sunglasses', 'T-shirt', 'Backpack', 'Scarf'],
        adjectives: ['Urban', 'Classy', 'Vogue', 'Minimal', 'Street', 'Eco', 'Legacy', 'Pinnacle'],
        features: ['Cotton', 'Leather', 'Water-resistant', 'Breathable', 'Recycled', 'Limited Edition']
    },
    'Home & Living': {
        nouns: ['Lamp', 'Chair', 'Vase', 'Curtain', 'Clock', 'Mirrors', 'Cushion', 'Rug'],
        adjectives: ['Nordic', 'Modern', 'Rustic', 'Boho', 'Sleek', 'Cozy', 'Zen', 'Artisan'],
        features: ['Handcrafted', 'Sustainable', 'Vintage', 'Minimalist', 'Linen', 'Ceramic']
    },
    'Sports': {
        nouns: ['Dumbbell', 'Yoga Mat', 'Bike', 'Racket', 'Ball', 'Helmet', 'Gloves', 'Jersey'],
        adjectives: ['Turbo', 'Aero', 'Stamina', 'Peak', 'Agile', 'Vigor', 'Endure', 'Swift'],
        features: ['Professional', 'Lightweight', 'Anti-slip', 'Heavy-duty', 'Ergonomic', 'All-weather']
    }
};

const genericData = {
    nouns: ['Essential', 'Kit', 'Bundle', 'Pack', 'Collection', 'System', 'Gear', 'Set'],
    adjectives: ['Premium', 'Deluxe', 'Advanced', 'New', 'Classic', 'Original', 'Top', 'Master'],
    features: ['Professional', 'Custom', 'Versatile', 'Durable', 'High-quality', 'Portable']
};

function getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
    console.log('🚀 Starting Premium Unique Product Seeder...');

    try {
        await mongoose.connect(env.DATABASE_URL);
        console.log('✅ Connected to MongoDB.');

        console.log('🧹 Wiping all existing products...');
        await Product.deleteMany({});
        console.log('✨ Database is now clean.');

        const adminUserId = new mongoose.Types.ObjectId('000000000000000000000001');
        const products: any[] = [];
        const usedTitles = new Set();

        for (let i = 0; i < TOTAL_PRODUCTS; i++) {
            const category = getRandom(categories);
            const pool = dataPool[category] || genericData;

            let title = '';
            let attempts = 0;

            do {
                const adj = getRandom(pool.adjectives || genericData.adjectives);
                const noun = getRandom(pool.nouns || genericData.nouns);
                const feature = getRandom(pool.features || genericData.features);
                title = `${adj} ${noun} ${feature}`;
                if (attempts++ > 20) title += ` - V${i}`;
            } while (usedTitles.has(title));

            usedTitles.add(title);

            const price = parseFloat((Math.random() * 200 + 10).toFixed(2));
            const categoryPool = categoryImages[category] || categoryImages['Electronics'];

            products.push({
                userId: adminUserId,
                title,
                description: `Experience the difference with our ${title}. Built with precision and designed for excellence in ${category}. Premium build quality guaranteed.`,
                price,
                compareAtPrice: Math.random() > 0.6 ? parseFloat((price * 1.4).toFixed(2)) : undefined,
                status: 'active',
                priority: getRandom(['low', 'medium', 'high']),
                category,
                tags: [category.toLowerCase(), 'premium'],
                images: [
                    `${categoryPool[i % categoryPool.length]}&sig=${i}`,
                    `${categoryPool[(i + 1) % categoryPool.length]}&sig=${i + 100}`
                ],
                stock: Math.floor(Math.random() * 500) + 1,
                sku: `SKU-${category.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(7).toUpperCase()}-${i}`,
                metadata: {
                    seeder: 'PremiumDiverseV2',
                    generatedAt: new Date().toISOString()
                },
                isDeleted: false
            });
        }

        console.log(`📦 Inserting ${products.length} premium products...`);
        await Product.insertMany(products);
        console.log('✅ Success! Your store is now filled with high-quality, unique products.');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected.');
    }
}

seed();
