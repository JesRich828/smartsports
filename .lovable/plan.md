# Open up access — remove the @smartsports.org lock

You want the app to stop being restricted to `@smartsports.org` accounts. Right now the restriction is enforced in **three layers**, so all three must change or the app will look open but still block people:

1. The sign-in screen (placeholder + validation text)
2. The Google OAuth `hd` (hosted-domain) parameter
3. The database access rules (RLS) that only grant data to verified `@smartsports.org` users

## What will change

### 1. Sign-in screen — `src/routes/auth.tsx`
- Change the email placeholder from `you@smartsports.org` to **`Enter your email`**.
- Remove the `ORG_EMAIL_DOMAIN` constant and the sign-up validation block that rejects non-`@smartsports.org` emails.
- Update the sign-up helper text (currently "Register with your @smartsports.org email…") to a neutral message like "Register to access the dashboard."
- Remove the footer line "Registration is restricted to @smartsports.org email addresses."
- Remove `extraParams: { hd: "smartsports.org" }` from the Google sign-in call so **any Google account (including personal Gmail) can sign in**.

### 2. Database access rules (RLS) — new migration
The 10 data tables (`donors`, `grants`, `board_members`, `golf_sponsors`, `golf_foursomes`, `golf_players`, `golf_auction`, `golf_expenses`, `sponsors`, `goals`) currently gate read/write on `is_org_member(auth.uid())`. They will be changed to allow **any authenticated (signed-in) user** to read and write, matching the open sign-up.

```text
Before:  USING is_org_member(auth.uid())   →   After:  TO authenticated USING (true)
```

`organization_settings` already allows any authenticated user, so it stays as-is. The `is_org_member()` function will be left in place (harmless) unless you'd prefer it dropped.

### 3. Auth settings
Public sign-up stays enabled (already on). No change needed there.

## Important consequences (please confirm you accept these)
- **Anyone who signs up — with any email or any Gmail — will be able to read and edit all donor, grant, board, golf, sponsor, and goal data.** The app effectively becomes open to any registered user.
- This reverses the security hardening from earlier requests. I'll update the project memory and the security memory to reflect the new open-access model so future scans don't flag it as a regression.

## Technical details
- `auth.tsx`: pure frontend edits (placeholder, copy, remove validation branch, remove `hd` param).
- Migration: `DROP POLICY` + `CREATE POLICY ... FOR ALL TO authenticated USING (true) WITH CHECK (true)` on each of the 10 tables. GRANTs already exist for `authenticated`, so no GRANT changes needed.
- Memory updates: revise `mem://index.md` core rule and the architecture memory; update the security memory via the security tool.
