-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies for Authenticated Users (Allow everything for now, but restrict anon)
-- Orders
CREATE POLICY "Authenticated users can view orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update orders" ON orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete orders" ON orders FOR DELETE TO authenticated USING (true);

-- Order Items
CREATE POLICY "Authenticated users can view items" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert items" ON order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update items" ON order_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete items" ON order_items FOR DELETE TO authenticated USING (true);

-- Partners
CREATE POLICY "Authenticated users can view partners" ON partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert partners" ON partners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update partners" ON partners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete partners" ON partners FOR DELETE TO authenticated USING (true);

-- Products
CREATE POLICY "Authenticated users can view products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE TO authenticated USING (true);

-- Commissions
CREATE POLICY "Authenticated users can view commissions" ON commissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert commissions" ON commissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update commissions" ON commissions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete commissions" ON commissions FOR DELETE TO authenticated USING (true);

-- Order Logs
CREATE POLICY "Authenticated users can view logs" ON order_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert logs" ON order_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Grant usage to authenticated
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
