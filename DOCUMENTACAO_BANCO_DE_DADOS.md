# Documentação Completa do Banco de Dados - Gestão de Pedidos

Esta documentação contém a estrutura completa do banco de dados para replicação. O sistema utiliza PostgreSQL (via Supabase).

## 1. Visão Geral das Tabelas

O banco de dados é composto pelas seguintes tabelas principais:

1.  **`partners`**: Armazena Clientes e Fornecedores.
2.  **`products`**: Catálogo de produtos/brindes base.
3.  **`orders`**: Tabela central de pedidos.
4.  **`order_items`**: Itens de cada pedido, contendo custos previstos, custos reais e status de pagamento de fornecedores.
5.  **`commissions`**: Registro de comissões geradas para vendedores (na entrada e na quitação do pedido).
6.  **`company_expenses`**: Contas a pagar da empresa (fixas e variáveis).
7.  **`calculation_factors`**: Configurações de taxas e margens padrão.
8.  **`order_logs`**: Auditoria de alterações nos pedidos.

## 2. Tipos (Enums)

### `partner_type`
*   `CLIENTE`
*   `FORNECEDOR`

### `order_status`
*   `EM ABERTO`
*   `EM PRODUÇÃO`
*   `AGUARDANDO APROVAÇÃO`
*   `AGUARDANDO NF`
*   `AGUARDANDO PAGAMENTO`
*   `AGUARDANDO PERSONALIZAÇÃO`
*   `FINALIZADO`
*   `ENTRE FINALIZADO`

## 3. Script SQL Completo (Schema + Migrations)

Para replicar o banco de dados do zero, execute o script abaixo no **SQL Editor** do Supabase. Este script consolida a estrutura inicial e todas as atualizações subsequentes.

```sql
-- ==============================================================================
-- SCRIPT COMPLETO DE CRIAÇÃO DO BANCO DE DADOS - GESTÃO DE PEDIDOS
-- Data: 18/01/2026
-- ==============================================================================

-- 1. Extensões
create extension if not exists "uuid-ossp";

-- 2. Enums
do $$ begin
    create type partner_type as enum ('CLIENTE', 'FORNECEDOR');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type order_status as enum (
        'EM ABERTO', 'EM PRODUÇÃO', 'AGUARDANDO APROVAÇÃO', 
        'AGUARDANDO NF', 'AGUARDANDO PAGAMENTO', 
        'AGUARDANDO PERSONALIZAÇÃO', 'FINALIZADO', 'ENTRE FINALIZADO'
    );
exception
    when duplicate_object then null;
end $$;

-- 3. Tabelas

-- Tabela: partners
create table if not exists partners (
  id uuid primary key default uuid_generate_v4(),
  type partner_type not null,
  name text not null,
  doc text, -- CPF/CNPJ
  phone text,
  email text,
  financial_email text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela: products
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  unit_price numeric(10,2) default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela: calculation_factors
create table if not exists calculation_factors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  tax_percent numeric(5,2) default 0,
  contingency_percent numeric(5,2) default 0,
  margin_percent numeric(5,2) default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela: orders
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  salesperson text not null,
  status order_status default 'EM ABERTO',
  budget_date date,
  order_date date default current_date,
  client_id uuid references partners(id) on delete set null,
  issuer text,
  billing_type text,
  payment_method text,
  payment_due_date date,
  invoice_number text,
  
  -- Totals
  total_amount numeric(10,2) default 0,
  
  -- Payments
  entry_amount numeric(10,2) default 0,
  entry_date date,
  entry_confirmed boolean default false,
  
  remaining_amount numeric(10,2) default 0,
  remaining_date date,
  remaining_confirmed boolean default false,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela: order_items
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_name text not null,
  supplier_id uuid references partners(id) on delete set null,
  quantity integer default 1,
  unit_price numeric(10,2) default 0,
  
  -- Costs (Predicted)
  customization_cost numeric(10,2) default 0,
  supplier_transport_cost numeric(10,2) default 0,
  client_transport_cost numeric(10,2) default 0,
  extra_expense numeric(10,2) default 0,
  layout_cost numeric(10,2) default 0,
  
  calculation_factor numeric(5,2) default 1.35,
  total_item_value numeric(10,2) default 0,
  
  -- Real Costs (Management)
  real_unit_price numeric(10,2) default 0,
  real_customization_cost numeric(10,2) default 0,
  real_supplier_transport_cost numeric(10,2) default 0,
  real_client_transport_cost numeric(10,2) default 0,
  real_extra_expense numeric(10,2) default 0,
  real_layout_cost numeric(10,2) default 0,
  
  -- Payment Status Flags
  unit_price_paid boolean default false,
  customization_paid boolean default false,
  supplier_transport_paid boolean default false,
  client_transport_paid boolean default false,
  extra_expense_paid boolean default false,
  layout_paid boolean default false,
  
  -- Projections (Snapshots)
  tax_pct numeric default 0,
  unforeseen_pct numeric default 0,
  margin_pct numeric default 0,
  
  created_at timestamp with time zone default now()
);

-- Tabela: commissions
create table if not exists commissions (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  salesperson text not null,
  amount numeric(10,2) not null,
  type text not null, -- 'ENTRADA' or 'RESTANTE'
  status text default 'PENDING', -- 'PENDING', 'PAID'
  commission_percent numeric(5,2) default 3.00,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela: company_expenses
create table if not exists company_expenses (
  id uuid primary key default uuid_generate_v4(),
  description text not null,
  amount numeric not null default 0,
  due_date date not null,
  paid boolean default false,
  paid_date date,
  category text not null,
  recurrence text,
  observation text,
  created_at timestamp with time zone default now()
);

-- Tabela: order_logs
create table if not exists order_logs (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  user_name text not null,
  message text not null,
  created_at timestamp with time zone default now()
);

-- 4. Índices
create index if not exists idx_partners_name on partners(name);
create index if not exists idx_partners_doc on partners(doc);
create index if not exists idx_orders_client_id on orders(client_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_date on orders(order_date);
create index if not exists idx_order_items_order_id on order_items(order_id);

-- 5. Funções e Triggers

-- Trigger: update_updated_at_column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Apply triggers
drop trigger if exists update_partners_modtime on partners;
create trigger update_partners_modtime before update on partners for each row execute procedure update_updated_at_column();

drop trigger if exists update_factors_modtime on calculation_factors;
create trigger update_factors_modtime before update on calculation_factors for each row execute procedure update_updated_at_column();

drop trigger if exists update_orders_modtime on orders;
create trigger update_orders_modtime before update on orders for each row execute procedure update_updated_at_column();

drop trigger if exists update_products_modtime on products;
create trigger update_products_modtime before update on products for each row execute procedure update_updated_at_column();

-- Function: get_dashboard_stats
create or replace function get_dashboard_stats()
returns table (
  total_orders bigint,
  pending_orders bigint,
  total_revenue numeric,
  active_clients bigint
) as $$
begin
  return query select
    (select count(*) from orders),
    (select count(*) from orders where status = 'EM ABERTO'),
    (select coalesce(sum(total_amount), 0) from orders where status = 'FINALIZADO'),
    (select count(*) from partners where type = 'CLIENTE');
end;
$$ language plpgsql;

-- Function: save_order (Lógica Central)
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

  -- COMMISSION LOGIC (1%)
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

-- 6. Segurança (RLS)

-- Habilitar RLS
alter table partners enable row level security;
alter table calculation_factors enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_logs enable row level security;
alter table products enable row level security;
alter table commissions enable row level security;
alter table company_expenses enable row level security;

-- Políticas (Permitir tudo para usuários autenticados e anon para facilitar dev/testes se necessário)
-- NOTA: Em produção, remova as policies "for all using (true)" se quiser restringir o acesso público.

-- Helper function para criar policies de acesso total
do $$ 
declare 
  t text;
begin 
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('drop policy if exists "Public Access %I" on %I', t, t);
    execute format('create policy "Public Access %I" on %I for all using (true)', t, t);
  end loop;
end $$;
```
