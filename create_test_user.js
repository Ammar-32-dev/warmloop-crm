const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kjdxkrswrdywabfctlez.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZHhrcnN3cmR5d2FiZmN0bGV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgxNzc2MCwiZXhwIjoyMDc3MzkzNzYwfQ.KR6GOh2mX9qkwx3ZHrNYROyEVIpqOK8fbfGJRUb5fcA';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@warmloop-demo.com',
      password: 'demo123456',
      email_confirm: true
    });

    if (error) {
      console.error('Error creating user:', error);
    } else {
      console.log('✅ Test user created successfully!');
      console.log('Email: test@warmloop-demo.com');
      console.log('Password: demo123456');
      console.log('User ID:', data.user.id);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

createTestUser();
