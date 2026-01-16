/**
 * Admin User Seeder
 * Run: npx ts-node src/scripts/seedAdmin.ts
 */

import mongoose from 'mongoose';
import User from '../models/user.model';
import env from '../config/env';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Admin123!';
const ADMIN_NAME = 'System Admin';

async function seedAdmin() {
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║           ADMIN USER SEEDER v1.0             ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(env.DATABASE_URL);
        console.log('✅ Connected successfully!\n');

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

        if (existingAdmin) {
            console.log(`⚠️  User ${ADMIN_EMAIL} already exists.`);
            existingAdmin.role = 'admin';
            existingAdmin.emailVerified = true;
            existingAdmin.isActive = true;
            existingAdmin.password = ADMIN_PASSWORD;
            await existingAdmin.save();
            console.log('✅ Updated existing user to Admin Role with default password.\n');
        } else {
            console.log(`👤 Creating new admin user: ${ADMIN_EMAIL}...`);
            const newAdmin = await User.create({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                name: ADMIN_NAME,
                role: 'admin',
                emailVerified: true,
                isActive: true
            });
            console.log(`✅ Successfully created admin user: ${newAdmin.id}\n`);
        }

        console.log('🔑 ADMIN CREDENTIALS:');
        console.log('────────────────────────────────────────');
        console.log(`   Email:    ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log('────────────────────────────────────────');
        console.log('⚠️  Please change this password immediately after login!\n');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected.');
    }
}

seedAdmin();
