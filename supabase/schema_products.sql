
-- Table: products
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  unit_price numeric(10,2) default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS
alter table products enable row level security;
create policy "Public Access Products" on products for all using (true);

-- Triggers
create trigger update_products_modtime
    before update on products
    for each row execute procedure update_updated_at_column();
