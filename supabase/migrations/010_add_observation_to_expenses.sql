-- Add observation column to company_expenses
ALTER TABLE company_expenses ADD COLUMN IF NOT EXISTS observation text;
