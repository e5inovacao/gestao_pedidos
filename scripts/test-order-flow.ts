
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

async function runIntegrationTest() {
  console.log('🚀 Iniciando Teste de Integração do Fluxo de Pedidos...');

  const uniqueSuffix = Date.now().toString();
  
  // 1. Create Client
  console.log('1️⃣ Criando Cliente...');
  const { data: client, error: clientError } = await supabase.from('partners').insert([{
    name: `Cliente Teste ${uniqueSuffix}`,
    type: 'CLIENTE',
    doc: '11.111.111/0001-11',
    phone: '11999999999',
    email: 'cliente@teste.com'
  }]).select().single();

  if (clientError) { console.error('❌ Erro ao criar cliente:', clientError); process.exit(1); }
  console.log('✅ Cliente criado:', client.id);

  // 2. Create Supplier
  console.log('2️⃣ Criando Fornecedor...');
  const { data: supplier, error: supplierError } = await supabase.from('partners').insert([{
    name: `Fornecedor Teste ${uniqueSuffix}`,
    type: 'FORNECEDOR',
    doc: '22.222.222/0001-22',
    phone: '11888888888',
    email: 'fornecedor@teste.com'
  }]).select().single();

  if (supplierError) { console.error('❌ Erro ao criar fornecedor:', supplierError); process.exit(1); }
  console.log('✅ Fornecedor criado:', supplier.id);

  // 3. Create Product (Optional, usually we pick a name)
  // Since we implemented products table, let's test it too if possible, but save_order just uses product_name string.
  // We will assume "Caneta Metal Teste"
  const productName = `Caneta Metal Teste ${uniqueSuffix}`;

  // 4. Create Order using RPC save_order
  console.log('3️⃣ Criando Pedido via RPC save_order...');
  
  const orderPayload = {
    order_number: `PED-${uniqueSuffix}`,
    salesperson: 'VENDAS 01',
    status: 'EM ABERTO',
    budget_date: new Date().toISOString(),
    order_date: new Date().toISOString(),
    client_id: client.id,
    issuer: 'CRISTAL',
    billing_type: '100% À VISTA',
    payment_method: 'PIX',
    payment_due_date: new Date().toISOString(),
    total_amount: 135.00,
    entry_amount: 0,
    entry_date: null,
    entry_confirmed: false,
    remaining_amount: 0,
    remaining_date: null,
    remaining_confirmed: false
  };

  const itemsPayload = [{
    product_name: productName,
    supplier_id: supplier.id,
    quantity: 10,
    unit_price: 10.00,
    customization_cost: 0,
    supplier_transport_cost: 0,
    client_transport_cost: 0,
    extra_expense: 0,
    calculation_factor: 1.35,
    total_item_value: 135.00
  }];

  const { data: orderId, error: orderError } = await supabase.rpc('save_order', {
    p_order: orderPayload,
    p_items: itemsPayload
  });

  if (orderError) { 
    console.error('❌ Erro ao salvar pedido (RPC):', orderError); 
    process.exit(1); 
  }
  console.log('✅ Pedido salvo com sucesso! ID:', orderId);

  // 5. Verify Persistence
  console.log('4️⃣ Verificando Persistência do Pedido...');
  const { data: savedOrder, error: fetchError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();

  if (fetchError || !savedOrder) { console.error('❌ Erro ao buscar pedido salvo:', fetchError); process.exit(1); }

  if (savedOrder.order_number !== orderPayload.order_number) {
    console.error('❌ Discrepância no número do pedido');
    process.exit(1);
  }
  if (savedOrder.order_items.length !== 1) {
    console.error('❌ Erro: Quantidade de itens incorreta');
    process.exit(1);
  }
  
  console.log('✅ Dados do pedido verificados!');

  // 6. Cleanup
  console.log('🧹 Limpando dados de teste...');
  // Cascade delete on orders should clean items and logs
  await supabase.from('orders').delete().eq('id', orderId);
  await supabase.from('partners').delete().eq('id', client.id);
  await supabase.from('partners').delete().eq('id', supplier.id);
  
  console.log('✅ Limpeza concluída.');
  console.log('\n🎉 TESTE DE INTEGRAÇÃO CONCLUÍDO COM SUCESSO!');
}

runIntegrationTest().catch(err => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
