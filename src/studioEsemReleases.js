/**
 * Studio ESEM Photography & Videography Release — per-client config.
 *
 * Served on forms.studioesem.com (or ?brand=studioesem locally) at
 *   /release/<key>        e.g. /release/dance
 * The <key> is looked up here for the client-specific copy. This keeps
 * Studio ESEM releases separate from the STORYBOX slug system in
 * projects.js — releases are host-brand Studio ESEM, not STORYBOX projects.
 *
 * To add a client shoot:
 *   1. Copy the "dance" block below to a new key (lower-case, no spaces)
 *   2. Fill in client, usageProvisions, and any custom clauses
 *   3. The URL is /release/<your-key> on forms.studioesem.com
 *   4. Add <your-key> to the worker's ALLOWED_PROJECTS so submissions land
 *      (see docs/studio-esem-release-backend.md)
 */
export const RELEASES = {
  // ── DRAFT placeholder — rename & fill before the dance shoot ──
  "wsi-dance": {
    title: "Photography & Videography Release Form",
    subtitle: "Dance Production [Come Dance with Me] — Western Sydney International",
    client: "UAP/WSI",
    // The customisable grant — one bullet per clause.
    clauses: [
      "Studio ESEM is granted the right to use this recording for the Production and its associated documentation, promotion and marketing;",
      "I waive all personal rights and objections to, including the right to inspect, any Use of my Appearance by Studio ESEM in connection with the Production;",
      "I understand that Studio ESEM has relied upon my consent in allowing my participation in the Production.",
    ],
    // The client-specific usage outcome — media, territory, duration.
    // Shown to the signer in a highlighted box. EDIT PER SHOOT.
    usageProvisions:
      "Assignment of all rights in the Services Materials, all media, including online and social distribution",
    definitions: [
      ["Appearance", "means my name, image, physical likeness, voice, and any and all attributes of my personality and/or performance;"],
      ["The Production", "is the photography and videography shoot described above, produced by Studio ESEM for the Client."],
    ],
    showPaid: true,
    showUnder18: true,
    // Worker endpoint — see docs/studio-esem-release-backend.md.
    // Not yet wired, so submit will 404 until the endpoint exists.
    endpoint: "/studio-esem-release",
  },
};

export function releaseFromKey(key) {
  return (key && RELEASES[key]) || null;
}
