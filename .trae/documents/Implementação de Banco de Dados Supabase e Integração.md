O plano a seguir detalha a implementação da integração com o Supabase e a estruturação do banco de dados para o sistema de Gestão de Pedidos.

## 1. Configuração do Ambiente e Dependências
- **Instalação**: Adicionar a biblioteca oficial `@supabase/supabase-js`.
- **Variáveis de Ambiente**: Configurar arquivos `.env` para armazenar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- **Cliente Supabase**: Criar `lib/supabase.ts` para inicializar a conexão com tratamento de erros.

## 2. Modelagem do Banco de Dados (Schema)
Criarei um arquivo SQL completo (`supabase/schema.sql`) para ser executado no painel do Supabase, contendo:

### Tabelas Principais
- **`partners`**: Clientes e Fornecedores (unificando dados de cadastro).
- **`calculation_factors`**: Fatores de cálculo (impostos, margem, etc.).
- **`orders`**: Cabeçalho dos pedidos (status, datas, totais).
- **`order_items`**: Itens de cada pedido com custos detalhados.
- **`order_logs`**: Histórico de alterações e observações.

### Otimizações e Segurança
- **Índices**: Criação de índices em chaves estrangeiras (`client_id`, `order_id`) e campos de busca frequente.
- **RLS (Row Level Security)**: Políticas básicas de segurança.
- **Triggers**: Atualização automática de campos `updated_at`.

### Procedimentos Armazenados (Stored Procedures)
- Procedures para operações complexas, como inserção de pedido com itens em uma única transação (se necessário) ou cálculos de estatísticas.

## 3. Documentação
- **`DATABASE.md`**: Documento explicando a estrutura das tabelas, relacionamentos e como configurar o projeto no Supabase.

## 4. Testes
- **Script de Teste**: Criação de um script `scripts/test-connection.ts` para verificar:
    1. Conexão com a API.
    2. Inserção de um registro de teste.
    3. Leitura de dados.

---
**Nota**: Como não tenho acesso direto para criar o projeto no seu painel do Supabase, entregarei os arquivos e scripts necessários para que você apenas copie e cole (ou execute) para ter tudo funcionando.
