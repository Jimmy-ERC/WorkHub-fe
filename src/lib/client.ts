import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase usando variables de entorno
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://pzplniihhetjlxdkhljz.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cGxuaWloaGV0amx4ZGtobGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDYzNDUsImV4cCI6MjA3Mzk4MjM0NX0.htEHBIbFHMK39Vrjwr1Rqd3JtdpevmoAFmCsSC7BObE";

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // ✅ Importante para mantener la sesión
    autoRefreshToken: true, // ✅ Renovar automáticamente el token
  },
});
// Type-safe client
export type SupabaseClient = typeof supabase;
