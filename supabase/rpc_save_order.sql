-- =============================================
-- 1. LIMPEZA DE DADOS (Executar com CUIDADO!)
-- =============================================
truncate table order_logs cascade;
truncate table order_items cascade;
truncate table orders cascade;
-- truncate table partners cascade; -- Descomente se quiser apagar também os clientes/fornecedores
-- truncate table calculation_factors cascade;

-- =============================================
-- 2. FUNÇÃO RPC PARA SALVAMENTO ATÔMICO
-- =============================================
create or replace function save_order(
  p_order jsonb,
  p_items jsonb
) returns uuid as $$
declare
  v_order_id uuid;
  v_client_id uuid;
  v_item jsonb;
begin
  -- Recupera o ID do cliente do JSON
  v_client_id := (p_order->>'client_id')::uuid;

  -- Insere o Pedido (Cabeçalho)
  insert into orders (
    order_number, salesperson, status, budget_date, order_date, 
    client_id, issuer, billing_type, payment_method, payment_due_date, 
    invoice_number, total_amount, entry_amount, entry_date, 
    entry_confirmed, remaining_amount, remaining_date, remaining_confirmed
  ) values (
    p_order->>'order_number',
    p_order->>'salesperson',
    p_order->>'status',
    (p_order->>'budget_date')::date,
    (p_order->>'order_date')::date,
    v_client_id,
    p_order->>'issuer',
    p_order->>'billing_type',
    p_order->>'payment_method',
    (p_order->>'payment_due_date')::date,
    p_order->>'invoice_number',
    (p_order->>'total_amount')::numeric,
    (p_order->>'entry_amount')::numeric,
    (p_order->>'entry_date')::date,
    (p_order->>'entry_confirmed')::boolean,
    (p_order->>'remaining_amount')::numeric,
    (p_order->>'remaining_date')::date,
    (p_order->>'remaining_confirmed')::boolean
  ) returning id into v_order_id;

  -- Insere os Itens do Pedido
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into order_items (
      order_id, product_name, supplier_id, quantity, unit_price,
      customization_cost, supplier_transport_cost, client_transport_cost,
      extra_expense, calculation_factor, total_item_value
    ) values (
      v_order_id,
      v_item->>'product_name',
      (v_item->>'supplier_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::numeric,
      (v_item->>'customization_cost')::numeric,
      (v_item->>'supplier_transport_cost')::numeric,
      (v_item->>'client_transport_cost')::numeric,
      (v_item->>'extra_expense')::numeric,
      (v_item->>'calculation_factor')::numeric,
      (v_item->>'total_item_value')::numeric
    );
  end loop;

  -- Registra Log Inicial
  insert into order_logs (order_id, user_name, message)
  values (v_order_id, coalesce(p_order->>'salesperson', 'Sistema'), 'Pedido criado com sucesso.');

  return v_order_id;
end;
$$ language plpgsql;
