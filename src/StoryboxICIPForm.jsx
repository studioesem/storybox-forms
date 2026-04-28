import { useState, useRef, useEffect } from "react";

/* ─── FONTS ─── */
const heading = "'American Grotesk Condensed', 'American Grotesk', system-ui, sans-serif";
const body    = "'American Grotesk', system-ui, sans-serif";

/* ─── WARM-CREAM PALETTE ─── */
const C = {
  bg:        "#F5F0E8",
  surface:   "#FFFFFF",
  heading:   "#2f2f2f",
  body:      "#3A3F3C",
  muted:     "#94948f",
  border:    "#E0D8CC",
  borderFocus: "#545344",
  focusRing: "rgba(84,83,68,0.15)",
  cta:       "#D6DE23",
  ctaText:   "#2f2f2f",
  error:     "#C43333",
  cream:     "#f3efea",
  olive:     "#545344",
};

const API_BASE = "https://storybox-stories-api.sarah-571.workers.dev";

const PRIVACY_URL = "https://www.storybox.co/privacy-policy";

const ICIP_CLAUSES = [
  "Where my Contributor Content contains Indigenous Cultural and Intellectual Property (ICIP), Studio ESEM acknowledges that Indigenous people have the right to control, own and maintain their ICIP in accordance with Article 31 of the United Nations Declaration on the Rights of Indigenous Peoples. The ownership of any ICIP will remain with the relevant traditional owners of such ICIP.",
  "Studio ESEM will at all times, show respect for Indigenous people and Indigenous Cultural and Intellectual Property. Where appropriate, we will observe the trust placed in them through the disclosure by Indigenous people to them of knowledge concerning their customs, beliefs, traditions, especially any secret knowledge.",
  "Where the Contributor is the ICIP holder, they consent to use of their Content in the Project.",
  "Should further permission be required beyond the Project touring period, Studio ESEM will seek further consent for incorporation of ICIP from ICIP holders.",
];

const ICIP_DEFINITIONS = [
  ["Contributor Content", "means content created and/or contributed by me or my organisation in the form of a story recorded in audio, video or written format."],
  ["STORYBOX", "is a digital storytelling cube created by Studio ESEM for digital programming in public precincts."],
];

/* ─── ICONS ─── */
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── SIGNATURE PAD ─── */
function SignaturePad({ value, onChange, ariaLabel }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const [empty, setEmpty] = useState(!value);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = C.heading;
  }, []);

  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawing.current = true;
    last.current = getPoint(e);
    canvasRef.current.setPointerCapture?.(e.pointerId);
  };

  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const point = getPoint(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    last.current = point;
    if (empty) setEmpty(false);
  };

  const endDraw = (e) => {
    if (!drawing.current) return;
    drawing.current = false;
    canvasRef.current.releasePointerCapture?.(e.pointerId);
    if (!empty) onChange(canvasRef.current.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
    onChange("");
  };

  return (
    <div>
      <div style={{
        position: "relative",
        background: C.bg,
        border: `1.5px solid ${C.border}`,
        borderRadius: 10,
        overflow: "hidden",
      }}>
        <canvas
          ref={canvasRef}
          aria-label={ariaLabel || "Signature"}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerCancel={endDraw}
          style={{
            display: "block",
            width: "100%",
            height: 160,
            touchAction: "none",
            cursor: "crosshair",
          }}
        />
        {empty && (
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
            fontFamily: body, fontSize: "0.85rem",
            color: C.muted, fontStyle: "italic",
          }}>
            Sign here with your finger or mouse
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={clear}
        style={{
          marginTop: 8,
          background: "transparent",
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "8px 14px",
          fontFamily: body, fontSize: "0.8rem", fontWeight: 500,
          color: C.body, cursor: "pointer",
          touchAction: "manipulation",
        }}
      >
        Clear signature
      </button>
    </div>
  );
}

/* ─── COMPONENT ─── */
export default function StoryboxICIPForm({ projectSlug, projectConfig }) {
  // Section 1 — Recording Consent
  const [consentName, setConsentName] = useState("");
  const [consentDate, setConsentDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Section 2 — Your Contribution
  const [contributionName, setContributionName] = useState("");
  const [contributionDescription, setContributionDescription] = useState("");
  const [exhibitionLocation, setExhibitionLocation] = useState("");
  const [signature, setSignature] = useState("");

  // Section 2b — Under 18
  const [under18, setUnder18] = useState(false);
  const [parentSignature, setParentSignature] = useState("");

  // Section 3 — Your Details
  const [organisation, setOrganisation] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Submission state
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [focusField, setFocusField] = useState(null);
  const [honeypot, setHoneypot] = useState("");
  const [mountedAt] = useState(() => Date.now());

  /* ─── VALIDATION ─── */
  const canSubmit = (
    consentName.trim().length >= 2 &&
    contributionName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    signature.length > 0 &&
    (!under18 || parentSignature.length > 0)
  );

  /* ─── SUBMIT ─── */
  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const fd = new FormData();
      fd.append("project", projectSlug || "");
      fd.append("consent-name", consentName.trim());
      fd.append("consent-date", consentDate);
      fd.append("contribution-name", contributionName.trim());
      fd.append("contribution-description", contributionDescription.trim());
      fd.append("exhibition-location", exhibitionLocation.trim());
      fd.append("organisation", organisation.trim());
      fd.append("street-address", streetAddress.trim());
      fd.append("city", city.trim());
      fd.append("state", state.trim());
      fd.append("postcode", postcode.trim());
      fd.append("phone", phone.trim());
      fd.append("email-address", email.trim());
      fd.append("under-18", under18 ? "true" : "false");
      if (signature) fd.append("signature", signature);
      if (under18 && parentSignature) fd.append("parent-signature", parentSignature);
      fd.append("website", honeypot);
      fd.append("elapsed", String(Date.now() - mountedAt));

      const res = await fetch(`${API_BASE}/icip-release`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) setSubmitted(true);
      else setSubmitError(data.error || "Something went wrong. Please try again.");
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── STYLES ─── */
  const labelStyle = {
    fontFamily: body, fontSize: "0.9rem", fontWeight: 500,
    color: C.body, display: "block", marginBottom: 6,
  };
  const inputStyle = {
    width: "100%", background: C.surface,
    border: `1.5px solid ${C.border}`, borderRadius: 10,
    padding: "13px 16px", color: C.heading, fontFamily: body,
    fontSize: "1rem", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };
  const inputFocusStyle = { borderColor: C.borderFocus, boxShadow: `0 0 0 3px ${C.focusRing}` };
  const optionalTag = { fontWeight: 400, color: C.muted, fontSize: "0.8rem", marginLeft: 4 };
  const sectionHeading = {
    fontFamily: heading, fontWeight: 700, fontSize: "1.05rem",
    color: C.heading, margin: "0 0 16px",
    textTransform: "uppercase", letterSpacing: "0.12em",
  };
  const sectionWrap = {
    paddingTop: 28, marginTop: 28,
    borderTop: `1px solid ${C.border}`,
  };
  const fieldWrap = { marginBottom: 18 };
  const bodyText = {
    fontFamily: body, fontSize: "1rem", color: C.body,
    lineHeight: 1.6, margin: "0 0 14px",
  };
  const smallText = {
    fontFamily: body, fontSize: "0.9rem", color: C.body,
    lineHeight: 1.55, margin: "0 0 10px",
  };
  const textareaStyle = { ...inputStyle, minHeight: 100, resize: "vertical", fontFamily: body };

  const isIframe = typeof window !== "undefined" && window.self !== window.top;

  /* ─── SUCCESS STATE ─── */
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "48px 28px", textAlign: "center", fontFamily: body, background: C.surface, borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontFamily: heading, fontWeight: 700, fontSize: "1.8rem", color: C.heading, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 1, lineHeight: 1.1 }}>
            Thank you
          </h2>
          <p style={{ fontFamily: body, fontSize: "1.05rem", color: C.muted, lineHeight: 1.6, maxWidth: 440, margin: "0 auto 24px" }}>
            Your ICIP release has been received.
          </p>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}`, fontFamily: body, fontSize: "0.8rem", color: C.muted }}>
            Powered by{" "}
            <a href={projectConfig?.poweredByHref || "https://storybox.co"} target="_blank" rel="noopener noreferrer" style={{ color: C.olive, textDecoration: "none", fontWeight: 600 }}>STORYBOX.CO</a>
          </div>
        </div>
      </div>
    );
  }

  const logos = projectConfig?.logos || [];

  /* ─── FORM ─── */
  return (
    <div style={{
      minHeight: isIframe ? "auto" : "100vh",
      background: C.bg,
      display: "flex", alignItems: isIframe ? "flex-start" : "center", justifyContent: "center",
      padding: isIframe ? 0 : "clamp(12px, 3vw, 20px)",
    }}>
      <div style={{
        maxWidth: 640, width: "100%", margin: "0 auto",
        borderRadius: isIframe ? 0 : 20, overflow: "hidden",
        boxShadow: isIframe ? "none" : "0 4px 32px rgba(0,0,0,0.06)",
      }}>

        {/* Header */}
        <div style={{ background: C.heading, padding: "clamp(24px, 5vw, 32px)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
            <a
              href={projectConfig?.poweredByHref || "https://storybox.co"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex" }}
            >
              <img
                src="/storybox-logo-white.png"
                alt="STORYBOX.CO"
                style={{ height: 28, width: "auto" }}
              />
            </a>
            {logos.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                {logos.map((logo, i) => {
                  const img = (
                    <img
                      src={logo.src}
                      alt={logo.alt || ""}
                      style={{
                        height: 40, width: "auto",
                        filter: logo.invert ? "invert(1)" : undefined,
                        opacity: logo.invert ? 1 : 0.9,
                      }}
                    />
                  );
                  return logo.href ? (
                    <a key={i} href={logo.href} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex" }}>{img}</a>
                  ) : (
                    <span key={i} style={{ display: "inline-flex" }}>{img}</span>
                  );
                })}
              </div>
            )}
          </div>
          <h1 style={{ fontFamily: heading, fontWeight: 700, fontSize: "clamp(1.6rem, 4.5vw, 2.1rem)", color: C.cream, margin: "0 0 8px", lineHeight: 1.05, textTransform: "uppercase", letterSpacing: 1 }}>
            ICIP Release Form
          </h1>
          {projectConfig?.subtitle && (
            <h2 style={{ fontFamily: body, fontSize: "0.95rem", fontWeight: 400, color: "rgba(255,255,255,0.7)", margin: 0 }}>
              {projectConfig.subtitle}
            </h2>
          )}
        </div>

        {/* Form body */}
        <div style={{ background: C.surface, padding: "clamp(24px, 5vw, 32px)" }}>

          {/* PROJECT DETAILS + ICIP PREAMBLE */}
          <section>
            <h3 style={sectionHeading}>Project Details</h3>
            <p style={bodyText}>
              STORYBOX is a platform to share community and cultural stories and insights in shared spaces. The STORYBOX is the creation of Studio ESEM and can be licensed for use by cultural institutions, educational institutions, arts organisations and local government. For more information see{" "}
              <a href="https://storybox.co" target="_blank" rel="noopener noreferrer" style={{ color: C.olive, fontWeight: 600 }}>storybox.co</a>.
            </p>

            <h4 style={{ ...sectionHeading, fontSize: "0.95rem", margin: "24px 0 12px" }}>First Nations Cultural Knowledge &amp; Recordings</h4>
            <p style={bodyText}>
              Any usage of First Nations cultural knowledge is in accordance with Indigenous Intellectual and Cultural Property protocols (set out below).
            </p>
          </section>

          {/* SECTION 1 — RECORDING CONSENT */}
          <section style={sectionWrap}>
            <h3 style={sectionHeading}>Recording Consent</h3>

            <p style={bodyText}>
              This form is my confirmation and acknowledgement that I,
            </p>

            <div style={fieldWrap}>
              <label style={labelStyle}>Name</label>
              <input
                value={consentName}
                onChange={e => setConsentName(e.target.value)}
                placeholder="Your full name"
                style={{ ...inputStyle, ...(focusField === "consentName" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("consentName")} onBlur={() => setFocusField(null)}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Date</label>
              <input
                value={consentDate}
                onChange={e => setConsentDate(e.target.value)}
                type="date"
                style={{ ...inputStyle, maxWidth: 220, ...(focusField === "consentDate" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("consentDate")} onBlur={() => setFocusField(null)}
              />
            </div>

            <p style={bodyText}>
              hereby consent for my Cultural knowledge to be featured on STORYBOX under the conditions of usage set out below. ICIP protocols and definitions are detailed at the end of this form.
            </p>
          </section>

          {/* SECTION 2 — YOUR CONTRIBUTION */}
          <section style={sectionWrap}>
            <h3 style={sectionHeading}>Your Contribution</h3>

            <div style={fieldWrap}>
              <label style={labelStyle}>Name of contribution</label>
              <input
                value={contributionName}
                onChange={e => setContributionName(e.target.value)}
                placeholder="e.g. story name, poem, other"
                style={{ ...inputStyle, ...(focusField === "contributionName" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("contributionName")} onBlur={() => setFocusField(null)}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Description <span style={optionalTag}>(optional)</span></label>
              <textarea
                value={contributionDescription}
                onChange={e => setContributionDescription(e.target.value)}
                placeholder="Describe your contribution, e.g. a story about the Emu"
                style={{ ...textareaStyle, ...(focusField === "contributionDescription" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("contributionDescription")} onBlur={() => setFocusField(null)}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Approved installation or location of STORYBOX exhibition <span style={optionalTag}>(optional)</span></label>
              <textarea
                value={exhibitionLocation}
                onChange={e => setExhibitionLocation(e.target.value)}
                placeholder="The specific project or program you are contributing to"
                style={{ ...textareaStyle, ...(focusField === "exhibitionLocation" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("exhibitionLocation")} onBlur={() => setFocusField(null)}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Signature</label>
              <SignaturePad value={signature} onChange={setSignature} ariaLabel="ICIP consent signature" />
            </div>

            {/* Under-18 toggle */}
            <div
              onClick={() => setUnder18(!under18)}
              role="checkbox"
              aria-checked={under18}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setUnder18(!under18); } }}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 16px", borderRadius: 12, marginTop: 4,
                cursor: "pointer", touchAction: "manipulation",
                background: under18 ? "#faf8e0" : "transparent",
                border: `1.5px solid ${under18 ? C.cta : C.border}`,
                transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${under18 ? C.cta : C.muted}`,
                background: under18 ? C.cta : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", marginTop: 1, color: C.ctaText,
              }}>
                {under18 && <CheckIcon />}
              </div>
              <span style={{ fontFamily: body, fontSize: "0.95rem", color: C.body, lineHeight: 1.5 }}>
                The presenter is under 18
              </span>
            </div>

            {under18 && (
              <div style={{ marginTop: 18 }}>
                <p style={{ ...smallText, margin: "0 0 14px" }}>
                  If this release is obtained from a presenter under the age of 18, then the signature of that presenter's parent or legal guardian is also required.
                </p>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Parent's signature</label>
                  <SignaturePad value={parentSignature} onChange={setParentSignature} ariaLabel="Parent or guardian signature" />
                </div>
              </div>
            )}
          </section>

          {/* SECTION 3 — YOUR DETAILS */}
          <section style={sectionWrap}>
            <h3 style={sectionHeading}>Your Details</h3>

            <div style={fieldWrap}>
              <label style={labelStyle}>Organisation <span style={optionalTag}>(optional)</span></label>
              <input
                value={organisation}
                onChange={e => setOrganisation(e.target.value)}
                placeholder="Organisation, if relevant"
                style={{ ...inputStyle, ...(focusField === "organisation" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("organisation")} onBlur={() => setFocusField(null)}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Address <span style={optionalTag}>(optional)</span></label>
              <input
                value={streetAddress}
                onChange={e => setStreetAddress(e.target.value)}
                placeholder="e.g. 12 Norton Street"
                style={{ ...inputStyle, ...(focusField === "streetAddress" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("streetAddress")} onBlur={() => setFocusField(null)}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 220px" }}>
                <label style={labelStyle}>City <span style={optionalTag}>(optional)</span></label>
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Leichhardt"
                  style={{ ...inputStyle, ...(focusField === "city" ? inputFocusStyle : {}) }}
                  onFocus={() => setFocusField("city")} onBlur={() => setFocusField(null)}
                />
              </div>
              <div style={{ flex: "0 1 140px" }}>
                <label style={labelStyle}>State <span style={optionalTag}>(optional)</span></label>
                <input
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="NSW"
                  style={{ ...inputStyle, ...(focusField === "state" ? inputFocusStyle : {}) }}
                  onFocus={() => setFocusField("state")} onBlur={() => setFocusField(null)}
                />
              </div>
              <div style={{ flex: "0 1 140px" }}>
                <label style={labelStyle}>Postcode <span style={optionalTag}>(optional)</span></label>
                <input
                  value={postcode}
                  onChange={e => setPostcode(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                  placeholder="2040"
                  inputMode="numeric"
                  style={{ ...inputStyle, ...(focusField === "postcode" ? inputFocusStyle : {}) }}
                  onFocus={() => setFocusField("postcode")} onBlur={() => setFocusField(null)}
                />
              </div>
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Phone <span style={optionalTag}>(optional)</span></label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0400 000 000"
                type="tel"
                style={{ ...inputStyle, ...(focusField === "phone" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("phone")} onBlur={() => setFocusField(null)}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Email Address</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@example.com"
                type="email"
                style={{ ...inputStyle, ...(focusField === "email" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("email")} onBlur={() => setFocusField(null)}
              />
            </div>
          </section>

          {/* ICIP PROTOCOL CLAUSES */}
          <section style={sectionWrap}>
            <h3 style={sectionHeading}>Indigenous Cultural and Intellectual Property</h3>

            <ol style={{ margin: "0 0 24px", paddingLeft: 22, fontFamily: body, fontSize: "0.9rem", color: C.body, lineHeight: 1.6 }}>
              {ICIP_CLAUSES.map((clause, i) => (
                <li key={i} style={{ marginBottom: 12 }}>{clause}</li>
              ))}
            </ol>

            <div style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}>
              <p style={{ ...smallText, margin: "0 0 8px", fontWeight: 500, color: C.heading }}>
                Definitions
              </p>
              {ICIP_DEFINITIONS.map(([term, def], i) => (
                <p key={i} style={{ ...smallText, margin: i === ICIP_DEFINITIONS.length - 1 ? 0 : "0 0 8px" }}>
                  <strong style={{ color: C.heading }}>{term}</strong> {def}
                </p>
              ))}
            </div>
          </section>

          {/* PRIVACY + SUBMIT */}
          <section style={sectionWrap}>
            <p style={{ fontFamily: body, fontSize: "0.85rem", color: C.muted, margin: "0 0 24px", lineHeight: 1.5 }}>
              By submitting you agree to our{" "}
              <a
                href={PRIVACY_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: C.olive, fontWeight: 600, textDecoration: "underline" }}
              >
                Privacy Policy
              </a>
              .
            </p>

            {/* Honeypot */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
              <label>Website (leave blank)
                <input type="text" name="website" value={honeypot} onChange={e => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              style={{
                width: "100%",
                background: canSubmit && !submitting ? C.cta : C.border,
                color: canSubmit && !submitting ? C.ctaText : C.muted,
                border: "none", borderRadius: 14,
                padding: "20px 20px",
                cursor: canSubmit && !submitting ? "pointer" : "default",
                fontFamily: heading, fontWeight: 700, fontSize: "1rem",
                letterSpacing: "0.14em", textTransform: "uppercase",
                touchAction: "manipulation",
                transition: "all 0.2s",
              }}
            >
              {submitting ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{ width: 18, height: 18, border: `2.5px solid ${C.heading}40`, borderTopColor: C.heading, borderRadius: "50%", animation: "sbx-spin 0.6s linear infinite", display: "inline-block" }} />
                  Submitting…
                </span>
              ) : "Submit ICIP Release"}
            </button>

            {submitError && (
              <p style={{ fontFamily: body, fontSize: "0.85rem", color: C.error, textAlign: "center", marginTop: 12, padding: "10px 14px", background: "#C4333310", borderRadius: 8 }}>
                {submitError}
              </p>
            )}
          </section>

          {/* Footer */}
          <div style={{ marginTop: 28, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: heading, fontSize: "0.65rem", fontWeight: 700, color: C.muted, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Powered by{" "}
              <a href={projectConfig?.poweredByHref || "https://storybox.co"} target="_blank" rel="noopener noreferrer" style={{ color: C.olive, textDecoration: "none" }}>STORYBOX.CO</a>
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sbx-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
