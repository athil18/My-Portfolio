import mongoose from 'mongoose';
import User from '../models/user.model';
import env from '../config/env';

const TEST_USER_ID = '507f1f77bcf86cd799439011';
const TEST_USER = {
    _id: new mongoose.Types.ObjectId(TEST_USER_ID),
    email: 'testuser@demo.com',
    password: 'TestPassword123!',
    name: 'Mhd Aathil',
    role: 'admin' as const,
    isActive: true,
    emailVerified: true,
    twoFactorEnabled: false,
};

export async function seedTestUser(): Promise<void> {
    try {
        // Create or update test user
        const user = await User.findByIdAndUpdate(
            TEST_USER_ID,
            TEST_USER,
            { new: true, upsert: true }
        );

        console.log('🎉 Test user created/updated successfully!');
        console.log('   Email:', TEST_USER.email);
        console.log('   Password:', TEST_USER.password);
        console.log('   ID:', TEST_USER_ID);
        console.log('   Role:', TEST_USER.role);
    } catch (error) {
        // If it's a duplicate key error, the user already exists
        if ((error as any).code === 11000) {
            console.log('✅ Test user already exists (duplicate email)');
            return;
        }
        console.error('❌ Failed to seed test user:', error);
    }
}

// Run directly if this file is executed
if (require.main === module) {
    mongoose.connect(env.DATABASE_URL)
        .then(async () => {
            console.log('Connected to MongoDB');
            await seedTestUser();
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
            process.exit(0);
        })
        .catch((err) => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        });
}
