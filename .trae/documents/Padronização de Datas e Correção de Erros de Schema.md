# Plano de Ação: Padronização de Datas e Correção de Erros

## 1. Padronização de Datas (DD/MM/AAAA)

Para garantir que todas as datas sejam exibidas e manipuladas no formato brasileiro (DD/MM/AAAA) independentemente da configuração do navegador do usuário, implementarei uma solução centralizada.

### 1.1. Utilitário de Datas (`src/utils/dateUtils.ts`)
Criarei um arquivo de utilitários com as seguintes funções:
*   `formatDate(dateString: string): string`: Converte datas ISO (`YYYY-MM-DD`) para `DD/MM/AAAA` forçando o fuso horário correto para evitar problemas de "dia anterior".
*   `parseDate(dateString: string): string`: Converte `DD/MM/AAAA` para ISO (para APIs).
*   `isValidDate(dateString: string): boolean`: Valida se a data é real e está no formato correto.

### 1.2. Aplicação nos Componentes
Atualizarei os seguintes arquivos para usar o novo utilitário:
*   **`OrderList.tsx`**: Substituir `toLocaleDateString` por `formatDate`.
*   **`OrderForm.tsx`**:
    *   Manter `<input type="date">` (que usa ISO internamente) para garantir compatibilidade móvel e validação nativa, mas garantir que a validação lógica use as novas funções.
    *   No modo "Visualização" (Read-Only), usar `formatDate` para exibir o texto formatado.
*   **`ReportsPage.tsx`** e **`CommissionPage.tsx`**: Garantir que todas as datas exibidas nas tabelas e gráficos usem o formato padrão.

---

## 2. Correção do Erro `PGRST205` (Tabela Ausente)

O erro `Could not find the table 'public.commissions'` ocorre porque o script de migração criado anteriormente (`002_commissions.sql`) ainda não foi executado no banco de dados Supabase.

### 2.1. Tratamento de Erro Robusto
Como não posso executar comandos SQL de criação de tabela diretamente via código do frontend (por segurança), implementarei uma proteção no código:
*   **Interceptação de Erro:** Nos arquivos `CommissionPage.tsx` e `ReportsPage.tsx`, adicionarei um tratamento específico no `try/catch`.
*   **Mensagem Amigável:** Se o erro `PGRST205` for detectado, o sistema exibirá um alerta visual (Banner) instruindo o usuário a rodar a migração, em vez de quebrar a página ou mostrar erro no console.

### 2.2. Testes
*   Criarei um teste unitário para `dateUtils.ts` garantindo que a formatação e validação funcionem corretamente.

---

## 3. Resumo da Execução
1.  Criar `src/utils/dateUtils.ts`.
2.  Criar `src/utils/dateUtils.test.ts`.
3.  Refatorar `OrderList`, `OrderForm`, `CommissionPage`, `ReportsPage`.
4.  Implementar verificação de "Tabela Ausente" nas páginas de relatório e comissão.
