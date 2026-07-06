# Backend spec — Studio ESEM Release submissions

Hand-off spec for wiring the **Studio ESEM Photography & Videography Release**
(`/<slug>/release`, component `StudioEsemReleaseForm.jsx`) into the
`storybox-worker` repo. It follows the same conventions as the existing
STORYBOX endpoints (`/contribution`, `/talent-release`, `/icip-release`):
R2 for signature images, a Webflow CMS collection, a Moderator Notes block,
and honeypot + elapsed-time spam checks.

Decision (2026-07-06): **new dedicated Webflow collection**, not shared with
the STORYBOX talent-release collection.

---

## 1. New endpoint

```
POST /studio-esem-release
Content-Type: multipart/form-data
```

Reuse the same request-handling shape as `/talent-release`. Only the target
Webflow collection and the two extra fields (`client`, `usage-provisions`)
differ.

### Fields the form sends

| FormData key | Required | Notes |
|---|---|---|
| `project` | yes | release key from the URL 2nd segment, e.g. `dance` (from `/release/dance`). Must be in `ALLOWED_PROJECTS`. |
| `client` | no | Client name, from project config (may be empty). |
| `consent-name` | yes | Typed name in the consent clause. |
| `filming-location` | yes | Shoot location. |
| `filming-date` | yes | `YYYY-MM-DD`. |
| `usage-provisions` | no | The agreed usage text, from project config. |
| `full-name` | yes | Signer's legal name. |
| `street-address` | no | |
| `city` | no | |
| `state` | no | |
| `postcode` | no | 4 digits. |
| `phone` | no | |
| `email-address` | yes | Follow-up + confirmation email. |
| `credit` | no | Freetext — how the contributor wishes to be credited. |
| `paid-participant` | yes | `"true"` / `"false"`. |
| `under-18` | yes | `"true"` / `"false"`. |
| `general-signature` | yes | PNG data URL → upload to R2. |
| `general-signature-date` | yes | `YYYY-MM-DD`. |
| `parent-signature` | if under-18 | PNG data URL → upload to R2. |
| `parent-signature-date` | if under-18 | `YYYY-MM-DD`. |
| `website` | — | **Honeypot.** Must be empty, else silently accept + drop. |
| `elapsed` | — | ms since form mount. Reject if implausibly small (reuse the existing threshold). |

### Processing (same as talent-release)

1. **Spam gate** — reject if `website` non-empty or `elapsed` below the existing threshold.
2. **Allowlist** — 403 if `project` not in `ALLOWED_PROJECTS` (add `esem-dance` there).
3. **Upload signatures** — decode `general-signature` (and `parent-signature` if
   present) and PUT to the R2 signatures bucket; keep the returned public URLs.
4. **Create Webflow item** in the new collection (below).
5. **Email the contributor** — reuse the talent-release confirmation template,
   swapping STORYBOX branding for Studio ESEM.
6. **Respond** `{ "success": true }` on success, `{ "success": false, "error": "…" }`
   otherwise. The form shows `error` verbatim.

---

## 2. New Webflow collection — "Studio ESEM Releases"

Create in the same STORYBOX site (Studio ESEM workspace). Suggested fields:

| Display name | Slug | Type | Populated from |
|---|---|---|---|
| Name | `name` | Plain text | `full-name` (Webflow requires a Name field) |
| Full Name | `full-name` | Plain text | `full-name` |
| Email Address | `email-address` | Email | `email-address` |
| Phone | `phone` | Plain text | `phone` |
| Client | `client` | Plain text | `client` |
| Shoot Location | `shoot-location` | Plain text | `filming-location` |
| Shoot Date | `shoot-date` | Date | `filming-date` |
| Usage Provisions | `usage-provisions` | Plain text (long) | `usage-provisions` |
| Credit | `credit` | Plain text | `credit` |
| Paid Participant | `paid-participant` | Switch | `paid-participant` |
| Under 18 | `under-18` | Switch | `under-18` |
| Project | `project` | Plain text | `project` |
| Submitted Date | `submitted-date` | Date | server timestamp |
| Moderator Notes | `moderator-notes` | Plain text (long) | auto-block below |

### Moderator Notes block (auto-populated)

Mirror the existing format so reviewers read it the same way as copyright/talent:

```
Consent name: <consent-name>
Signature: <R2 url to general-signature.png>
Signed: <general-signature-date>
Address: <street-address>, <city>, <state>, <postcode>
Client: <client>
Usage: <usage-provisions>
```

If `under-18` is true, append:

```
Under-18 — Parent signature: <R2 url to parent-signature.png>
Parent signed: <parent-signature-date>
```

The signature URLs are the legal record — reviewers click to view the PNG.

---

## 3. Frontend touch-points (already done in storybox-forms)

- Served in **Studio ESEM mode** (`forms.studioesem.com`, or `?brand=studioesem`
  locally) at `/release/<key>`, e.g. `/release/dance`. Routed in `main.jsx`.
- Per-client copy lives in `src/studioEsemReleases.js`, keyed by `<key>`. The
  component (`StudioEsemReleaseForm.jsx`) reads its legal copy from that config.
- The endpoint is set per client in `studioEsemReleases.js` → `endpoint`
  (currently `"/studio-esem-release"`). No frontend change needed once the
  worker endpoint exists.
- Remember to add each release `<key>` (e.g. `dance`) to the worker's
  `ALLOWED_PROJECTS` — this is the value sent in the `project` field.

See also `docs/moderating-submissions.md` for how reviewers work the CMS.
