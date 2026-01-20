# Plano de Implementação: Módulo Financeiro Completo

Este plano visa criar um controle financeiro robusto, integrando Contas a Receber (vendas), Contas a Pagar (custos de pedidos + despesas fixas) e Relatórios consolidados.

## 1. Banco de Dados (Novas Estruturas)
Para suportar despesas não atreladas a pedidos (ex: aluguel, salários), criaremos uma nova tabela.

*   **Tabela `company_expenses`:**
    *   `id` (uuid)
    *   `description` (texto) - ex: "Aluguel Março"
    *   `amount` (numeric) - Valor
    *   `due_date` (date) - Vencimento
    *   `paid` (boolean) - Status Pagamento
    *   `paid_date` (date) - Data Pagamento
    *   `category` (texto) - ex: "FIXO", "SALÁRIO", "IMPOSTO"
    *   `recurrence` (texto) - Opcional (Mensal, Único)

## 2. Nova Página: Contas a Receber (`ReceivablesPage.tsx`)
Uma visão centralizada de todas as entradas de dinheiro previstas.

*   **Fonte de Dados:** Tabela `orders`.
*   **Lógica de Exibição:**
    *   Cada pedido gerará até 2 linhas: uma para "Entrada" e outra para "Restante" (se houver valores).
*   **Funcionalidades:**
    *   **Visualização:** Colunas de Cliente, Pedido, Parcela (Entrada/Restante), Valor, Vencimento e Status.
    *   **Indicadores de Atraso:** Linhas com data vencida e não pagas ficarão destacadas em vermelho.
    *   **Ação Rápida:** Botão para confirmar recebimento (atualiza o pedido automaticamente).

## 3. Nova Página: Contas a Pagar (`PayablesPage.tsx`)
Uma central de custos unificada com duas abas ou seções.

*   **Seção A: Custos de Pedidos (Operacional)**
    *   **Fonte:** Tabela `order_items` (sincronizada via banco).
    *   **Exibição:** Lista detalhada de custos por item (Fornecedor, Frete, Personalização).
    *   **Sincronização Bidirecional:**
        *   Input de "Valor Real" editável.
        *   Checkbox de "Pago".
        *   *Ao alterar aqui, atualiza automaticamente o pedido original e vice-versa.*
    
*   **Seção B: Despesas da Empresa (Fixo/Outros)**
    *   **Fonte:** Nova tabela `company_expenses`.
    *   **Funcionalidades:** Adicionar, Editar e Excluir despesas (Luz, Água, Folha de Pagamento).

## 4. Atualização de Relatórios (`ReportsPage.tsx`)
O relatório será expandido para ser um DRE (Demonstrativo de Resultado) simplificado.

*   **Novos KPIs:**
    *   Receita Bruta (Soma de Pedidos)
    *   (-) Custos Variáveis (Soma de `order_items`)
    *   (-) Despesas Fixas (Soma de `company_expenses`)
    *   (-) Comissões
    *   (=) Lucro Líquido Real
*   **Gráficos:** Fluxo de Caixa (Entradas vs Saídas no tempo).

## 5. Navegação (`Navbar.tsx` e `App.tsx`)
*   Adicionar menu "Financeiro" com as novas rotas:
    *   `/receivables` (A Receber)
    *   `/payables` (A Pagar)
