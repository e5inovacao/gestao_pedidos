I will implement the requested UI and functional changes across the application.

### 1. **Order Form Updates (`pages/OrderForm.tsx`)**
-   **Date Inputs (PT-BR):** Ensure all date inputs use `type="date"`. Note that the display format (DD/MM/YYYY) is determined by the user's browser/OS locale, but I will explicitly set `lang="pt-BR"` on inputs to encourage this behavior.
-   **Remove Selection Colors:** Remove the conditional styling (green/red backgrounds) from the **Status** and **Seller** dropdowns so they remain neutral (white/gray) when selected.
-   **Add "Layout" Field:** Insert a new input field labeled **"LAYOUT"** in the "Comercial" section (Sidebar), matching the style of existing fields like "Faturamento".
-   **Fixed Sidebar:** Change the sidebar positioning from `sticky` to `fixed` on large screens to ensure it stays visible during scrolling, as requested.
-   **Read-Only Mode:** Implement a "View Mode" logic.
    -   Check the URL for a `?mode=view` parameter.
    -   If present, disable all inputs (Status, Dates, Values, Items) and hide the "Finalizar Pedido" button.

### 2. **Order List Updates (`pages/OrderList.tsx`)**
-   **Sync Status Filters:** Update the "Status" filter dropdown to include all options from the system (Em Aberto, Em Produção, Aguardando Aprovação, etc.), matching the Order Form exactly.
-   **Read-Only Navigation:** Update the table rows so that clicking an order redirects to the Order Form in **read-only mode** (`/pedido/{id}?mode=view`), preventing accidental edits.

### 3. **Header & User Session (`App.tsx`)**
-   **User Menu:** Implement a dropdown menu on the User Avatar (header).
    -   **Display Email:** Show the currently logged-in user's email.
    -   **Logout:** Add a "Sair" (Logout) button to securely sign out of the application.

### 4. **Verification**
-   Verify the date inputs display correctly.
-   Confirm the sidebar is fixed.
-   Test the read-only mode by clicking an order in the list.
-   Check the Status filter options.
-   Test the Logout functionality.
