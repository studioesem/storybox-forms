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

/* Read the current project from the URL's first path segment. Returns
   the matching config object, or null if the slug isn't recognised. */
export function projectFromLocation(location = window.location) {
  const seg = (location.pathname || "")
    .replace(/^\/+/, "")
    .split("/")[0]
    .trim();
  if (!seg) return { slug: null, config: null };
  const config = PROJECTS[seg] || null;
  return { slug: seg, config };
}
