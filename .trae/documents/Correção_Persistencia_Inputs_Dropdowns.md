# Correções de Persistência, Inputs e Dropdowns

## 1. Problemas Resolvidos

### 1.1. Erro de React "Uncontrolled Input"
**Sintoma:** Aviso no console `A component is changing an uncontrolled input to be controlled...`
**Causa:** O estado inicial `clientData` não possuía a propriedade `doc`, mas o input tentava acessar `clientData.doc`, resultando em `undefined`. Ao selecionar um cliente, o valor mudava para uma string.
**Solução:** O estado inicial foi corrigido para incluir `doc: ''` em vez de `cnpj: ''`.

### 1.2. Erro "Invalid enum value for partner_type: PRODUTO"
**Sintoma:** Erro ao tentar cadastrar um novo produto via modal "Quick Add".
**Causa:** O código tentava salvar "Produtos" na tabela `partners`, que só aceita "CLIENTE" ou "FORNECEDOR".
**Solução:**
1.  Foi criado um script SQL (`supabase/schema_products.sql`) para criar a tabela `products`.
2.  O `OrderForm.tsx` foi atualizado para detectar quando o cadastro é de `PRODUTO` e salvar na tabela correta (`products`) em vez de `partners`.

### 1.3. Dropdowns de Fornecedores Vazios
**Sintoma:** Os campos "Fornecedor Produto" e custos adicionais não mostravam opções.
**Causa:** O componente `CustomSelect` estava recebendo `options={[]}` (array vazio) hardcoded.
**Solução:** O estado `suppliersList` agora é passado corretamente para todos os dropdowns de fornecedores.

### 1.4. Persistência de Pedidos
**Validação:** Foi criado um teste de integração robusto (`scripts/test-order-flow.ts`) que simula o ciclo completo:
1.  Cria Cliente e Fornecedor.
2.  Cria um Pedido via RPC `save_order`.
3.  Verifica se o pedido foi salvo corretamente no banco com todos os itens.
4.  Remove os dados de teste.

## 2. Como Executar as Atualizações

### 2.1. Banco de Dados (Tabela Produtos)
Para que o cadastro de produtos funcione, execute o seguinte SQL no Supabase Dashboard (SQL Editor):
```sql
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  unit_price numeric(10,2) default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table products enable row level security;
create policy "Public Access Products" on products for all using (true);
```

### 2.2. Validar Fluxo
Execute o teste de integração para confirmar que tudo está funcionando:
```bash
npx tsx scripts/test-order-flow.ts
```
