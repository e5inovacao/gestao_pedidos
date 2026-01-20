
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

async function runTest() {
  console.log('🚀 Iniciando teste automatizado de cadastro de parceiro...');

  const testPartner = {
    name: 'TESTE AUTOMATIZADO - ' + Date.now(),
    type: 'CLIENTE',
    doc: '00.000.000/0000-00', // Validating the 'doc' column usage
    phone: '(11) 99999-9999',
    email: 'teste@exemplo.com',
    financial_email: 'financeiro@exemplo.com'
  };

  console.log('📋 Dados do parceiro de teste:', testPartner);

  // 1. INSERT
  console.log('💾 Tentando inserir parceiro...');
  const { data: insertData, error: insertError } = await supabase
    .from('partners')
    .insert([testPartner])
    .select();

  if (insertError) {
    console.error('❌ Falha na inserção:', insertError);
    // Verifica especificamente o erro de coluna ausente
    if (insertError.message.includes('Could not find the') && insertError.message.includes('column')) {
      console.error('CRÍTICO: Erro de coluna não encontrada confirmado. Verifique se a coluna "doc" existe e se "cnpj" foi removido.');
    }
    process.exit(1);
  }

  console.log('✅ Inserção realizada com sucesso!', insertData);
  const partnerId = insertData[0].id;

  // 2. SELECT to Verify
  console.log('🔍 Verificando persistência...');
  const { data: selectData, error: selectError } = await supabase
    .from('partners')
    .select('*')
    .eq('id', partnerId)
    .single();

  if (selectError || !selectData) {
    console.error('❌ Falha na verificação:', selectError);
    process.exit(1);
  }

  if (selectData.doc !== testPartner.doc) {
    console.error(`❌ Discrepância de dados: Esperado doc=${testPartner.doc}, Recebido doc=${selectData.doc}`);
    process.exit(1);
  }

  console.log('✅ Dados verificados corretamente!');

  // 3. CLEANUP
  console.log('🧹 Limpando dados de teste...');
  const { error: deleteError } = await supabase
    .from('partners')
    .delete()
    .eq('id', partnerId);

  if (deleteError) {
    console.error('⚠️ Aviso: Falha ao limpar dados de teste:', deleteError);
  } else {
    console.log('✅ Limpeza concluída.');
  }

  console.log('\n🎉 TESTE DE REGISTRO PASSOU COM SUCESSO!');
}

runTest().catch(err => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
