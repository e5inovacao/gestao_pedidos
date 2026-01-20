-- Ensure layout_cost exists in order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS layout_cost numeric DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS real_layout_cost numeric DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS layout_paid boolean DEFAULT false;
