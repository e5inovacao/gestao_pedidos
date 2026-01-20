create or replace function save_order(
  p_order jsonb,
  p_items jsonb
) returns uuid as $$
declare
  v_order_id uuid;
  v_client_id uuid;
  v_item jsonb;
  v_entry_confirmed boolean;
  v_remaining_confirmed boolean;
  v_entry_amount numeric;
  v_remaining_amount numeric;
  v_salesperson text;
  v_status text;
begin
  -- Extract variables
  v_client_id := (p_order->>'client_id')::uuid;
  v_entry_confirmed := (p_order->>'entry_confirmed')::boolean;
  v_remaining_confirmed := (p_order->>'remaining_confirmed')::boolean;
  v_entry_amount := coalesce((p_order->>'entry_amount')::numeric, 0);
  v_remaining_amount := coalesce((p_order->>'remaining_amount')::numeric, 0);
  v_salesperson := p_order->>'salesperson';
  v_status := p_order->>'status';
  
  -- Check if ID exists in payload for Update
  if (p_order->>'id') is not null and (p_order->>'id') != '' then
    v_order_id := (p_order->>'id')::uuid;
    
    -- UPDATE
    update orders set
      salesperson = v_salesperson,
      status = v_status::order_status,
      budget_date = (p_order->>'budget_date')::date,
      order_date = (p_order->>'order_date')::date,
      client_id = v_client_id,
      issuer = p_order->>'issuer',
      billing_type = p_order->>'billing_type',
      payment_method = p_order->>'payment_method',
      payment_due_date = (p_order->>'payment_due_date')::date,
      invoice_number = p_order->>'invoice_number',
      total_amount = (p_order->>'total_amount')::numeric,
      entry_amount = v_entry_amount,
      entry_date = (p_order->>'entry_date')::date,
      entry_confirmed = v_entry_confirmed,
      remaining_amount = v_remaining_amount,
      remaining_date = (p_order->>'remaining_date')::date,
      remaining_confirmed = v_remaining_confirmed,
      updated_at = now()
    where id = v_order_id;
    
    -- Delete existing items to replace (Simple approach)
    delete from order_items where order_id = v_order_id;
    
  else
    -- INSERT
    insert into orders (
      order_number, salesperson, status, budget_date, order_date, 
      client_id, issuer, billing_type, payment_method, payment_due_date, 
      invoice_number, total_amount, entry_amount, entry_date, 
      entry_confirmed, remaining_amount, remaining_date, remaining_confirmed
    ) values (
      p_order->>'order_number',
      v_salesperson,
      v_status::order_status,
      (p_order->>'budget_date')::date,
      (p_order->>'order_date')::date,
      v_client_id,
      p_order->>'issuer',
      p_order->>'billing_type',
      p_order->>'payment_method',
      (p_order->>'payment_due_date')::date,
      p_order->>'invoice_number',
      (p_order->>'total_amount')::numeric,
      v_entry_amount,
      (p_order->>'entry_date')::date,
      v_entry_confirmed,
      v_remaining_amount,
      (p_order->>'remaining_date')::date,
      v_remaining_confirmed
    ) returning id into v_order_id;
  end if;

  -- Insere os Itens do Pedido
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into order_items (
      order_id, product_name, supplier_id, quantity, unit_price,
      customization_cost, supplier_transport_cost, client_transport_cost,
      extra_expense, layout_cost,
      calculation_factor, total_item_value,
      
      -- Real Costs
      real_unit_price, real_customization_cost, real_supplier_transport_cost,
      real_client_transport_cost, real_extra_expense, real_layout_cost,
      
      -- Paid Flags
      unit_price_paid, customization_paid, supplier_transport_paid,
      client_transport_paid, extra_expense_paid, layout_paid,

      -- Projection Columns
      tax_pct, unforeseen_pct, margin_pct
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
      (v_item->>'layout_cost')::numeric,
      (v_item->>'calculation_factor')::numeric,
      (v_item->>'total_item_value')::numeric,
      
      coalesce((v_item->>'real_unit_price')::numeric, 0),
      coalesce((v_item->>'real_customization_cost')::numeric, 0),
      coalesce((v_item->>'real_supplier_transport_cost')::numeric, 0),
      coalesce((v_item->>'real_client_transport_cost')::numeric, 0),
      coalesce((v_item->>'real_extra_expense')::numeric, 0),
      coalesce((v_item->>'real_layout_cost')::numeric, 0),
      
      coalesce((v_item->>'unit_price_paid')::boolean, false),
      coalesce((v_item->>'customization_paid')::boolean, false),
      coalesce((v_item->>'supplier_transport_paid')::boolean, false),
      coalesce((v_item->>'client_transport_paid')::boolean, false),
      coalesce((v_item->>'extra_expense_paid')::boolean, false),
      coalesce((v_item->>'layout_paid')::boolean, false),

      coalesce((v_item->>'tax_pct')::numeric, 0),
      coalesce((v_item->>'unforeseen_pct')::numeric, 0),
      coalesce((v_item->>'margin_pct')::numeric, 0)
    );
  end loop;

  -- COMMISSION LOGIC (Updated to 1%)
  -- 1. Entry Payment Commission
  if v_entry_confirmed then
    if not exists (select 1 from commissions where order_id = v_order_id and type = 'ENTRADA') then
      insert into commissions (order_id, salesperson, amount, type, status, commission_percent)
      values (v_order_id, v_salesperson, v_entry_amount * 0.01, 'ENTRADA', 'PENDING', 1.00);
    end if;
  end if;
  
  -- 2. Remaining Payment Commission
  if v_remaining_confirmed then
    if not exists (select 1 from commissions where order_id = v_order_id and type = 'RESTANTE') then
      insert into commissions (order_id, salesperson, amount, type, status, commission_percent)
      values (v_order_id, v_salesperson, v_remaining_amount * 0.01, 'RESTANTE', 'PENDING', 1.00);
    end if;
  end if;

  -- Registra Log
  insert into order_logs (order_id, user_name, message)
  values (v_order_id, coalesce(v_salesperson, 'Sistema'), 'Pedido salvo/atualizado com sucesso.');

  return v_order_id;
end;
$$ language plpgsql;
