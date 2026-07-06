# Studio ESEM Release — how it works & go-live runbook

End-to-end reference for the **Studio ESEM Photography & Videography Release**
(the WSI "Come Dance With Me" dancer form, and any future client shoot).

---

## 1. The three moving parts

```
FRONTEND (this repo: storybox-forms)         WORKER (repo: iwc-rugby-worker,          WEBFLOW
                                              local: ~/Projects/studioesem/            (Studio ESEM
                                              storybox-worker)                          workspace)
─────────────────────────────────────        ─────────────────────────────────       ────────────────
forms.studioesem.com/release/<key>            POST /studio-esem-release          →     Copyright Submissions
  │  React form, Studio ESEM branding           • rate-limit + honeypot                 collection
  │  copy from studioEsemReleases.js            • upload signatures → R2                 (or a dedicated
  └─ POSTs FormData  ───────────────────►       • create Webflow CMS item               "Studio ESEM Releases"
     to storybox-stories-api.workers.dev        • email team + contributor              collection if configured)
                                                   ("Studio ESEM" via storybox.co,
                                                    reply-to hello@studioesem.com)
```

**Status: LIVE.** Worker deployed; endpoint verified. The form works end to end.

- **Frontend** — `src/StudioEsemReleaseForm.jsx`, config in `src/studioEsemReleases.js`,
  routed in `src/main.jsx`. Served in Studio ESEM mode (`forms.studioesem.com`
  or `?brand=studioesem` locally) at `/release/<key>`.
- **Worker** — one shared Cloudflare Worker deployed as `storybox-stories-api`
  (`storybox-stories-api.<...>.workers.dev`). Repo is confusingly named
  `iwc-rugby-worker`; the file is `storybox-worker.js`. Handler added at
  `POST /studio-esem-release`, modeled on `/talent-release`.
- **Webflow** — submissions become CMS items. See §5 for the collection choice.

---

## 2. Fields sent by the form

| FormData key | Notes |
|---|---|
| `project` | the release key from the URL (`wsi-dance`). Must be in the handler's `ALLOWED_PROJECTS`. |
| `client` | client name, e.g. `UAP/WSI`. |
| `consent-name` | typed name in the consent clause. |
| `filming-location`, `filming-date` | shoot location + date. |
| `usage-provisions` | the "End Client Required Usage" text. |
| `credit` | freetext — how the dancer wishes to be credited. |
| `full-name`, `street-address`, `city`, `state`, `postcode`, `phone`, `email-address` | contributor details. |
| `paid-participant`, `under-18` | `"true"` / `"false"`. |
| `general-signature`, `general-signature-date` | signature PNG → R2. |
| `parent-signature`, `parent-signature-date` | if under 18. |
| `website`, `elapsed` | spam gates (honeypot + time-on-page). |

The extra fields over `/talent-release` are `client`, `usage-provisions`, `credit`.
They're written into the Webflow item's **Moderator Notes** (and the
`photo-description` summary), so no new Webflow columns are strictly required.

---

## 3. Go-live checklist

**Steps 1–2 are DONE (live in production).** 3–4 are optional polish.

### 1. Deploy the worker endpoint  ✅ DONE
The `/studio-esem-release` handler is merged into `keep-warm-cron` and
deployed (`storybox-stories-api`). To ship future changes:
```bash
cd ~/Projects/studioesem/storybox-worker
npx wrangler deploy
```

### 2. Email sending  ✅ DONE (free)
Emails send from **`Studio ESEM <stories@storybox.co>`** with replies routed
to **`hello@studioesem.com`** (`ESEM_EMAIL_FROM` / `ESEM_EMAIL_REPLY_TO`).
This reuses the already-verified `storybox.co` domain, so **no Resend upgrade
and no DNS change is needed** — Resend's free tier only allows one verified
domain. To send from `hello@studioesem.com` *itself*, verify `studioesem.com`
in Resend (paid tier) and set `ESEM_EMAIL_FROM` back to it.

### 3. (Optional) dedicated Webflow collection
By default, dancer releases land in the existing **Copyright Submissions**
collection, tagged `Copyright Status = "Studio ESEM Release"` — filterable,
zero setup. To give them their own collection instead, see §4.

### 4. Test
- Local: `npm run dev`, open `/release/wsi-dance?brand=studioesem`, submit.
- Prod: submit a test entry, confirm the Webflow item + both emails arrive,
  click the signature R2 link.

---

## 4. The Webflow Collection ID (the "connection ID" bit)

**You don't have to do this to go live** — without it, submissions use the
shared Copyright Submissions collection. Set it only when you want dancer
releases in their *own* collection.

**a. Create the collection.** In Webflow (STORYBOX site, Studio ESEM
workspace) → CMS → **Create Collection** → name it `Studio ESEM Releases`.
Easiest: duplicate the **Copyright Submissions** collection so the field
*slugs* match (`full-name`, `email-address`, `phone`, `photo-description`,
`copyright-status`, `indemnity-agreed`, `project`, `submitted-date`,
`moderator-notes`). The worker writes those exact slugs.

**b. Get its Collection ID.** A 24-character hex string (like the existing
`69e4d7a1cb2b7aea34ed8457`). Two ways:
- **Via the API** (reliable) — with the worker's Webflow token:
  ```bash
  # list sites → get your site id
  curl -s https://api.webflow.com/v2/sites \
    -H "Authorization: Bearer $WEBFLOW_API_TOKEN" | jq '.sites[] | {id, displayName}'
  # list collections → find "Studio ESEM Releases" and copy its id
  curl -s https://api.webflow.com/v2/sites/<SITE_ID>/collections \
    -H "Authorization: Bearer $WEBFLOW_API_TOKEN" | jq '.collections[] | {id, displayName, slug}'
  ```
  (The token is a wrangler secret — `npx wrangler secret list` shows it exists;
  ask Sarah for the value, or I can fetch the ID for you if you paste it.)
- **Via the UI** — open the collection in the Designer; the Collection ID is in
  the collection's Settings / API panel.

**c. Wire it in.** In `wrangler.toml`, uncomment and set:
```toml
ESEM_RELEASE_COLLECTION_ID = "your-24-char-collection-id"
```
Then `npx wrangler deploy`. The handler uses it automatically
(`env.ESEM_RELEASE_COLLECTION_ID || env.COPYRIGHT_COLLECTION_ID`).

---

## 5. Adding a new client shoot later

1. **Frontend** (`src/studioEsemReleases.js`): copy the `wsi-dance` block to a
   new key, fill in `client`, `usageProvisions`, `production`, clauses. The URL
   becomes `forms.studioesem.com/release/<new-key>`.
2. **Worker** (`storybox-worker.js`): add `<new-key>` to the
   `ALLOWED_PROJECTS` set in the `/studio-esem-release` handler, then
   `npx wrangler deploy`.
3. That's it — same collection, same emails.

---

## 6. Config / env reference

| Where | Key | Purpose |
|---|---|---|
| `wrangler.toml` `[vars]` | `COPYRIGHT_COLLECTION_ID` | shared collection (fallback target). |
| `wrangler.toml` `[vars]` | `ESEM_RELEASE_COLLECTION_ID` | dedicated Studio ESEM collection (optional). |
| `wrangler.toml` `[vars]` | `ESEM_EMAIL_FROM` | from-address for Studio ESEM emails. Currently `Studio ESEM <stories@storybox.co>` (verified domain, free tier). |
| `wrangler.toml` `[vars]` | `ESEM_EMAIL_REPLY_TO` | reply-to for the contributor ack (`hello@studioesem.com`). |
| wrangler secret | `WEBFLOW_API_TOKEN` | Webflow Data API auth. |
| wrangler secret | `RESEND_API_KEY` | email sending. |

---

## 7. Gotchas / troubleshooting

**"Network error" on submit (but curl to the endpoint works) → CORS.**
The worker only accepts submissions from an allow-listed origin. Studio ESEM
forms are served from `forms.studioesem.com`, which must be permitted in the
`corsHeaders()` function in `storybox-worker.js`. If you ever serve a form from
a *new* domain, add it there (alongside the `storybox.co` / `studioesem.com`
checks) and redeploy — otherwise the browser blocks the POST even though the
backend is healthy. Quick test:
```bash
curl -s -D - -o /dev/null -X OPTIONS \
  "https://storybox-stories-api.sarah-571.workers.dev/studio-esem-release" \
  -H "Origin: https://forms.studioesem.com" \
  -H "Access-Control-Request-Method: POST" | grep -i access-control-allow-origin
# should echo back https://forms.studioesem.com
```

**Emails not arriving.** Check the from-domain is verified in Resend
(`storybox.co` is; `studioesem.com` is not — see §3.2). Emails are best-effort
(`ctx.waitUntil`), so a send failure never blocks the submission.

**Blank page / route not found / old content.** The frontend is a separate
Cloudflare Pages deploy — **`git push` does NOT deploy it.** After changing
anything in `src/`, run `./deploy.sh` (builds + `wrangler pages deploy dist`).
`forms.studioesem.com` and `forms.storybox.co` are both custom domains on the
`storybox-forms` Pages project. An edge cache may briefly serve the old
`index.html`; it revalidates within a minute, or bust it with `?cachebust=…`.

See also `docs/moderating-submissions.md` for how reviewers work the CMS.
