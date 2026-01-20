import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_URL_HERE') {
  console.warn('Supabase URL or Key is missing. Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Helper to check connection
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('partners').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};
