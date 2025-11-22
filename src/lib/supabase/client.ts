import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

/**
 * Create a Supabase client for use in Client Components
 * This client is configured with the user's session from cookies
 */
export function createClient() {
  return createClientComponentClient<Database>();
}

/**
 * Singleton instance for client-side usage
 */
let clientInstance: ReturnType<
  typeof createClientComponentClient<Database>
> | null = null;

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>();
  }
  return clientInstance;
}
