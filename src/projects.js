/**
 * Per-project config. The form reads the first path segment of the URL
 * (e.g. "iwc-rugby-league" in forms.storybox.co/iwc-rugby-league) and
 * looks up branding + copy here.
 *
 * To add a new STORYBOX project:
 *   1. Drop assets into /public/projects/<slug>/
 *   2. Add an entry below
 *   3. Add the slug to the worker's ALLOWED_PROJECTS list in
 *      storybox-worker.js (so the worker accepts it)
 */
export const PROJECTS = {
  "iwc-rugby-league": {
    title: "Contributor Submission Form",
    subtitle: "Inner West Museum of Rugby League",
    pageTitle: "Contributor Submission — Inner West Museum of Rugby League",
    logos: [
      {
        src: "/projects/iwc-rugby-league/museum-logo.svg",
        alt: "Inner West Museum of Rugby League",
        href: "https://www.storybox.co/projects/rugbyleague-iwc",
        invert: true,
      },
      {
        src: "/projects/iwc-rugby-league/council-logo.png",
        alt: "Inner West Council",
        href: "https://www.innerwest.nsw.gov.au/",
        invert: false,
      },
    ],
    poweredByHref: "https://www.storybox.co/projects/rugbyleague-iwc",
  },
};

export const DEFAULT_PROJECT_SLUG = "iwc-rugby-league";

/* Recognised form types — second URL segment. Anything else falls
   through to the default copyright form so existing /<slug>/ URLs
   keep working. */
export const FORM_TYPES = new Set(["copyright", "talent-release", "icip"]);

/* Read the current project + form type from the URL.
   /<slug>                  → { slug, config, formType: "copyright" }
   /<slug>/copyright        → { slug, config, formType: "copyright" }
   /<slug>/talent-release   → { slug, config, formType: "talent-release" }
   /<slug>/icip             → { slug, config, formType: "icip" }
*/
export function projectFromLocation(location = window.location) {
  const segments = (location.pathname || "")
    .replace(/^\/+/, "")
    .split("/")
    .map(s => s.trim())
    .filter(Boolean);

  const slug = segments[0] || null;
  if (!slug) return { slug: null, config: null, formType: "copyright" };

  const config = PROJECTS[slug] || null;
  const second = segments[1] || "";
  const formType = FORM_TYPES.has(second) ? second : "copyright";
  return { slug, config, formType };
}
