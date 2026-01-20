# Documentação do Banco de Dados - Gestão de Pedidos

Este projeto utiliza o Supabase como Backend-as-a-Service (BaaS), fornecendo banco de dados PostgreSQL, autenticação e APIs automáticas.

## Configuração Inicial

1. **Crie um projeto no Supabase**: Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. **Obtenha as Credenciais**:
   - Vá em `Project Settings` > `API`.
   - Copie a `Project URL` e a `anon public key`.
   - Cole no arquivo `.env.local` nas variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

3. **Crie a Estrutura do Banco**:
   - Vá em `SQL Editor` no painel do Supabase.
   - Abra o arquivo `supabase/schema.sql` deste projeto.
   - Copie todo o conteúdo e cole no editor SQL do Supabase.
   - Clique em `Run`.

## Estrutura das Tabelas

### `partners`
Armazena tanto Clientes quanto Fornecedores.
- `type`: 'CLIENTE' ou 'FORNECEDOR'.
- `doc`: CPF ou CNPJ.
- `financial_email`: Email específico para cobrança.

### `orders`
Tabela principal dos pedidos.
- `order_number`: Identificador único legível (ex: "PED-123").
- `status`: Controla o fluxo (EM ABERTO -> FINALIZADO).
- `billing_type`: Define como será cobrado (50/50, À Vista, etc.).

### `order_items`
Itens individuais de cada pedido.
- `calculation_factor`: O valor do fator usado no momento da venda (histórico).
- `total_item_value`: Valor calculado (Custo * Fator).

### `calculation_factors`
Configurações de precificação.
- `tax_percent`, `contingency_percent`, `margin_percent`.

### `order_logs`
Rastro de auditoria simples para ações no pedido.

## Segurança (RLS)

O sistema utiliza Row Level Security (RLS) do PostgreSQL.
- Por padrão, o script cria políticas de acesso público (`anon`) para desenvolvimento.
- **Produção**: Para um ambiente real, altere as policies para usar `auth.uid()` e restrinja o acesso.

## Testando a Conexão

Execute o script de teste para validar se as credenciais estão corretas e se as tabelas foram criadas:

```bash
npx tsx scripts/test-connection.ts
```
