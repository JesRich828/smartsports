import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Invite-only access: only an already signed-in staff member can invite a new
// user. requireSupabaseAuth guarantees the caller is authenticated; the admin
// client then sends the invite email. Public self-registration is disabled in
// auth settings, so this is the only way to grant new access.
export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let redirectTo: string | undefined;
    try {
      redirectTo = new URL(getRequestUrl()).origin;
    } catch {
      redirectTo = undefined;
    }

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      redirectTo ? { redirectTo } : undefined,
    );

    if (error) throw new Error(error.message);
    return { ok: true };
  });