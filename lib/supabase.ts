import { createClient } from '@supabase/supabase-js';

// Fallback to avoid crashing the app if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('CRITICAL ERROR: Supabase URL or Key is missing in environment variables!');
  // We don't throw here to allow the UI to render and show the error via global handler
}

export const supabase = createClient(supabaseUrl, supabaseKey);

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
