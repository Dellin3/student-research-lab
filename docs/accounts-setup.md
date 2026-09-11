# Student accounts and research progress

The account and progress implementation is connected to Supabase project `poosoenwocirlebxwzla` (Research Starter Lab). The database migration is applied. Real API checks passed with two temporary synthetic accounts, which are removed after verification.

## Current release gate

**Existing accounts can sign in. Public email registration and password recovery remain closed until delivery is configured and verified.** `src/config/account.public.json` has `emailReady: false`. Do not change it just to expose buttons.

The Supabase connection exposes database/project tools, but does not expose Authentication configuration writes. The following settings need to be completed in the Supabase dashboard using the project owner's account:

1. Configure a custom SMTP (Simple Mail Transfer Protocol) sender, for example Resend with a verified sending domain. Supabase's built-in email sender is limited to organization members and is unsuitable for public student registration.
2. Set the Authentication Site URL to the currently released website address. For this preview, use `https://student-research-lab-git-codex-research-two-paths-delling.vercel.app`.
3. Allow these exact callback URLs:
   - `https://student-research-lab-git-codex-research-two-paths-delling.vercel.app/account`
   - `https://student-research-lab-git-codex-research-two-paths-delling.vercel.app/account?mode=recovery`
   - Add the corresponding production URLs under `https://student-research-lab-theta.vercel.app` when deploying production.
4. Keep email confirmation enabled. Match the minimum password policy to the UI's 12-character minimum. Review the provider's rate limits for the actual student audience.
5. With an explicitly authorized test inbox, verify delivery of signup confirmation and password-reset emails, successful callback handling, expired/reused links, and normal sign-in after resetting a password. The PKCE flow requires opening the email link in the browser where the request started.
6. After these checks, set `emailReady: true` in the public configuration and rebuild the same preview branch. `VITE_ACCOUNT_EMAIL_READY=true` is an alternative deployment setting.

Dashboard: https://supabase.com/dashboard/project/poosoenwocirlebxwzla/auth/providers

Official references:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/auth/sessions/pkce-flow
- https://supabase.com/docs/guides/deployment/going-into-prod

The provisioned project uses the free plan. For a school-wide service that must remain continuously available, review Supabase's inactivity-pausing and backup policies before launch; no paid plan has been enabled by this change.

## Configuration

The checked-in project URL and `sb_publishable_` key are intentionally public browser configuration. They confer no administrator privileges. Database access requires a student session and the database permissions below. Never add a secret/service-role key to the browser or repository.

Optional build overrides are `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Change them together when targeting an isolated environment. Changing the project changes the account/data store; do not casually switch it after students begin using the site.

## Data model and ownership

One document per student: `question`, `progress`, `sources`, and `nextStep`. Limits are enforced in both the browser and PostgreSQL. Research content is rendered as plain text, not injected HTML.

`research_progress` exposes SELECT only to signed-in users, restricted by row-level security to `auth.uid() = user_id`. The only client write entry point is `save_research_progress`. It derives the owner from the verified session, checks the expected revision atomically, and returns HTTP 409 on a conflict. Authenticated users have no direct table insert/update/delete grant. The definer function has an empty search path, fully qualified objects, and explicit ownership checks. The security advisor's authenticated-definer warning is expected for this guarded RPC; do not widen its grants.

Requests capture an access token for the editor's user so switching accounts while a request is pending cannot write the former user's notes to the new account. Password-recovery state is also tied to one user ID.

Autosaves are serialized and retain edits made during a request. Failed saves remain visibly unsaved. Local recovery slots are scoped to a user and editor so tabs do not overwrite each other's device backups. Conflicts require a deliberate choice; a lost response is recognized when the server already contains the submitted text. Normal sign-out drains pending saves. Legacy browser notes are never silently uploaded.

`Clear research text` saves an empty document through the same revision check. It does not delete the account or erase separate older device-recovery slots. Account/record deletion by an operator is handled in the Supabase dashboard; database deletion of an auth user cascades to that user's progress.

## Verification

- `npm run check:progress`: actual PostgreSQL migration/permissions checks with PGlite, and deterministic save/recovery/session tests.
- `npm run qa:release`: build, public content, routes, metadata, legacy-note compatibility, plus progress checks.
- `npm run check:accounts:live -- /absolute/private/synthetic-fixtures.json`: real Auth and REST checks. Only use scoped test users with `@example.invalid` addresses. Create fixtures through the project owner's administration tools, never disable email confirmation, never commit credentials, and remove test accounts after the run.

Live checks verify real sign-in, cloud persistence, another-session restore, token refresh, cross-user denial, direct-write denial, concurrent version checks, and signed-out/account-switch denial. They do not verify email delivery or browser form interaction. Those remain separate acceptance checks before opening public registration.
