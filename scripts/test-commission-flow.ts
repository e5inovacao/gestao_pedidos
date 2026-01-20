import { supabase } from '../lib/supabase';

// Mock script to verify commission logic
const runTest = async () => {
  console.log('--- INICIANDO TESTE DE FLUXO DE COMISSÃO ---');
  
  const testId = `test_${Date.now()}`;
  const salesperson = 'VENDAS 01';
  
  try {
    // 1. Criar Cliente de Teste
    console.log('1. Criando cliente de teste...');
    const { data: partner, error: pError } = await supabase
      .from('partners')
      .insert([{
        name: `Cliente Teste ${testId}`,
        type: 'CLIENTE',
        doc: '000.000.000-00',
        phone: '00000000000',
        email: 'teste@teste.com'
      }])
      .select()
      .single();
      
    if (pError) throw pError;
    console.log('   Cliente criado:', partner.id);

    // 2. Criar Pedido (Entry Payment Confirmed)
    console.log('2. Criando pedido com pagamento de entrada confirmado...');
    const orderPayload = {
      order_number: testId,
      salesperson: salesperson,
      status: 'EM ABERTO',
      budget_date: new Date().toISOString(),
      order_date: new Date().toISOString(),
      client_id: partner.id,
      issuer: 'CRISTAL',
      billing_type: 'TESTE',
      payment_method: 'PIX',
      payment_due_date: new Date().toISOString(),
      invoice_number: null,
      total_amount: 10000, // Total Venda: 10.000
      entry_amount: 5000,  // Entrada: 5.000
      entry_date: new Date().toISOString(),
      entry_confirmed: true, // Confirmado!
      remaining_amount: 5000,
      remaining_date: null,
      remaining_confirmed: false
    };
    
    const itemsPayload = [{
      product_name: 'Produto Teste',
      quantity: 100,
      unit_price: 100,
      total_item_value: 10000
    }];

    const { data: orderId, error: oError } = await supabase.rpc('save_order', {
      p_order: orderPayload,
      p_items: itemsPayload
    });

    if (oError) throw oError;
    console.log('   Pedido criado:', orderId);

    // 3. Verificar Comissão de Entrada (Deve ser 1% de 5000 = 50)
    console.log('3. Verificando comissão de entrada...');
    const { data: commEntry, error: cError1 } = await supabase
      .from('commissions')
      .select('*')
      .eq('order_id', orderId)
      .eq('type', 'ENTRADA')
      .single();

    if (cError1) throw cError1;
    
    if (commEntry.amount === 50) {
      console.log('   SUCESSO: Comissão de Entrada correta (R$ 50,00).');
    } else {
      console.error(`   FALHA: Comissão de Entrada incorreta. Esperado 50, Recebido ${commEntry.amount}`);
    }

    // 4. Atualizar Pedido (Remaining Payment Confirmed)
    console.log('4. Confirmando pagamento restante...');
    orderPayload.remaining_confirmed = true;
    orderPayload.remaining_date = new Date().toISOString();
    // Add ID to update existing order
    (orderPayload as any).id = orderId;

    const { error: uError } = await supabase.rpc('save_order', {
      p_order: orderPayload,
      p_items: itemsPayload
    });

    if (uError) throw uError;
    console.log('   Pedido atualizado.');

    // 5. Verificar Comissão Restante (Deve ser 1% de 5000 = 50)
    console.log('5. Verificando comissão restante...');
    const { data: commRem, error: cError2 } = await supabase
      .from('commissions')
      .select('*')
      .eq('order_id', orderId)
      .eq('type', 'RESTANTE')
      .single();

    if (cError2) throw cError2;

    if (commRem.amount === 50) {
      console.log('   SUCESSO: Comissão Restante correta (R$ 50,00).');
    } else {
      console.error(`   FALHA: Comissão Restante incorreta. Esperado 50, Recebido ${commRem.amount}`);
    }
    
    console.log('--- TESTE CONCLUÍDO COM SUCESSO ---');

  } catch (err) {
    console.error('ERRO NO TESTE:', err);
  }
};

runTest();
