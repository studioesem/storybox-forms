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
                                                   from hello@studioesem.com
```

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

Do these in order. **Steps 1–2 are all you need to go live.** 3–4 are optional polish.

### 1. Deploy the worker endpoint  ✅ code done, needs deploy
The `/studio-esem-release` handler is committed on branch
`add-studio-esem-release` in the worker repo. To ship it:
```bash
cd ~/Projects/studioesem/storybox-worker
# merge the branch however you prefer, then:
npx wrangler deploy
```

### 2. Verify studioesem.com in Resend  ⚠️ required for emails
The form's confirmation + team-alert emails send from `hello@studioesem.com`.
Resend only delivers from a **verified domain**. In the Resend dashboard →
**Domains** → add `studioesem.com` and complete the DNS records (SPF/DKIM).
Until then, submissions still succeed but **emails silently won't send**.
(STORYBOX emails are unaffected — they still use the verified `storybox.co`.)

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
| `wrangler.toml` `[vars]` | `ESEM_EMAIL_FROM` | from-address for Studio ESEM emails (`hello@studioesem.com`). |
| `wrangler.toml` `[vars]` | `ESEM_EMAIL_REPLY_TO` | reply-to for the contributor ack. |
| wrangler secret | `WEBFLOW_API_TOKEN` | Webflow Data API auth. |
| wrangler secret | `RESEND_API_KEY` | email sending. |

See also `docs/moderating-submissions.md` for how reviewers work the CMS.
