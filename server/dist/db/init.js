"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDB = initDB;
require("dotenv/config");
const supabase_1 = require("./supabase");
async function initDB() {
    try {
        // Test Supabase connection by querying profiles
        const { error } = await supabase_1.supabase.from('profiles').select('count').limit(1);
        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            console.error('   Check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env');
            console.error('   Also ensure you have run supabase/schema.sql in your Supabase SQL editor.');
            process.exit(1);
        }
        console.log('✅ Supabase database connected successfully');
    }
    catch (err) {
        console.error('❌ Failed to connect to Supabase:', err.message);
        process.exit(1);
    }
}
