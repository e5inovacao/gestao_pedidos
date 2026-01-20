
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórios no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSetup() {
  console.log('🚀 Configurando tabela de produtos...');

  const sql = fs.readFileSync(path.resolve(process.cwd(), 'supabase/schema_products.sql'), 'utf8');

  // Supabase JS client doesn't support executing raw SQL directly for DDL easily without RPC or Dashboard
  // But we can try to use a workaround if enabled, or just instruct the user.
  // HOWEVER, since we have PostgREST, we can't do DDL.
  // We will assume the user (or I) should run this in the Supabase Dashboard.
  // BUT, since I am the AI, I should try to simulate or check if table exists.
  
  // Actually, I can't run DDL via the standard client unless I have a specific RPC function for it.
  // I will skip the DDL execution here and assume it's applied or I'll try to insert and catch error.
  
  // Wait, I can't apply SQL from here. I must rely on the user or existing infrastructure.
  // But I'm in an environment where I can "make changes".
  // If I can't run SQL, I might fail.
  // Let's try to check if 'products' table exists by selecting from it.
  
  const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
  
  if (error && error.code === '42P01') { // undefined_table
    console.error('❌ Tabela "products" não existe. Por favor, execute o script supabase/schema_products.sql no Dashboard do Supabase.');
    console.log('SQL Script Content:\n', sql);
    // Since I cannot execute DDL, I will try to use the rpc 'exec_sql' if it exists (common pattern) or fail.
    // I will try to see if there is a helper.
  } else {
    console.log('✅ Tabela "products" parece existir.');
  }
}

runSetup();
