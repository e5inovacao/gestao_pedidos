I will fix the React "uncontrolled input" error, the "invalid enum" error, the empty supplier dropdowns, and ensure order persistence works correctly.

1.  **Database Updates**:
    -   Create a `products` table in Supabase to store products persistently (resolving the `PRODUTO` enum error in `partners`).
    -   Add necessary RLS policies for the new table.

2.  **Fix `OrderForm.tsx`**:
    -   **React Error**: Rename `cnpj` to `doc` in the `clientData` initial state to match the input value binding (fixing `undefined` -> `defined` transition).
    -   **Enum Error**: Update `savePartner` to insert into the new `products` table when `activeModal` is 'PRODUTO'.
    -   **Suppliers Dropdown**: Pass the `suppliersList` state to the "Fornecedor Produto" and cost breakdown `CustomSelect` components (currently hardcoded as `[]`).
    -   **Products Dropdown**: Fetch products from the new `products` table and pass them to the Product `CustomSelect`.

3.  **Verify `OrderList.tsx`**:
    -   Ensure the query correctly joins `partners` to display client names.
    -   The "No orders found" message is expected if the database is empty; the integration test will populate it.

4.  **Integration Testing**:
    -   Create `scripts/test-order-flow.ts` to automate the creation of a client, supplier, product, and a complete order, verifying the data persistence chain.
