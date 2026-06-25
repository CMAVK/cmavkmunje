# VKM AI — WhatsApp & Website Chatbot Setup

This site runs one shared AI assistant ("VKM AI") on two channels:

| Channel | Endpoint | Status |
|---|---|---|
| Website chat widget | `/api/chat` (used by `VKMChatbot.tsx`) | Works as soon as `ANTHROPIC_API_KEY` is set |
| WhatsApp Business | `/api/whatsapp` (Meta Cloud API webhook) | Needs the WhatsApp env vars below + Meta setup |

The bot's persona, rules, services and knowledge live in **one place**:
`src/lib/vkmBrain.ts`. Edit that file to change how the bot answers on *both* channels.

---

## 1. Environment variables

Add these to your hosting environment (e.g. Vercel → Project → Settings → Environment Variables), then redeploy.

```
# AI brain (already used by the website chat)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: override the model (defaults to claude-haiku-4-5-20251001)
# CHAT_MODEL=claude-haiku-4-5-20251001

# WhatsApp Business (Meta Cloud API)
WHATSAPP_VERIFY_TOKEN=pick-any-long-secret-string
WHATSAPP_TOKEN=EAAG... (permanent access token)
WHATSAPP_PHONE_NUMBER_ID=1234567890
# Optional: WHATSAPP_GRAPH_VERSION=v21.0
```

> **Already present** (used elsewhere on the site, also reused by the WhatsApp bot for memory + lead capture):
> `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

If `ANTHROPIC_API_KEY` is missing, the website widget falls back to its built-in FAQ matcher and WhatsApp sends a polite "team will get back to you" reply.

---

## 2. Database

Run the updated `supabase-schema.sql` in **Supabase → SQL Editor** (safe to re-run). It adds the `whatsapp_messages` table, which gives the bot short-term memory per number and de-duplicates Meta's retries. WhatsApp leads land in your existing **`leads`** table with `source = 'whatsapp'`, so they appear in the admin panel alongside website leads.

---

## 3. Connect the number

> **Our number:** `9922099970` already runs on the **WhatsApp Business app** on the phone and we want to keep it that way. So we use **Coexistence** (Option A) — the app and the bot run on the SAME number at once. Only use Option B if you ever want a separate bot-only number.

### Option A — Coexistence (recommended: keep the app on 9922099970 + add the bot)

Coexistence (Meta, since May 2025) lets the WhatsApp Business **app** and the Cloud **API** share one number. New messages sync both ways in real time, so the bot can answer while you still chat from your phone. Available in India.

**Phone-side requirements first:**
- The number must be on the **WhatsApp Business app** (not personal WhatsApp), updated to the latest version.
- You are an **admin** of the linked Meta Business Portfolio.

**Steps:**
1. Create / use a Meta account at **business.facebook.com** and have a **Meta Business Portfolio** (Business Manager) for the firm.
2. Start **WhatsApp Cloud API onboarding** — either:
   - directly via **developers.facebook.com → My Apps → Create App (Business) → add the WhatsApp product**, or
   - through a provider's (BSP's) **Embedded Signup** that advertises "Coexistence".
3. In the signup flow, when asked how to add a number, choose the option to **use a number already on the WhatsApp Business app** (Coexistence). It shows a **QR code**.
4. On the phone: open **WhatsApp Business app → Settings → (Linked devices / Advanced / Business tools) → scan the QR code**. Approve linking. Optionally **import the last 6 months** of chats.
5. Back in Meta, the number now appears under WhatsApp → **API Setup**. Copy the **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`.
6. Create a **permanent access token**: Business Settings → **System Users** → add a system user → assign the app → generate a token with `whatsapp_business_messaging` + `whatsapp_business_management` permissions → set as `WHATSAPP_TOKEN`. (The temporary 24-hour token is only for first tests.)
7. **Configure the webhook:** WhatsApp → Configuration → Webhook → Edit:
   - **Callback URL:** `https://cmavkmunje.com/api/whatsapp`
   - **Verify token:** the exact value you set for `WHATSAPP_VERIFY_TOKEN`
   - Click **Verify and save** (triggers the GET handshake in `route.ts`).
   - Under **Webhook fields**, subscribe to **messages**.

**Coexistence rules to remember:**
- ⚠️ **Open the WhatsApp Business app on the phone at least once every 14 days.** If it stays unopened 14+ days, Meta cuts the API link and the bot stops until you reopen the app.
- Keep the SIM active in the phone; don't move the number to WhatsApp on another device in a way that unlinks it.
- The bot and you share the thread — if you reply manually from the phone, the customer just sees one conversation.

### Option B — Dedicated bot-only number (no Coexistence)

Use this only for a **separate** number (e.g. a second SIM), NOT for 9922099970. Once a plain number is migrated to the API, the normal app stops working on it.

1. developers.facebook.com → **My Apps → Create App (Business)** → add **WhatsApp**. Meta gives a free **test number** for trials.
2. Add and verify your separate business number, copy its **Phone Number ID**, create the permanent token, and configure the webhook exactly as in steps 5–7 above.
3. Complete **Meta Business Verification** + display-name approval to go fully live (takes a few days; the test number works meanwhile).

---

## 4. Test it

Use a **second phone** (not the one running the Business app) and message `9922099970`. Run through this checklist:

| Send this | Expected |
|---|---|
| `hi` (or `menu`) | The **interactive menu** appears — "Our Services" + "Quick Actions" with a "View options" button. |
| Tap **GST & Returns** | VKM AI sends a short GST intro and asks a follow-up question. |
| `What is the due date for GSTR-3B?` | A correct AI answer within a few seconds. |
| Tap **Free Checklists** → **GST Checklist** | The **GST checklist PDF** is delivered in chat. |
| Tap **Book Consultation** | A message with the `/connect` booking link + phone. |
| Tap **Talk to our team** | A handoff message asking for name/business/question. |
| Send a photo or PDF | A polite acknowledgement. |

Also confirm: the same threads appear in your **Business app** on your phone (Coexistence), a new row lands in **`leads`** (source `whatsapp`), and rows appear in **`whatsapp_messages`**. (Option B users test against the Meta test number.)

> Tip: while testing, watch **Vercel → your project → Logs** for the `/api/whatsapp` function — any send/Claude errors are logged there with a `[whatsapp]` prefix.

---

## How it works (for future maintenance)

```
Client → WhatsApp ──► /api/whatsapp (GET verify, POST receive)
Client → Web widget ─► /api/chat (POST)
                           │
                           └──► src/lib/vkmBrain.ts  (system prompt + callClaude)
                                        │
                                        └──► Anthropic API → reply
WhatsApp also: loads last 12 msgs from whatsapp_messages → replies via Graph API
               → stores both messages → inserts a lead on first contact.
```

- **Change the bot's behaviour / persona / rules:** `src/lib/vkmBrain.ts`.
- **Change firm services, FAQs, due dates the bot quotes:** `src/lib/site.ts` (shared with the whole website).
- **WhatsApp delivery, menu, document sending:** `src/lib/whatsapp.ts` (menu rows, checklists, canned messages) + `src/app/api/whatsapp/route.ts` (routing).

### Menu & checklists (Phase 2 — built in)
- Typing **hi / hello / menu / namaste** shows a tap-able list menu. Tapping a **service** gives an AI intro; **Free Checklists** sends the PDFs from `/public/downloads`; **Book** / **Talk to our team** send canned messages.
- To add/rename menu rows or checklists, edit the `sendMainMenu`, `sendChecklistMenu` and `CHECKLISTS` definitions in `src/lib/whatsapp.ts`. WhatsApp limits: max 10 rows per list, row title ≤ 24 chars.
- Sending a checklist works because the PDFs are publicly served at `https://cmavkmunje.com/downloads/<file>.pdf`.

### Notes & limits
- The webhook processes synchronously then returns 200 (Haiku is fast). If you later move to a slower model, consider acknowledging first and processing in the background.
- WhatsApp's 24-hour customer-service window applies: the bot can reply freely within 24h of a user's message. Proactively messaging users **outside** that window needs pre-approved message templates.
- Outbound documents must be on a public HTTPS URL (the checklists already are). For private/per-client files, upload to WhatsApp Media first — a future enhancement.
