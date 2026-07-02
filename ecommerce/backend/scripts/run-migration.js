// Execute SQL migration against Supabase PostgreSQL via REST API
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function executeMigration() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SECRET_KEY');
        process.exit(1);
    }

    const sqlPath = path.join(__dirname, '..', '..', 'supabase', 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📦 Reading migration file:', sqlPath);
    console.log(`📏 SQL size: ${(sql.length / 1024).toFixed(1)} KB`);
    console.log('🚀 Executing migration against:', supabaseUrl);
    console.log('');

    // Use Supabase's REST RPC to execute raw SQL via pg_net or the SQL endpoint
    // We'll use the PostgREST rpc endpoint with a helper function, or direct pg
    // Since we need DDL, we'll use the Supabase Management API
    
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    
    // Execute via the Supabase SQL query endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });

    // PostgREST can't run DDL, so we'll connect directly via pg
    console.log('PostgREST cannot run DDL statements.');
    console.log('Switching to direct PostgreSQL connection...');
    console.log('');

    // Use the pg library for direct connection
    let pg;
    try {
        pg = require('pg');
    } catch (e) {
        console.log('pg module not found. Installing...');
        const { execSync } = require('child_process');
        execSync('npm install pg', { stdio: 'inherit' });
        pg = require('pg');
    }

    const { Client } = pg;
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL directly');
        console.log('');

        // Execute the full migration as a single transaction
        await client.query('BEGIN');
        console.log('📝 Transaction started');

        // Split into individual statements and execute
        // We need to handle multi-line statements properly
        const statements = splitSQLStatements(sql);
        let successCount = 0;
        let skipCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i].trim();
            if (!stmt || stmt.startsWith('--')) continue;

            try {
                await client.query(stmt);
                successCount++;
                // Log progress every 10 statements
                if (successCount % 10 === 0) {
                    console.log(`   ✅ Executed ${successCount} statements...`);
                }
            } catch (err) {
                if (err.code === '42710' || err.code === '42P07') {
                    // Type or table already exists - skip
                    skipCount++;
                    console.log(`   ⏭️  Skipped (already exists): ${stmt.substring(0, 60)}...`);
                } else {
                    console.error(`   ❌ Error on statement ${i + 1}:`);
                    console.error(`      SQL: ${stmt.substring(0, 100)}...`);
                    console.error(`      Error: ${err.message}`);
                    await client.query('ROLLBACK');
                    console.error('');
                    console.error('🔴 MIGRATION ROLLED BACK');
                    process.exit(1);
                }
            }
        }

        await client.query('COMMIT');
        console.log('');
        console.log('═══════════════════════════════════════════');
        console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
        console.log(`   ✅ Statements executed: ${successCount}`);
        console.log(`   ⏭️  Statements skipped: ${skipCount}`);
        console.log('═══════════════════════════════════════════');

        // Verify tables were created
        console.log('');
        console.log('📊 Verifying created tables...');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        console.log(`   Found ${tablesResult.rows.length} tables:`);
        tablesResult.rows.forEach(row => {
            console.log(`   📋 ${row.table_name}`);
        });

        // Verify indexes
        const indexResult = await client.query(`
            SELECT count(*) as count 
            FROM pg_indexes 
            WHERE schemaname = 'public'
        `);
        console.log(`   📇 ${indexResult.rows[0].count} indexes created`);

        // Verify RLS policies
        const policyResult = await client.query(`
            SELECT count(*) as count 
            FROM pg_policies 
            WHERE schemaname = 'public'
        `);
        console.log(`   🔐 ${policyResult.rows[0].count} RLS policies created`);

        // Verify triggers
        const triggerResult = await client.query(`
            SELECT count(*) as count 
            FROM information_schema.triggers 
            WHERE trigger_schema = 'public'
        `);
        console.log(`   ⚡ ${triggerResult.rows[0].count} triggers created`);

    } catch (err) {
        console.error('❌ Connection/execution error:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

function splitSQLStatements(sql) {
    // Remove single-line comments but preserve strings
    const lines = sql.split('\n');
    const cleanLines = [];
    let inFunction = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('--')) continue;
        cleanLines.push(line);
    }

    const cleanSQL = cleanLines.join('\n');

    // Split on semicolons, but respect $$ delimiters for functions
    const statements = [];
    let current = '';
    let inDollarQuote = false;

    for (let i = 0; i < cleanSQL.length; i++) {
        const char = cleanSQL[i];
        const next = cleanSQL[i + 1];

        if (char === '$' && next === '$') {
            inDollarQuote = !inDollarQuote;
            current += '$$';
            i++; // skip next $
            continue;
        }

        if (char === ';' && !inDollarQuote) {
            const stmt = current.trim();
            if (stmt.length > 0) {
                statements.push(stmt + ';');
            }
            current = '';
            continue;
        }

        current += char;
    }

    // Don't forget the last statement if it doesn't end with ;
    const last = current.trim();
    if (last.length > 0) {
        statements.push(last);
    }

    return statements;
}

executeMigration().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
