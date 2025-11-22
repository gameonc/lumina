import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Create a Supabase client for use in Middleware
 * This handles session refresh and authentication
 */
export async function createMiddlewareSupabaseClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createMiddlewareClient<Database>({
    req: request,
    res: response,
  });

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession();

  return { supabase, response };
}
