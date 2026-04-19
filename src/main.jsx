import React from "react";
import ReactDOM from "react-dom/client";
import StoryboxCopyrightForm from "./StoryboxCopyrightForm.jsx";
import { projectFromLocation } from "./projects.js";

function App() {
  const { slug, config } = projectFromLocation();

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

  // Set the browser tab title from the project config
  if (config.pageTitle && typeof document !== "undefined") {
    document.title = config.pageTitle;
  }

  return <StoryboxCopyrightForm projectSlug={slug} projectConfig={config} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
