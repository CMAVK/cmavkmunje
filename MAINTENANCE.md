# Keeping the site current

Tax, GST, ROC and labour laws change often. **All content that goes stale lives in
one file: [`src/lib/site.ts`](src/lib/site.ts).** Edit it there and the whole site
updates. After any review, bump the date.

## When a law / rate / form / due date changes

Open `src/lib/site.ts` and update the relevant export:

| What changed | Edit this export |
|--------------|------------------|
| Reviewed everything (always do this) | `lastReviewed` — set to the current month/year |
| A statutory due date | `dueDates` |
| A service, sub-service or new form | `serviceCategories[].items` |
| A FAQ answer (rate, threshold, section, form) | `faqs` |
| A practical update / notice | `updates` |
| Firm details (address, phone, hours, name) | `site` |
| The legal disclaimer wording | `disclaimer` |

### Calculators (rates & slabs)
Income-tax slabs, the §87A rebate, standard deduction and GST rates are in
[`src/components/Calculators.tsx`](src/components/Calculators.tsx) — search for
`taxNewRegime`, `stdDed`, `87A` and the GST rate `<option>` list. Update these when
the Finance Act / rates change, and update the FY/AY label shown to users.

## Publishing an update
```bash
npm run build      # confirm it compiles
git add -A && git commit -m "Update <what> for <law/rate/date> change"
git push           # Vercel auto-deploys to cmavkmunje.com
```

## Suggested review cadence
- **Monthly:** due dates / any notified extensions.
- **After every Union Budget / Finance Act:** income-tax slabs, rates, calculators.
- **On any GST Council / MCA / EPFO notification:** affected rates, forms, FAQs.

> Reminder: this site gives *general guidance*. The disclaimer (current as of
> `lastReviewed`) is shown on the footer, Resources and Tools pages. Keep it honest
> by updating `lastReviewed` whenever you review the content.
