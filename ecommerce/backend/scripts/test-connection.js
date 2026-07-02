// Quick connectivity test for Supabase PostgreSQL
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testConnection() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SECRET_KEY');
        process.exit(1);
    }

    console.log('Connecting to Supabase at:', supabaseUrl);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test basic query
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);

    if (error && error.code === '42P01') {
        // Table doesn't exist - that's expected and means the connection works!
        console.log('✅ CONNECTION SUCCESSFUL! Database is reachable.');
        console.log('   (Table not found error is expected - database is empty)');
    } else if (error) {
        console.log('Connection result:', error.message);
        console.log('Error code:', error.code);
    } else {
        console.log('✅ CONNECTION SUCCESSFUL!');
    }
}

testConnection().catch(console.error);
