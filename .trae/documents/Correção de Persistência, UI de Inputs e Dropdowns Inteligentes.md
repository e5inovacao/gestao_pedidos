O plano a seguir detalha as correções e melhorias solicitadas para a persistência de dados, a interface do formulário e a usabilidade dos campos de data e dropdowns.

## 1. Correção da Persistência de Dados
- **Problema**: O salvamento depende de uma função RPC (`save_order`) que pode não ter sido criada no banco de dados, ou pode haver falhas silenciosas na chamada.
- **Solução**:
    - Verificar a existência da RPC e recriá-la se necessário via SQL (instruindo o usuário).
    - Adicionar logs detalhados no `try/catch` do `validate` para capturar erros específicos do Supabase.
    - Garantir que campos opcionais (como `invoice_number`) sejam tratados corretamente (null vs string vazia).

## 2. Ajuste Visual dos Inputs (Data e Valor)
- **Problema**: Os inputs de data e valor estão com classes CSS que podem causar problemas de layout (`w-full`, `absolute`, etc.) ou tamanho inadequado.
- **Solução**:
    - Ajustar as classes Tailwind dos inputs de data dentro do card financeiro para garantir que o ícone de calendário não fique sobreposto ou invisível.
    - Melhorar a legibilidade dos inputs de valor (`bg-white/10` para algo mais legível se necessário, ou ajustar contraste).
    - Garantir que o input de data preencha o container corretamente sem quebrar o layout.

## 3. Comportamento Inteligente de Datas
- **Funcionalidade**:
    - Ao confirmar um pagamento (Entrada ou Restante), a data deve ser preenchida automaticamente com a data atual (`new Date().toISOString().split('T')[0]`), mas permitir edição manual.
    - Validar se a data inserida é válida.

## 4. Dropdowns Persistentes e Inteligentes (`CustomSelect`)
- **Problema**: O dropdown atual apenas filtra uma lista local ou carregada uma vez. Adicionar novo item apenas abre um modal, mas não atualiza a lista após o salvamento.
- **Solução**:
    - Modificar o `CustomSelect` para aceitar um `onAddSuccess` ou similar, que recarrega a lista após um cadastro rápido.
    - Implementar a função de salvar novo parceiro/produto diretamente no banco quando o modal de "Adicionar Novo" for submetido.
    - Atualizar a lista de opções (`clientsList`, `suppliersList`) imediatamente após um novo cadastro ser feito com sucesso.

---
### Arquivos Afetados
1.  `pages/OrderForm.tsx`: Lógica de validação, renderização dos inputs, comportamento do modal.
2.  `supabase/rpc_save_order.sql`: (Apenas referência, já criado, mas verificaremos se precisa de ajustes).

### Passos de Execução
1.  Refatorar `OrderForm.tsx` para corrigir os inputs de data e valor.
2.  Implementar a lógica de autopreenchimento de data ao confirmar pagamento.
3.  Implementar a persistência real no Modal de cadastro rápido (`handleSavePartner`).
4.  Atualizar o estado das listas após cadastro.
