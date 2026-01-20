-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type partner_type as enum ('CLIENTE', 'FORNECEDOR');
create type order_status as enum (
  'EM ABERTO', 'EM PRODUÇÃO', 'AGUARDANDO APROVAÇÃO', 
  'AGUARDANDO NF', 'AGUARDANDO PAGAMENTO', 
  'AGUARDANDO PERSONALIZAÇÃO', 'FINALIZADO'
);

-- Table: partners (Clients and Suppliers)
create table partners (
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

-- Table: calculation_factors
create table calculation_factors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  tax_percent numeric(5,2) default 0,
  contingency_percent numeric(5,2) default 0,
  margin_percent numeric(5,2) default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table: orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  salesperson text not null,
  status order_status default 'EM ABERTO',
  budget_date date,
  order_date date default current_date,
  client_id uuid references partners(id) on delete set null,
  issuer text, -- Cristal, Espirito, etc.
  billing_type text, -- Modalidade
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

-- Table: order_items
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_name text not null,
  supplier_id uuid references partners(id) on delete set null,
  quantity integer default 1,
  unit_price numeric(10,2) default 0,
  
  -- Costs
  customization_cost numeric(10,2) default 0,
  supplier_transport_cost numeric(10,2) default 0,
  client_transport_cost numeric(10,2) default 0,
  extra_expense numeric(10,2) default 0,
  
  calculation_factor numeric(5,2) default 1.35,
  
  -- Computed total for this item (can be calculated on query, but storing for freeze)
  total_item_value numeric(10,2) default 0,
  
  created_at timestamp with time zone default now()
);

-- Table: order_logs
create table order_logs (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  user_name text not null,
  message text not null,
  created_at timestamp with time zone default now()
);

-- Indexes for Performance
create index idx_partners_name on partners(name);
create index idx_partners_doc on partners(doc);
create index idx_orders_client_id on orders(client_id);
create index idx_orders_status on orders(status);
create index idx_orders_date on orders(order_date);
create index idx_order_items_order_id on order_items(order_id);

-- RLS Policies (Security)
alter table partners enable row level security;
alter table calculation_factors enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_logs enable row level security;

-- For development/prototype: Allow public access (Anon key)
-- WARNING: In production, restrict this to authenticated users only.
create policy "Public Access Partners" on partners for all using (true);
create policy "Public Access Factors" on calculation_factors for all using (true);
create policy "Public Access Orders" on orders for all using (true);
create policy "Public Access Items" on order_items for all using (true);
create policy "Public Access Logs" on order_logs for all using (true);

-- Functions & Triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_partners_modtime
    before update on partners
    for each row execute procedure update_updated_at_column();

create trigger update_factors_modtime
    before update on calculation_factors
    for each row execute procedure update_updated_at_column();

create trigger update_orders_modtime
    before update on orders
    for each row execute procedure update_updated_at_column();

-- Stored Procedure: Dashboard Stats
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
