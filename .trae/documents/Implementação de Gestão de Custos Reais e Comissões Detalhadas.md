# Plano de Ação

## 1. Correção do Erro `PGRST205`
O erro indica que a tabela `commissions` não existe no banco de dados.
- **Ação:** Criar um arquivo de migração SQL (`supabase/migrations/003_fix_commissions_table.sql`) que cria a tabela `commissions` se ela não existir. Como o usuário não executou a migração anterior, vou garantir que esta nova migração cubra a criação da tabela.
- **Nota:** Instruirei o usuário a rodar este script no SQL Editor do Supabase.

## 2. Melhoria na Gestão de Comissões (`CommissionPage.tsx`)
- **Layout:** Reformular a página para exibir um **Resumo por Vendedor** (Cards) no topo.
    - Mostrar 4 cards (um para cada vendedor: "VENDAS 01" a "VENDAS 04") com o total de comissões do mês.
- **Tabela Detalhada:** Manter a tabela abaixo, mas adicionar filtros rápidos por vendedor ao clicar nos cards.

## 3. Custo Layout (`OrderForm.tsx`)
- **Ação:** Adicionar um novo campo de custo chamado "CUSTO LAYOUT" (`layout_cost`) na tabela `order_items` e no formulário.
- **Localização:** Abaixo dos outros custos (Personalização, Transporte, etc.) no formulário de itens.
- **Banco de Dados:** Adicionar coluna `layout_cost` na tabela `order_items`.

## 4. Coluna "Gestão" e Confirmação de Pagamento (`OrderForm.tsx`)
- **Novo Conceito:** Criar uma "coluna paralela" nos itens do pedido para controle gerencial.
- **Campos:**
    - Para cada custo (Produto, Personalização, Fretes, Extra, Layout), criar um input correspondente de "Valor Real/Pago" ao lado direito.
    - Inicialmente, esse valor virá vazio ou cópia do valor orçado (conforme solicitado: "copia dos valores").
- **Botão de Confirmação:** Ao lado de cada input de gestão, um botão (ícone de check/pagamento).
    - **Ação:** Ao clicar, abre modal de confirmação. Se confirmado, marca aquele custo específico como "PAGO" e registra no log ("Custo de Personalização do Item 1 pago: R$ 50,00").
- **Banco de Dados:** Precisarei adicionar colunas na tabela `order_items` para armazenar esses "valores reais" e "status de pagamento" de cada custo (ex: `real_unit_price`, `real_customization_cost`, `customization_paid`, etc.).

## 5. Elemento de Saldos e Comissões no Pedido (`OrderForm.tsx`)
- **Localização:** Abaixo da lista de produtos.
- **Conteúdo:**
    1.  **Saldo Estimado:** Receita Total (Entrada + Restante) - Custos Estimados.
    2.  **Saldo Real:** Receita Total Confirmada - Custos Reais (da coluna Gestão).
    3.  **Comissões do Pedido:** Listar as comissões geradas para este pedido (Entrada/Restante).
        - Mostrar data e valor.
        - Botão para confirmar pagamento da comissão individualmente ali mesmo.

## Resumo Técnico das Alterações de Banco de Dados Necessárias
Criarei um arquivo `supabase/migrations/003_full_update.sql` contendo:
1.  Criação da tabela `commissions` (se não existir).
2.  `ALTER TABLE order_items` para adicionar:
    - `layout_cost` (numeric)
    - `real_unit_price`, `real_customization_cost`, `real_layout_cost`, etc. (numeric)
    - Flags de pagamento: `unit_price_paid`, `customization_paid`, etc. (boolean)
3.  Atualização da função `save_order` para lidar com esses novos campos.
