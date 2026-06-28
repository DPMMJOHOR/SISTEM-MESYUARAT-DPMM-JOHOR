// ============================================================
// USER MIGRATION SCRIPT: Migrate DPMM_USERS to Supabase Auth
// Run with: node scripts/auth-migration.js
// Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function migrateUsers() {
  console.log('Starting user migration to Supabase Auth...\n');

  try {
    // Step 1: Fetch existing users from DPMM_USERS
    const { data: existingUsers, error: fetchError } = await supabase
      .from('DPMM_USERS')
      .select('*');

    if (fetchError) {
      throw new Error(`Failed to fetch users: ${fetchError.message}`);
    }

    console.log(`Found ${existingUsers.length} users to migrate\n`);

    // Step 2: Migrate each user to Supabase Auth
    let successCount = 0;
    let errorCount = 0;

    for (const user of existingUsers) {
      try {
        // Check if user already exists in auth.users
        const { data: existingAuthUser } = await supabase.auth.admin.getUserById(user.user_id);
        
        if (existingAuthUser) {
          console.log(`⏭️  Skipping ${user.user_id} - already exists in auth`);
          continue;
        }

        // Create user in Supabase Auth
        const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.user_id,
          password: user.kata_laluan,
          email_confirm: true,
          user_metadata: {
            full_name: user.nama,
            role: user.peranan,
            active: user.aktif
          }
        });

        if (createError) {
          console.error(`❌ Failed to create user ${user.user_id}: ${createError.message}`);
          errorCount++;
          continue;
        }

        console.log(`✅ Created user: ${user.user_id} (role: ${user.peranan})`);
        successCount++;

      } catch (err) {
        console.error(`❌ Error migrating ${user.user_id}: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\nMigration complete:`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⏭️  Skipped: ${existingUsers.length - successCount - errorCount}`);

    // Step 3: Run SQL migration to update foreign keys
    console.log('\n⚠️  IMPORTANT: Now run the SQL migration file (migrations/enable-supabase-auth.sql)');
    console.log('   This will update foreign keys to reference auth.uid()');

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrateUsers();
