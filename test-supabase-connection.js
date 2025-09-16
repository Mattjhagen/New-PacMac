const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  const supabaseUrl = 'https://tvikatcdfnkwvjjpaxbu.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('📋 Configuration:');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Supabase Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
  console.log('');
  
  if (!supabaseKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from .env.local');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    console.log('🔗 Testing basic connection...');
    const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
    
    if (error) {
      console.log(`   Connection test result: ${error.message}`);
    } else {
      console.log('   ✅ Basic connection successful');
    }
    
    // Test auth service
    console.log('\n🔐 Testing auth service...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(`   Auth service result: ${authError.message}`);
    } else {
      console.log('   ✅ Auth service accessible');
      console.log(`   Current session: ${authData.session ? 'Active' : 'None'}`);
    }
    
    // Test OAuth providers
    console.log('\n🔑 Testing OAuth providers...');
    const { data: providers, error: providersError } = await supabase.auth.getOAuthUrl({
      provider: 'github',
      options: {
        redirectTo: 'https://new-pac-f36d74pk8-matty-hagens-projects.vercel.app/auth/callback'
      }
    });
    
    if (providersError) {
      console.log(`   OAuth test result: ${providersError.message}`);
    } else {
      console.log('   ✅ OAuth service accessible');
      console.log(`   OAuth URL generated: ${providers.url ? 'Yes' : 'No'}`);
    }
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
  }
}

testSupabaseConnection();
