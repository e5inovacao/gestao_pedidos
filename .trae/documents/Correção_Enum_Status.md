# Correção de Tipo Enum (Status do Pedido)

## Problema Identificado
Erro `42804: column "status" is of type order_status but expression is of type text`.
O banco de dados espera um tipo enumerado (`order_status`) mas estava recebendo um texto simples através da função RPC.

## Solução Implementada
O script SQL de instalação foi atualizado para fazer a conversão explícita (cast) do valor de texto para o tipo enum correto.

**Alteração no SQL:**
```sql
(p_order->>'status')::order_status
```

## Valores Permitidos para Status
Certifique-se de que o frontend envie apenas um dos seguintes valores (exatamente como escrito):
- 'EM ABERTO'
- 'EM PRODUÇÃO'
- 'AGUARDANDO APROVAÇÃO'
- 'AGUARDANDO NF'
- 'AGUARDANDO PAGAMENTO'
- 'AGUARDANDO PERSONALIZAÇÃO'
- 'FINALIZADO'

Qualquer outro valor resultará em erro de "invalid input value for enum".

## Como Aplicar a Correção
1. Copie o conteúdo atualizado de `supabase/install.sql`.
2. No Supabase Dashboard, vá para o **SQL Editor**.
3. Cole o código e execute (RUN).
   *Isso irá recriar a função `save_order` com a correção.*
