import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local manually since we are running a script, not Vite
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('--- Teste de Conexão Supabase ---');

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log(`📡 Conectando a: ${supabaseUrl}`);

  try {
    // 1. Check if we can connect (simple query)
    const { data, error } = await supabase.from('partners').select('count', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist, it returns a specific error
      if (error.code === '42P01') { // undefined_table
        console.error('❌ Conexão estabelecida, mas as tabelas não foram encontradas.');
        console.error('💡 Dica: Execute o script SQL em supabase/schema.sql no painel do Supabase.');
      } else {
        console.error('❌ Erro ao conectar:', error.message);
      }
      return;
    }

    console.log('✅ Conexão bem-sucedida!');
    
    // 2. Try to insert a test partner
    const testPartner = {
      type: 'CLIENTE',
      name: 'Cliente Teste Script',
      doc: '000.000.000-00',
      email: 'teste@exemplo.com'
    };

    console.log('📝 Tentando inserir registro de teste...');
    const { data: insertData, error: insertError } = await supabase
      .from('partners')
      .insert(testPartner)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro na inserção:', insertError.message);
    } else {
      console.log(`✅ Registro inserido com sucesso! ID: ${insertData.id}`);
      
      // Cleanup
      console.log('🧹 Limpando registro de teste...');
      await supabase.from('partners').delete().eq('id', insertData.id);
      console.log('✅ Limpeza concluída.');
    }

  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

testConnection();
