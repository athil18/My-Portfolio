/**
 * Simple Product Seeder - Essential E-commerce Data Only
 * Run: npx ts-node --transpile-only src/scripts/seedSimpleProducts.ts
 */

import mongoose from 'mongoose';
import Product from '../models/product.model';
import env from '../config/env';

const TOTAL_PRODUCTS = 50;

const productData = {
    'Electronics': [
        { name: 'Wireless Bluetooth Earbuds', price: 79.99, stock: 150 },
        { name: 'Smart Watch Series 5', price: 249.99, stock: 80 },
        { name: '4K Ultra HD Action Camera', price: 199.99, stock: 45 },
        { name: 'Portable Bluetooth Speaker', price: 49.99, stock: 200 },
        { name: 'Noise Cancelling Headphones', price: 299.99, stock: 60 },
        { name: 'Wireless Charging Pad', price: 29.99, stock: 300 },
        { name: 'USB-C Hub 7-in-1', price: 45.99, stock: 120 },
        { name: 'Mechanical Gaming Keyboard', price: 129.99, stock: 90 },
    ],
    'Clothing': [
        { name: 'Classic Fit Cotton T-Shirt', price: 24.99, stock: 500 },
        { name: 'Slim Fit Denim Jeans', price: 59.99, stock: 200 },
        { name: 'Leather Belt Premium', price: 39.99, stock: 150 },
        { name: 'Running Sneakers Pro', price: 89.99, stock: 180 },
        { name: 'Wool Winter Jacket', price: 149.99, stock: 75 },
        { name: 'Cotton Hoodie Unisex', price: 49.99, stock: 250 },
    ],
    'Home & Garden': [
        { name: 'Smart LED Light Bulb 4-Pack', price: 34.99, stock: 400 },
        { name: 'Ergonomic Office Chair', price: 279.99, stock: 50 },
        { name: 'Memory Foam Pillow Set', price: 49.99, stock: 200 },
        { name: 'Stainless Steel Cookware Set', price: 129.99, stock: 80 },
        { name: 'Robot Vacuum Cleaner', price: 299.99, stock: 40 },
        { name: 'Indoor Plant Pot Set', price: 29.99, stock: 300 },
    ],
    'Sports': [
        { name: 'Yoga Mat Non-Slip', price: 29.99, stock: 350 },
        { name: 'Resistance Bands Set', price: 19.99, stock: 400 },
        { name: 'Adjustable Dumbbell 25lb', price: 149.99, stock: 60 },
        { name: 'Running GPS Watch', price: 199.99, stock: 70 },
        { name: 'Insulated Water Bottle 32oz', price: 24.99, stock: 500 },
        { name: 'Exercise Bike Indoor', price: 349.99, stock: 25 },
    ],
    'Books': [
        { name: 'JavaScript: The Complete Guide', price: 39.99, stock: 150 },
        { name: 'Cooking Made Simple Cookbook', price: 24.99, stock: 200 },
        { name: 'Business Strategy Handbook', price: 29.99, stock: 180 },
        { name: 'Self-Improvement Collection', price: 19.99, stock: 250 },
    ],
    'Toys': [
        { name: 'Building Blocks 500 Pieces', price: 34.99, stock: 200 },
        { name: 'Remote Control Car', price: 49.99, stock: 150 },
        { name: 'Educational STEM Kit', price: 59.99, stock: 100 },
        { name: 'Board Game Family Pack', price: 29.99, stock: 180 },
    ],
    'Other': [
        { name: 'Premium Coffee Beans 1kg', price: 29.99, stock: 300 },
        { name: 'Organic Green Tea Set', price: 19.99, stock: 250 },
        { name: 'Vitamin C Skincare Serum', price: 34.99, stock: 200 },
        { name: 'Electric Toothbrush Pro', price: 79.99, stock: 150 },
        { name: 'Leather Wallet Bifold', price: 49.99, stock: 200 },
        { name: 'Sunglasses UV Protection', price: 39.99, stock: 180 },
    ],
};

const imagesByCategory: Record<string, string[]> = {
    'Electronics': [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
    ],
    'Clothing': [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
    ],
    'Home & Garden': [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
        'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
    ],
    'Sports': [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
        'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800',
    ],
    'Books': [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    ],
    'Toys': [
        'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800',
        'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800',
    ],
    'Other': [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800',
    ],
};

async function seedProducts() {
    console.log('\n🛍️ Simple Product Seeder\n');

    try {
        await mongoose.connect(env.DATABASE_URL);
        console.log('✅ Connected to MongoDB\n');

        const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');

        console.log('🧹 Clearing existing products...');
        await Product.deleteMany({});
        console.log('   Done.\n');

        const products: any[] = [];
        let productIndex = 0;

        for (const [category, items] of Object.entries(productData)) {
            const images = imagesByCategory[category] || imagesByCategory['Other'];

            for (const item of items) {
                products.push({
                    userId,
                    title: item.name,
                    description: `High-quality ${item.name.toLowerCase()}. Perfect for everyday use.`,
                    price: item.price,
                    compareAtPrice: Math.random() > 0.7 ? Math.round(item.price * 1.3 * 100) / 100 : undefined,
                    status: 'active',
                    category,
                    tags: [category.toLowerCase().replace(/ & /g, '-')],
                    images: [images[productIndex % images.length]],
                    stock: item.stock,
                    sku: `SKU-${category.substring(0, 3).toUpperCase()}-${String(productIndex + 1).padStart(4, '0')}`,
                    isDeleted: false,
                });
                productIndex++;
            }
        }

        console.log(`📦 Inserting ${products.length} products...`);
        await Product.insertMany(products);
        console.log(`✅ Successfully added ${products.length} products!\n`);

        console.log('📊 Products by Category:');
        for (const category of Object.keys(productData)) {
            const count = products.filter(p => p.category === category).length;
            console.log(`   • ${category}: ${count}`);
        }

        console.log('\n✅ Seeding complete!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected.\n');
    }
}

seedProducts();
