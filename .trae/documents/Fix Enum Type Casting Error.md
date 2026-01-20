I have identified the issue: The `status` column in the `orders` table is of type `order_status` (an enum), but the frontend is sending a string, and the RPC function is trying to insert it directly as `text`. PostgreSQL requires an explicit cast when inserting text into an enum column if the context doesn't make it obvious.

I will implement the following fix:

1.  **Update SQL (`supabase/install.sql`)**:
    -   Modify the `save_order` RPC function to explicitly cast the status input to `order_status`.
    -   Example: `(p_order->>'status')::order_status`

2.  **Verify Frontend (`OrderForm.tsx`)**:
    -   Ensure the status values in the dropdown match exactly the expected enum values (e.g., 'EM ABERTO', 'FINALIZADO'). The current code seems to match, but I will double-check.

3.  **Documentation**:
    -   Update the technical documentation to list the valid enum values for future reference.

4.  **Verification**:
    -   I will not run the test script automatically because it requires the user to execute the SQL in the Supabase dashboard first. Instead, I will provide the updated SQL and instruct the user to run it.
