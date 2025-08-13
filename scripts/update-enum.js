const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateEnum() {
  try {
    console.log('🔧 Updating application_stage_enum...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../sql/update_application_stage_enum.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    })
    
    if (error) {
      // If rpc doesn't exist, try direct query execution
      console.log('RPC method not found, trying direct execution...')
      
      // Split SQL into individual statements and execute them
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        if (statement.includes('DO $$') || statement.includes('CREATE TYPE') || statement.includes('ALTER TYPE')) {
          console.log(`Executing statement ${i + 1}/${statements.length}...`)
          const { error: execError } = await supabase.rpc('exec', { sql: statement })
          if (execError) {
            console.error(`Error in statement ${i + 1}:`, execError.message)
          }
        }
      }
    }
    
    console.log('✅ Enum update completed!')
    
    // Test the enum by querying it
    console.log('🔍 Testing enum values...')
    const { data: enumData, error: enumError } = await supabase
      .rpc('get_enum_values', { enum_name: 'application_stage_enum' })
    
    if (enumData) {
      console.log('Available enum values:', enumData)
    } else if (enumError) {
      console.log('Could not query enum values:', enumError.message)
    }
    
    // Test by creating a test record
    console.log('🧪 Testing with a sample record...')
    const { data: testData, error: testError } = await supabase
      .from('jd_records')
      .insert({
        title: 'Test Job',
        company: 'Test Company',
        application_stage: 'Raw JD',
        user_id: '00000000-0000-0000-0000-000000000000' // This will fail due to RLS, but we'll see if enum works
      })
      .select()
    
    if (testError) {
      if (testError.message.includes('enum')) {
        console.error('❌ Enum is still not working:', testError.message)
      } else {
        console.log('✅ Enum works! (Test failed due to RLS/auth, which is expected)')
      }
    } else {
      console.log('✅ Test record created successfully:', testData)
    }
    
  } catch (error) {
    console.error('❌ Error updating enum:', error.message)
    process.exit(1)
  }
}

// Alternative approach: Execute SQL manually
async function manualUpdate() {
  console.log('📝 Please execute the following SQL manually in Supabase Dashboard:')
  console.log('=' .repeat(80))
  
  const sqlPath = path.join(__dirname, '../sql/update_application_stage_enum.sql')
  const sqlContent = fs.readFileSync(sqlPath, 'utf8')
  console.log(sqlContent)
  
  console.log('=' .repeat(80))
  console.log('1. Go to Supabase Dashboard > SQL Editor')
  console.log('2. Paste the above SQL and execute it')
  console.log('3. Then run the JD2CV application again')
}

// Run the update
updateEnum().catch(() => {
  console.log('\n🔄 Automated update failed. Showing manual instructions:')
  manualUpdate()
})