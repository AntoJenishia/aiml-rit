import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Public client (for client components & public data)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (server-side only, bypasses RLS for batch imports & admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Formats profile image URLs from RIT IMS portal.
 * If URL is "uploads/1769227169.JPG", prepends "https://ims.ritchennai.edu.in/".
 */
export function formatProfileUrl(rawProfile: string | null | undefined): string | null {
  if (!rawProfile) return null;
  const trimmed = String(rawProfile).trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "—") return null;
  
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  
  const cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  return `https://ims.ritchennai.edu.in/${cleanPath}`;
}

