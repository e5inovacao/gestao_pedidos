# Solução de Erro de Persistência e Implementação de Testes Automatizados

## 1. Descrição do Problema
O sistema apresentava erros recorrentes ao tentar salvar novos cadastros de parceiros (Clientes/Fornecedores):
`Erro ao salvar: {code: PGRST204, ... message: Could not find the 'cnpj' column of 'partners' in the schema cache}`

**Causa Raiz:**
O código frontend (`OrderForm.tsx`) estava tentando inserir dados na coluna `cnpj`, porém o esquema do banco de dados (tabela `partners`) utiliza a nomenclatura `doc` para este campo.

## 2. Correções Implementadas

### 2.1. Ajuste de Mapeamento em `OrderForm.tsx`
Foi corrigida a função `savePartner` para mapear corretamente o campo do formulário para a coluna do banco:
```typescript
// ANTES
cnpj: newPartnerData.doc

// DEPOIS
doc: newPartnerData.doc
```

### 2.2. Implementação Completa em `RegistrationForm.tsx`
A tela de "Novo Cadastro" (`/cadastros/novo`) era apenas um protótipo visual. Foi implementada a lógica real de persistência:
- Integração com `supabase.from('partners').insert(...)`.
- Mapeamento correto dos campos (`name`, `doc`, `phone`, `email`, `financial_email`).
- Validação de campos obrigatórios antes do envio.
- Tratamento de erros (try/catch) com feedback visual ao usuário via `alert`.
- Estado de carregamento (`loading`) para evitar múltiplos envios.

## 3. Testes Automatizados

Foi criado um script de teste automatizado para validar o fluxo de cadastro e garantir que o erro de coluna não retorne.

**Arquivo:** `scripts/test-registration.ts`

**O que o teste faz:**
1.  Conecta ao Supabase usando as variáveis de ambiente locais.
2.  Insere um parceiro de teste com timestamp único.
3.  Verifica se a inserção retornou sucesso.
4.  Realiza uma consulta (`SELECT`) para confirmar que os dados foram gravados corretamente (especialmente a coluna `doc`).
5.  Remove o registro de teste para não sujar o banco.

**Como executar o teste:**
No terminal, execute o comando:
```bash
npx tsx scripts/test-registration.ts
```

**Resultado Esperado:**
```text
🚀 Iniciando teste automatizado...
💾 Tentando inserir parceiro...
✅ Inserção realizada com sucesso!
🔍 Verificando persistência...
✅ Dados verificados corretamente!
🎉 TESTE DE REGISTRO PASSOU COM SUCESSO!
```

## 4. Conclusão
O sistema agora possui cadastro funcional tanto na tela de pedido (cadastro rápido) quanto na tela dedicada de cadastros. A integridade dos dados é garantida pela validação de campos e correspondência exata com o esquema do banco de dados.
