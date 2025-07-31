/**
 * Database Migration: Apply analysis_mode support
 * 
 * Run this script to add the analysis_mode field and other missing fields
 * to the database schema.
 * 
 * Usage: node scripts/apply-analysis-mode-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Starting analysis_mode migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../sql/schema_migration_analysis_mode.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements (basic split by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Try alternative approach using direct query
            const { error: directError } = await supabase
              .from('information_schema.tables')
              .select('*')
              .limit(1);
            
            if (directError) {
              console.warn(`⚠️ Could not execute statement ${i + 1}: ${error.message}`);
              console.log(`Statement: ${statement.substring(0, 100)}...`);
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (execError) {
          console.warn(`⚠️ Error executing statement ${i + 1}: ${execError.message}`);
          console.log(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }
    
    // Verify the migration
    console.log('🔍 Verifying migration...');
    
    // Check if analysis_mode column exists
    const { data: wordColumns, error: wordError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'english_reading_word_queries')
      .eq('column_name', 'analysis_mode');
    
    if (wordError) {
      console.error('❌ Could not verify word queries table:', wordError.message);
    } else if (wordColumns && wordColumns.length > 0) {
      console.log('✅ analysis_mode column exists in english_reading_word_queries');
    } else {
      console.log('⚠️ analysis_mode column not found in english_reading_word_queries');
    }
    
    // Check sentence queries table
    const { data: sentenceColumns, error: sentenceError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'english_reading_sentence_queries')
      .eq('column_name', 'analysis_mode');
    
    if (sentenceError) {
      console.error('❌ Could not verify sentence queries table:', sentenceError.message);
    } else if (sentenceColumns && sentenceColumns.length > 0) {
      console.log('✅ analysis_mode column exists in english_reading_sentence_queries');
    } else {
      console.log('⚠️ analysis_mode column not found in english_reading_sentence_queries');
    }
    
    console.log('🎉 Migration process completed!');
    console.log('');
    console.log('📋 Manual steps (if automatic migration failed):');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of sql/schema_migration_analysis_mode.sql');
    console.log('4. Execute the SQL commands');
    console.log('');
    console.log('🔗 Alternative: Use the Supabase CLI:');
    console.log('   supabase db reset (if using local development)');
    console.log('   or apply the migration manually via Dashboard');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('');
    console.log('📋 Manual fallback:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of sql/schema_migration_analysis_mode.sql');
    console.log('4. Execute the SQL commands');
  }
}

// Run the migration
applyMigration();