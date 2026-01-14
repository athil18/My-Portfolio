/**
 * Database Seed Script: 50+ Realistic Products with AI Metadata
 * Run: npx ts-node src/scripts/seedProducts.ts
 */

import mongoose from 'mongoose';
import Product from '../models/product.model';
import env from '../config/env';

// ============ CONFIGURATION ============
const SEED_MARKER = 'SEED_DATA_V1'; // Used to identify seeded data for safe re-runs
const TOTAL_PRODUCTS = 60;

// ============ DATA GENERATORS ============
const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors',
    'Beauty & Health', 'Books & Media', 'Toys & Games', 'Automotive',
    'Food & Beverages', 'Office Supplies', 'Pet Supplies', 'Jewelry'
];

const productTemplates: Record<string, { names: string[]; tags: string[]; priceRange: [number, number] }> = {
    'Electronics': {
        names: ['Wireless Earbuds Pro', 'Smart Watch Ultra', '4K Action Camera', 'Portable Bluetooth Speaker', 'Noise Cancelling Headphones', 'Mini Projector HD', 'USB-C Hub Adapter', 'Mechanical Gaming Keyboard'],
        tags: ['tech', 'gadgets', 'wireless', 'smart', 'premium'],
        priceRange: [29.99, 499.99]
    },
    'Fashion': {
        names: ['Premium Cotton T-Shirt', 'Slim Fit Chinos', 'Leather Crossbody Bag', 'Wool Blend Overcoat', 'Running Sneakers Pro', 'Silk Scarf Collection', 'Denim Jacket Classic', 'Cashmere Sweater'],
        tags: ['clothing', 'style', 'fashion', 'premium', 'comfort'],
        priceRange: [19.99, 299.99]
    },
    'Home & Garden': {
        names: ['Smart LED Bulb Set', 'Ergonomic Office Chair', 'Indoor Plant Collection', 'Memory Foam Mattress Topper', 'Stainless Steel Cookware Set', 'Robot Vacuum Cleaner', 'Bamboo Cutting Board Set', 'Air Purifier HEPA'],
        tags: ['home', 'decor', 'garden', 'comfort', 'smart'],
        priceRange: [14.99, 399.99]
    },
    'Sports & Outdoors': {
        names: ['Yoga Mat Premium', 'Resistance Bands Set', 'Hiking Backpack 40L', 'Camping Tent 4-Person', 'Adjustable Dumbbell Set', 'Running GPS Watch', 'Mountain Bike Helmet', 'Insulated Water Bottle'],
        tags: ['fitness', 'outdoor', 'sports', 'adventure', 'health'],
        priceRange: [12.99, 249.99]
    },
    'Beauty & Health': {
        names: ['Vitamin C Serum', 'Electric Toothbrush Pro', 'Hair Dryer Ionic', 'Skincare Gift Set', 'Massage Gun Deep Tissue', 'Essential Oils Kit', 'LED Face Mask', 'Aromatherapy Diffuser'],
        tags: ['beauty', 'skincare', 'wellness', 'self-care', 'health'],
        priceRange: [9.99, 199.99]
    },
    'Books & Media': {
        names: ['Bestseller Novel Collection', 'Programming Masterclass Book', 'Vinyl Record Player', 'E-Reader Premium', 'Audiobook Subscription Card', 'Art History Encyclopedia', 'Language Learning Kit', 'Photography Guide Book'],
        tags: ['books', 'media', 'education', 'entertainment', 'learning'],
        priceRange: [9.99, 149.99]
    },
    'Toys & Games': {
        names: ['Building Blocks 1000pc', 'Remote Control Drone', 'Board Game Collection', 'Educational STEM Kit', 'Plush Toy Collection', 'Video Game Console Bundle', 'Puzzle 3D Architecture', 'Art Supplies Set Kids'],
        tags: ['toys', 'games', 'kids', 'fun', 'educational'],
        priceRange: [14.99, 299.99]
    },
    'Automotive': {
        names: ['Dash Cam 4K', 'Car Phone Mount', 'Tire Pressure Monitor', 'LED Headlight Upgrade', 'Leather Seat Covers', 'Portable Jump Starter', 'Car Vacuum Cleaner', 'GPS Navigation System'],
        tags: ['automotive', 'car', 'accessories', 'safety', 'tech'],
        priceRange: [19.99, 199.99]
    },
    'Food & Beverages': {
        names: ['Organic Coffee Beans 1kg', 'Gourmet Chocolate Box', 'Premium Tea Collection', 'Protein Powder Whey', 'Olive Oil Extra Virgin', 'Honey Raw Organic', 'Spice Rack Set 20pc', 'Snack Box Subscription'],
        tags: ['food', 'organic', 'gourmet', 'healthy', 'premium'],
        priceRange: [12.99, 89.99]
    },
    'Office Supplies': {
        names: ['Standing Desk Converter', 'Ergonomic Mouse Wireless', 'Notebook Premium Leather', 'Desk Organizer Set', 'Monitor Light Bar', 'Whiteboard Magnetic', 'Pen Set Executive', 'Filing Cabinet Mobile'],
        tags: ['office', 'productivity', 'work', 'organization', 'ergonomic'],
        priceRange: [9.99, 299.99]
    },
    'Pet Supplies': {
        names: ['Automatic Pet Feeder', 'Dog Bed Orthopedic', 'Cat Tree Tower', 'Pet GPS Tracker', 'Grooming Kit Professional', 'Aquarium Starter Kit', 'Bird Cage Deluxe', 'Pet Carrier Airline Approved'],
        tags: ['pets', 'dogs', 'cats', 'animals', 'care'],
        priceRange: [14.99, 179.99]
    },
    'Jewelry': {
        names: ['Sterling Silver Necklace', 'Diamond Stud Earrings', 'Gold Plated Bracelet', 'Minimalist Watch', 'Pearl Ring Set', 'Titanium Wedding Band', 'Gemstone Pendant', 'Leather Cuff Bracelet'],
        tags: ['jewelry', 'accessories', 'luxury', 'gift', 'fashion'],
        priceRange: [29.99, 499.99]
    }
};

const sentiments: ('positive' | 'neutral' | 'negative')[] = ['positive', 'positive', 'positive', 'neutral', 'neutral', 'negative'];
const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'medium', 'high'];
const statuses: ('draft' | 'active' | 'archived')[] = ['active', 'active', 'active', 'active', 'draft', 'archived'];

// ============ HELPER FUNCTIONS ============
function randomFloat(min: number, max: number, decimals = 2): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmbedding(dimensions = 128): number[] {
    return Array.from({ length: dimensions }, () => randomFloat(-1, 1, 4));
}

function generateSKU(category: string, index: number): string {
    const prefix = category.substring(0, 3).toUpperCase();
    return `${prefix}-${Date.now().toString(36).toUpperCase()}-${index.toString().padStart(4, '0')}`;
}

function generateDescription(name: string, category: string, tags: string[]): string {
    const qualityWords = ['premium', 'high-quality', 'professional-grade', 'top-rated', 'best-selling'];
    const benefitPhrases = [
        'designed for maximum comfort and durability',
        'perfect for everyday use',
        'crafted with attention to detail',
        'built to exceed expectations',
        'engineered for optimal performance'
    ];
    return `${randomElement(qualityWords)} ${name} - ${randomElement(benefitPhrases)}. Ideal for ${category.toLowerCase()} enthusiasts. Features: ${tags.slice(0, 3).join(', ')}.`;
}

// ============ PRODUCT GENERATOR ============
interface SeedProduct {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    status: 'draft' | 'active' | 'archived';
    priority: 'low' | 'medium' | 'high';
    category: string;
    tags: string[];
    images: string[];
    stock: number;
    sku: string;
    metadata: {
        seedMarker: string;
        ai_embedding: number[];
        sentiment: 'positive' | 'neutral' | 'negative';
        popularity_score: number;
        keywords: string[];
        generated_at: string;
    };
    isDeleted: boolean;
}

function generateProducts(count: number, adminUserId: mongoose.Types.ObjectId): SeedProduct[] {
    const products: SeedProduct[] = [];

    for (let i = 0; i < count; i++) {
        const category = randomElement(categories);
        const template = productTemplates[category];
        const productName = randomElement(template.names);
        const [minPrice, maxPrice] = template.priceRange;
        const price = randomFloat(minPrice, maxPrice);
        const hasDiscount = Math.random() > 0.7;

        const product: SeedProduct = {
            userId: adminUserId,
            title: `${productName} - Edition ${randomInt(1, 99)}`,
            description: generateDescription(productName, category, template.tags),
            price: price,
            compareAtPrice: hasDiscount ? randomFloat(price * 1.1, price * 1.5) : undefined,
            status: randomElement(statuses),
            priority: randomElement(priorities),
            category: category,
            tags: [...template.tags, SEED_MARKER.toLowerCase()],
            images: [
                `https://picsum.photos/seed/${i + 100}/800/600`,
                `https://picsum.photos/seed/${i + 200}/800/600`,
                `https://picsum.photos/seed/${i + 300}/800/600`
            ],
            stock: randomInt(0, 500),
            sku: generateSKU(category, i),
            metadata: {
                seedMarker: SEED_MARKER,
                ai_embedding: generateEmbedding(128),
                sentiment: randomElement(sentiments),
                popularity_score: randomFloat(0, 1, 4),
                keywords: template.tags.slice(0, 4),
                generated_at: new Date().toISOString()
            },
            isDeleted: false
        };

        products.push(product);
    }

    return products;
}

// ============ MAIN SEEDING FUNCTION ============
async function seedDatabase() {
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║       PRODUCT DATABASE SEEDER v1.0           ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(env.DATABASE_URL);
        console.log('✅ Connected to MongoDB successfully!\n');

        // Create or find admin user ID (using a fixed ObjectId for seeding)
        const adminUserId = new mongoose.Types.ObjectId('000000000000000000000001');
        console.log(`👤 Using Admin User ID: ${adminUserId}\n`);

        // Clear previous seed data (safe re-run)
        console.log('🧹 Clearing previous seed data...');
        const deleteResult = await Product.deleteMany({
            'metadata.seedMarker': SEED_MARKER
        });
        console.log(`   Removed ${deleteResult.deletedCount} old seeded products.\n`);

        // Generate new products
        console.log(`🏭 Generating ${TOTAL_PRODUCTS} products...`);
        const products = generateProducts(TOTAL_PRODUCTS, adminUserId);

        // Insert products
        console.log('💾 Inserting products into database...');
        const insertResult = await Product.insertMany(products);
        console.log(`✅ Successfully inserted ${insertResult.length} products!\n`);

        // Show sample products
        console.log('📦 Sample Products Created:');
        console.log('─'.repeat(50));
        insertResult.slice(0, 5).forEach((p, i) => {
            console.log(`${i + 1}. ${p.title}`);
            console.log(`   Category: ${p.category} | Price: $${p.price} | Stock: ${p.stock}`);
            console.log(`   Sentiment: ${p.metadata.sentiment} | Popularity: ${p.metadata.popularity_score.toFixed(2)}`);
        });
        console.log('─'.repeat(50));

        // Statistics
        const stats = {
            total: insertResult.length,
            byCategory: categories.map(cat => ({
                category: cat,
                count: insertResult.filter(p => p.category === cat).length
            })).filter(c => c.count > 0),
            avgPrice: (insertResult.reduce((sum, p) => sum + p.price, 0) / insertResult.length).toFixed(2),
            activeCount: insertResult.filter(p => p.status === 'active').length
        };

        console.log('\n📊 Seed Statistics:');
        console.log(`   Total Products: ${stats.total}`);
        console.log(`   Active Products: ${stats.activeCount}`);
        console.log(`   Average Price: $${stats.avgPrice}`);
        console.log('\n   Products by Category:');
        stats.byCategory.forEach(c => {
            console.log(`   • ${c.category}: ${c.count}`);
        });

        console.log('\n✅ Database seeding completed successfully!');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB.\n');
    }
}

// Run the seeder
seedDatabase();
