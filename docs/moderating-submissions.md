# Reviewing Copyright Submissions

Submissions land in Webflow's CMS. You'll review, follow up if needed, then mark them Approved.

## Logging in

1. Go to **https://webflow.com/login**
2. Sign in with the team Webflow account (ask Sarah for credentials if you don't have them)
3. Pick the **STORYBOX** site (Studio ESEM workspace)

## Finding the submissions

1. From the site dashboard, open the **CMS** tab on the left sidebar (database icon)
2. In the collections list, click **Copyright Submissions**
3. Newest entries appear at the top

## What each field means

| Field | What it is |
|---|---|
| **Full Name** | The contributor's name |
| **Email Address** | Where to follow up |
| **Phone** | Optional follow-up number |
| **Photo Description** | Auto-generated block: title, year, credit, and **direct links to each uploaded photo** in our cloud storage. Click the links to see the images. |
| **Copyright Status** | Shows which copyright option(s) the contributor selected. See the codes below. |
| **Indemnity Agreed** | Always `true` — submitting the form constitutes agreement |
| **Project** | Which STORYBOX project (`iwc-rugby-league` for the rugby museum) |
| **Submitted Date** | Auto timestamp |
| **Moderator Notes** | Internal field — see below for how to read it |

### Copyright Status codes

The codes mean:

- **A** — *Sole copyright owner/author* (contributor confirms they made or own it outright)
- **B** — *Permissions obtained, no IP infringement* (contributor has rights cleared)
- **C** — *Unsure of provenance* (contributor doesn't know who owns it — needs more research before publishing)

A contributor can tick more than one. Multiple codes are joined with ` | `, e.g. `A. Sole copyright owner/author | B. Permissions obtained, no IP infringement`.

### Reading Moderator Notes

This field is auto-populated by the form. It looks like:

```
Consent name: Margaret Thornton
Signature: https://pub-0030db948a394380932c5d2c6aa961c5.r2.dev/signatures/...
Signed: 2026-04-19
Address: 12 Norton Street, Leichhardt, NSW, 2040
```

If the contribution involved a person under 18, you'll also see:

```
Under-18 — Parent signature: https://pub-0030db948a394380932c5d2c6aa961c5.r2.dev/signatures/...
Parent signed: 2026-04-19
```

**Click each signature URL to view the actual signed image** — it opens as a PNG in your browser. These are the legal record.

## What to do with a submission

1. **Click the entry** to open it
2. Open the photos via the links in **Photo Description** — confirm they match the title/credit and that they're suitable for the project
3. If **Copyright Status** is just `C` (unsure of provenance), don't publish without doing some research first or contacting the contributor
4. **Follow up by email** if you need clarification — use the email on file
5. Add anything noteworthy to **Moderator Notes** (it's a free-text field, append after the auto-populated content)
6. When happy, change the item state to **Published** (top right) so the record is locked in

## When you need to follow up

- Reply to the contributor at the email on the submission
- If they ticked option C and the photo turns out to be sensitive or someone else's work, ask if they have any further context before you decide whether to use it
- For under-18 submissions, double-check the parent signature image before approving

## When something looks wrong

- **Photo links don't open** — let Sarah know. Photos are hosted in our R2 cloud bucket; the link should work in any browser.
- **Signature image is blank or scribbled** — ask the contributor to resubmit. The form lets them clear and re-sign before submitting.
- **Submission is clearly spam** — delete the item; the form has spam protection but isn't perfect.
