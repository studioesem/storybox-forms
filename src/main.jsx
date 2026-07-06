import React from "react";
import ReactDOM from "react-dom/client";
import StoryboxCopyrightForm from "./StoryboxCopyrightForm.jsx";
import StoryboxTalentReleaseForm from "./StoryboxTalentReleaseForm.jsx";
import StoryboxICIPForm from "./StoryboxICIPForm.jsx";
import StudioEsemICIPForm from "./StudioEsemICIPForm.jsx";
import StudioEsemReleaseForm from "./StudioEsemReleaseForm.jsx";
import { projectFromLocation } from "./projects.js";
import { releaseFromKey } from "./studioEsemReleases.js";

const FORM_COMPONENTS = {
  "copyright": StoryboxCopyrightForm,
  "talent-release": StoryboxTalentReleaseForm,
  "icip": StoryboxICIPForm,
};

const PAGE_TITLES = {
  "copyright": (subtitle) => `Contributor Submission${subtitle ? " — " + subtitle : ""}`,
  "talent-release": (subtitle) => `Photography & Filming Release${subtitle ? " — " + subtitle : ""}`,
  "icip": (subtitle) => `ICIP Release${subtitle ? " — " + subtitle : ""}`,
};

/* Studio ESEM mode is triggered by the studioesem hostname, or for local dev
   by ?brand=studioesem on any host. In Studio ESEM mode the URL is just
   /<form-type> with no project slug. */
function isStudioEsemHost() {
  if (typeof window === "undefined") return false;
  if (window.location.hostname === "forms.studioesem.com") return true;
  return new URLSearchParams(window.location.search).get("brand") === "studioesem";
}

function pathSegments() {
  if (typeof window === "undefined") return [];
  return (window.location.pathname || "")
    .replace(/^\/+/, "")
    .split("/")
    .map(s => s.trim())
    .filter(Boolean);
}

const STUDIOESEM_FORM_COMPONENTS = {
  "icip": StudioEsemICIPForm,
};

const STUDIOESEM_TITLES = {
  "icip": "ICIP Release",
};

function StudioEsemLanding() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F0E8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "'American Grotesk', system-ui, sans-serif",
      color: "#3A3F3C",
      textAlign: "center",
    }}>
      <div style={{ maxWidth: 520 }}>
        <img
          src="/studioesem-logo-stacked-whitecolour.svg"
          alt="Studio ESEM"
          style={{ height: 64, marginBottom: 20, filter: "invert(1)" }}
        />
        <h1 style={{
          fontFamily: "'American Grotesk Condensed', system-ui, sans-serif",
          fontWeight: 700, fontSize: "1.8rem",
          color: "#2f2f2f", margin: "0 0 12px",
          textTransform: "uppercase", letterSpacing: 1,
        }}>
          Studio ESEM Forms
        </h1>
        <p style={{ fontSize: "1rem", lineHeight: 1.6, color: "#94948f", margin: 0 }}>
          This page needs a form name in the URL — for example{" "}
          <code style={{ color: "#545344" }}>/icip</code>. If you followed a
          link and landed here, the link may be missing that part.
        </p>
      </div>
    </div>
  );
}

function App() {
  /* Studio ESEM mode (forms.studioesem.com or ?brand=studioesem) */
  if (isStudioEsemHost()) {
    const segments = pathSegments();
    const formType = segments[0] || "";

    /* Release forms carry a per-client key in the 2nd segment:
       /release/<key> → looked up in studioEsemReleases.js */
    if (formType === "release") {
      const releaseKey = segments[1] || "";
      const releaseConfig = releaseFromKey(releaseKey);
      if (typeof document !== "undefined") {
        document.title = releaseConfig
          ? `Photography & Videography Release${releaseConfig.subtitle ? " — " + releaseConfig.subtitle : ""}`
          : "Studio ESEM Forms";
      }
      if (releaseConfig) return <StudioEsemReleaseForm releaseConfig={releaseConfig} releaseKey={releaseKey} />;
      return <StudioEsemLanding />;
    }

    const FormComponent = STUDIOESEM_FORM_COMPONENTS[formType];

    if (typeof document !== "undefined") {
      document.title = STUDIOESEM_TITLES[formType] || "Studio ESEM Forms";
    }

    if (FormComponent) return <FormComponent />;
    return <StudioEsemLanding />;
  }

  /* Storybox slug-based mode (forms.storybox.co) */
  const { slug, config, formType } = projectFromLocation();

  // No project slug in URL, or unknown slug → friendly explainer
  if (!slug || !config) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#F5F0E8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'American Grotesk', system-ui, sans-serif",
        color: "#3A3F3C",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 520 }}>
          <h1 style={{
            fontFamily: "'American Grotesk Condensed', system-ui, sans-serif",
            fontWeight: 700, fontSize: "1.8rem",
            color: "#2f2f2f", margin: "0 0 12px",
            textTransform: "uppercase", letterSpacing: 1,
          }}>
            STORYBOX Forms
          </h1>
          <p style={{ fontSize: "1rem", lineHeight: 1.6, color: "#94948f", margin: 0 }}>
            This form needs a project code in the URL — for example{" "}
            <code style={{ color: "#545344" }}>/iwc-rugby-league</code>.
            If you followed a link and landed here, the link may be missing that part.
          </p>
        </div>
      </div>
    );
  }

  // Set the browser tab title — form-type-aware so /talent-release
  // and /copyright don't share the same window title.
  if (typeof document !== "undefined") {
    const titleFn = PAGE_TITLES[formType];
    document.title = titleFn ? titleFn(config.subtitle) : (config.pageTitle || "STORYBOX Forms");
  }

  const FormComponent = FORM_COMPONENTS[formType] || StoryboxCopyrightForm;
  return <FormComponent projectSlug={slug} projectConfig={config} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
