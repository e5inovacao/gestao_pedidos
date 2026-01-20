I will resolve the `PGRST204` error and implement robust registration with the following steps:

1.  **Fix Schema Mismatch in `OrderForm.tsx`**:
    -   Update the `savePartner` function to map the frontend data to the `doc` column instead of `cnpj`, matching the database schema.

2.  **Implement Real Persistence in `RegistrationForm.tsx`**:
    -   Replace the mock `alert` with actual Supabase integration.
    -   Implement `insert` logic for the `partners` table using the correct column names (`doc`, `financial_email`).
    -   Add form validation (required fields) and user feedback (loading states, success/error messages).

3.  **Create Automated Test Script**:
    -   Create `scripts/test-registration.ts` to automatically verify the registration flow.
    -   The script will simulate a partner insertion, verify the data in the database, and clean up the test data.

4.  **Documentation**:
    -   Create a technical document `.trae/documents/Correção_Cadastro_e_Testes.md` detailing the solution, validation rules, and how to run the tests.
