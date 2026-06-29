# Re-enable normal public sign-up

Reverse the invite-only restriction so anyone can create an account, and open Google sign-in to all accounts.

## What changes

### 1. `src/routes/auth.tsx`
- Re-introduce a `mode` state (`"signin" | "signup"`) with a toggle link at the bottom of the card.
- In `handleEmail`, branch on `mode`: call `supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })` for sign-up, `signInWithPassword` for sign-in.
- Update the heading/subtext, submit button label, and `autoComplete` (`current-password` vs `new-password`) based on `mode`.
- Remove the "Access is invite-only. Contact an administrator to request an account." notice; replace with the standard "Don't have an account? Sign up" / "Already have an account? Sign in" toggle.
- Remove the `hd: "sharingexcess.com"` restriction from the Google OAuth `extraParams` so any Google account can sign in.

### 2. Backend auth settings
- Run `configure_auth` with `disable_signup: false` so public self-registration is allowed again. Keep anonymous users off and email auto-confirm off (unless you want instant access without email verification — tell me if so).

### 3. Project memory
- Update `mem://index.md` to reflect open public sign-up (no longer invite-only) and unrestricted Google OAuth.

## Notes
- The `is_org_member()` DB function still references `@sharingexcess.com` but is unused by RLS, so it's left untouched — data tables remain open to any authenticated user as today.
- The `inviteUser` admin server function stays in place; it's harmless and still usable, just no longer the only path in.
- While editing auth.tsx I'll also quietly resolve the existing SSR hydration mismatch on this page.

## Technical details
- `auth.tsx`: `mode` state, conditional `handleEmail`, toggle button using existing `Button`/`Link` styling, removal of `extraParams.hd`.
- `configure_auth`: `{ disable_signup: false, external_anonymous_users_enabled: false, auto_confirm_email: false, password_hibp_enabled: true }`.
