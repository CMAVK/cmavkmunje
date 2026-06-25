# WhatsApp Bot — Final Activation (hand this to your tech person)

**Context:** The website already has a working AI assistant. The WhatsApp bot
code is built and deployed. The webhook endpoint is **live** at
`https://cmavkmunje.com/api/whatsapp` (verified — returns 200). Only **two
steps remain** to make WhatsApp answer clients. ~10–15 minutes.

The business owner has **already done** the WhatsApp **Coexistence QR scan**
(number `9922099970` is linked to the Meta Cloud API, and the Business app on
the phone still works). Do NOT migrate the number again.

Full reference: `WHATSAPP-SETUP.md` in this repo. Quick version below.

---

## Step 1 — Set 3 environment variables in Vercel

Vercel → project **cmavkmunje** → **Settings → Environment Variables**
(Production **and** Preview), then **redeploy**:

| Name | Value | Where to get it |
|---|---|---|
| `WHATSAPP_PHONE_NUMBER_ID` | the number's Phone Number ID | Meta → developers.facebook.com → the app → **WhatsApp → API Setup**, under the number |
| `WHATSAPP_TOKEN` | access token | Same API Setup page. **Best:** create a **System User** permanent token (Business Settings → System Users → add → assign app → generate with `whatsapp_business_messaging` + `whatsapp_business_management`). The temporary token there expires in 24h. |
| `WHATSAPP_VERIFY_TOKEN` | any secret string you choose, e.g. `vkm-secret-2026` | you invent it; must match Step 2 |

> `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
> are already set. After saving env vars, **redeploy** (Deployments → ••• →
> Redeploy) — env vars only apply after a redeploy.

## Step 2 — Configure the webhook in Meta

Meta → the app → **WhatsApp → Configuration → Webhook → Edit**:

- **Callback URL:** `https://cmavkmunje.com/api/whatsapp`
- **Verify token:** the exact `WHATSAPP_VERIFY_TOKEN` from Step 1
- Click **Verify and save** (must succeed — if it fails, the verify token
  doesn't match or the redeploy in Step 1 wasn't done yet)
- Under **Webhook fields → Manage**, **subscribe to `messages`** ✅

## Step 3 — (recommended) Database for memory + leads

In Supabase → **SQL Editor**, run the `whatsapp_messages` block from
`supabase-schema.sql` (safe to re-run). Without it the bot still replies, but
won't remember conversations or save WhatsApp leads to the admin panel.

---

## Test (2 minutes)

From a **different** phone, message `9922099970`:

- Send `hi` → an interactive **menu** appears (services + quick actions).
- Send `What is the GSTR-3B due date?` → a correct AI reply in a few seconds.
- Tap **Free Checklists → GST Checklist** → a PDF is delivered.

Watch **Vercel → Logs** (filter `/api/whatsapp`) for any `[whatsapp]` errors.

## Notes

- **Coexistence rule:** the owner must open the WhatsApp Business app on the
  phone at least once every 14 days, or Meta cuts the API link.
- Bot persona/rules: `src/lib/vkmBrain.ts`. Menu/checklists:
  `src/lib/whatsapp.ts`. Webhook: `src/app/api/whatsapp/route.ts`.
- WhatsApp's 24-hour service window applies; proactive messages outside it
  need approved templates.
