-- Migration to add projection columns to order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS tax_pct numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS unforeseen_pct numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS margin_pct numeric DEFAULT 0;
