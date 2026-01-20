-- Create table for Company Fixed Expenses (Salaries, Rent, etc.)
create table company_expenses (
  id uuid primary key default uuid_generate_v4(),
  description text not null,
  amount numeric not null default 0,
  due_date date not null,
  paid boolean default false,
  paid_date date,
  category text not null, -- 'FIXO', 'VARIAVEL', 'SALARIO', 'IMPOSTO', 'OUTROS'
  recurrence text, -- 'MENSAL', 'UNICO'
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table company_expenses enable row level security;

-- Policies
create policy "Authenticated users can view expenses" on company_expenses for select to authenticated using (true);
create policy "Authenticated users can insert expenses" on company_expenses for insert to authenticated with check (true);
create policy "Authenticated users can update expenses" on company_expenses for update to authenticated using (true);
create policy "Authenticated users can delete expenses" on company_expenses for delete to authenticated using (true);

-- Grant permissions
grant all on company_expenses to authenticated;
