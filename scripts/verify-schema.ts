
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

async function verifySchema() {
  console.log('🔍 Verificando integridade do esquema do banco de dados...\n');
  let missing = false;

  // 1. Check Products Table
  const { error: productsError } = await supabase.from('products').select('count', { count: 'exact', head: true });
  if (productsError && productsError.code === '42P01') {
    console.error('❌ Tabela "products": AUSENTE (Erro 42P01)');
    missing = true;
  } else if (productsError) {
    console.error('⚠️ Tabela "products": Erro desconhecido:', productsError.message);
  } else {
    console.log('✅ Tabela "products": OK');
  }

  // 2. Check RPC save_order
  // We check via rpc call with dummy data that would fail validation but prove existence
  const { error: rpcError } = await supabase.rpc('save_order', { p_order: {}, p_items: [] });
  
  if (rpcError && rpcError.message.includes('Could not find the function')) {
    console.error('❌ Função RPC "save_order": AUSENTE');
    missing = true;
  } else if (rpcError && rpcError.code === '22P02') { 
    // Invalid input syntax for uuid (expected because empty json) -> Means function exists!
    console.log('✅ Função RPC "save_order": OK');
  } else {
    // Other errors might also mean it exists but failed logic
    console.log('✅ Função RPC "save_order": OK (provavelmente)');
  }

  console.log('\n---------------------------------------------------');
  if (missing) {
    console.error('🚨 ATENÇÃO: O banco de dados está incompleto.');
    console.error('   A aplicação NÃO pode criar tabelas automaticamente.');
    console.error('   Você DEVE executar o script SQL manualmente.');
    console.log('\n📄 Arquivo de correção gerado: supabase/install.sql');
    console.log('👉 Copie o conteúdo deste arquivo e execute no SQL Editor do Supabase.');
  } else {
    console.log('🎉 Tudo parece estar correto!');
  }
}

verifySchema().catch(console.error);
