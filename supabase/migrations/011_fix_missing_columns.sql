-- Migration to fix missing columns in order_items
-- Run this in Supabase SQL Editor to fix "column does not exist" errors

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS layout_cost numeric(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS real_layout_cost numeric(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS layout_paid boolean DEFAULT false;

-- Ensure other potentially missing columns also exist (idempotent)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS real_unit_price numeric(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS real_customization_cost numeric(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS real_supplier_transport_cost numeric(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS real_client_transport_cost numeric(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS real_extra_expense numeric(10,2) DEFAULT 0;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price_paid boolean DEFAULT false;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS customization_paid boolean DEFAULT false;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS supplier_transport_paid boolean DEFAULT false;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS client_transport_paid boolean DEFAULT false;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS extra_expense_paid boolean DEFAULT false;
