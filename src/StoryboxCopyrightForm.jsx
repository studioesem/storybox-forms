import { useState, useRef, useEffect } from "react";

/* ─── FONTS ─── */
const heading = "'American Grotesk Condensed', 'American Grotesk', system-ui, sans-serif";
const body    = "'American Grotesk', system-ui, sans-serif";

/* ─── WARM-CREAM PALETTE (matches StoryboxQuickShare) ─── */
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
  sage:      "#7f9291",
  cream:     "#f3efea",
  yellow:    "#fac300",
  olive:     "#545344",
};

const API_BASE = "https://storybox-stories-api.sarah-571.workers.dev";

const PRIVACY_URL = "https://pub-0030db948a394380932c5d2c6aa961c5.r2.dev/docs/privacy-policy.pdf";

const COPYRIGHT_OPTIONS = [
  { id: "A", label: "I warrant that I am the sole copyright owner and/or author of the contribution" },
  { id: "B", label: "My submission does not infringe the Intellectual Property Rights or Moral Rights of any other person and/or any necessary permissions have been obtained from all owners of any third party material" },
  { id: "C", label: "I am unsure of the provenance" },
];

const MAX_FILES = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB per file

/* ─── ICONS ─── */
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 4h10M6 2h4v2M5 4l1 9h4l1-9M7 7v4M9 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
export default function StoryboxCopyrightForm({ projectSlug, projectConfig }) {
  // Section 1 — Consent
  const [consentName, setConsentName] = useState("");
  const [copyrightChoices, setCopyrightChoices] = useState([]);

  // Section 2 — Submission Details
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [credit, setCredit] = useState("");

  // Section 3 — Your Details
  const [fullName, setFullName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Section 4 — Signature
  const [signature, setSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Section 5 — Files
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");

  // Section 6 — Under 18
  const [under18, setUnder18] = useState(false);
  const [parentSignature, setParentSignature] = useState("");
  const [parentSignatureDate, setParentSignatureDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Submission state
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [focusField, setFocusField] = useState(null);
  const [honeypot, setHoneypot] = useState("");
  const [mountedAt] = useState(() => Date.now());

  const fileInputRef = useRef(null);

  /* ─── FILE HANDLING ─── */
  const handleFiles = (e) => {
    setFileError("");
    const incoming = Array.from(e.target.files || []);
    const remaining = MAX_FILES - files.length;
    if (incoming.length > remaining) {
      setFileError(`You can only add ${remaining} more file${remaining === 1 ? "" : "s"} (max ${MAX_FILES} total).`);
      e.target.value = "";
      return;
    }
    for (const f of incoming) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        setFileError(`"${f.name}" isn't a supported image format. Use JPG, PNG, or WebP.`);
        e.target.value = "";
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setFileError(`"${f.name}" is too large (max 15MB per file).`);
        e.target.value = "";
        return;
      }
    }
    setFiles(prev => [...prev, ...incoming]);
    e.target.value = "";
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setFileError("");
  };

  const toggleCopyright = (id) => {
    setCopyrightChoices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  /* ─── VALIDATION ─── */
  const canSubmit = (
    consentName.trim().length >= 2 &&
    copyrightChoices.length > 0 &&
    title.trim().length >= 2 &&
    /^\d{4}$/.test(year.trim()) &&
    credit.trim().length >= 2 &&
    fullName.trim().length >= 2 &&
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
      fd.append("copyright-choices", copyrightChoices.join(","));
      fd.append("title", title.trim());
      fd.append("year", year.trim());
      fd.append("credit", credit.trim());
      fd.append("full-name", fullName.trim());
      fd.append("street-address", streetAddress.trim());
      fd.append("city", city.trim());
      fd.append("state", state.trim());
      fd.append("postcode", postcode.trim());
      fd.append("phone", phone.trim());
      fd.append("email-address", email.trim());
      fd.append("signature-date", signatureDate);
      fd.append("under-18", under18 ? "true" : "false");
      if (under18) fd.append("parent-signature-date", parentSignatureDate);
      fd.append("website", honeypot);
      fd.append("elapsed", String(Date.now() - mountedAt));
      if (signature) fd.append("signature", signature);
      if (under18 && parentSignature) fd.append("parent-signature", parentSignature);
      files.forEach(f => fd.append("photos", f, f.name));

      const res = await fetch(`${API_BASE}/contribution`, { method: "POST", body: fd });
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
            Your contribution has been received. We'll be in touch if we need anything further.
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

        {/* Header — dark */}
        <div style={{ background: C.heading, padding: "clamp(24px, 5vw, 32px)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
            {/* STORYBOX.CO master logo (left) */}
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
            {/* Project-specific logos (right) */}
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
            {projectConfig?.title || "Contributor Submission Form"}
          </h1>
          {projectConfig?.subtitle && (
            <h2 style={{ fontFamily: body, fontSize: "0.95rem", fontWeight: 400, color: "rgba(255,255,255,0.7)", margin: 0 }}>
              {projectConfig.subtitle}
            </h2>
          )}
        </div>

        {/* Form body — warm cream */}
        <div style={{ background: C.surface, padding: "clamp(24px, 5vw, 32px)" }}>

          {/* SECTION 1 — CONSENT */}
          <section>
            <h3 style={sectionHeading}>Consent</h3>

            <p style={{ fontFamily: body, fontSize: "1rem", color: C.body, lineHeight: 1.6, margin: "0 0 14px" }}>
              This form is my confirmation and acknowledgement that I,
            </p>

            <div style={fieldWrap}>
              <label style={labelStyle}>Name</label>
              <input
                value={consentName}
                onChange={e => setConsentName(e.target.value)}
                placeholder="Your full name"
                style={{ ...inputStyle, ...(focusField === "consentName" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("consentName")}
                onBlur={() => setFocusField(null)}
              />
            </div>

            <p style={{ fontFamily: body, fontSize: "1rem", color: C.body, lineHeight: 1.6, margin: "0 0 18px" }}>
              hereby consent for my Contribution to be exhibited on STORYBOX on the following terms (select those that apply):
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {COPYRIGHT_OPTIONS.map(opt => {
                const active = copyrightChoices.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleCopyright(opt.id)}
                    role="checkbox"
                    aria-checked={active}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleCopyright(opt.id); } }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 14,
                      padding: "16px 18px", borderRadius: 12,
                      cursor: "pointer", touchAction: "manipulation",
                      background: active ? "#faf8e0" : C.surface,
                      border: `1.5px solid ${active ? C.cta : C.border}`,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${active ? C.cta : C.muted}`,
                      background: active ? C.cta : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s", marginTop: 2, color: C.ctaText,
                    }}>
                      {active && <CheckIcon />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: heading, fontWeight: 700, fontSize: "0.85rem", color: C.heading, marginRight: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {opt.id}.
                      </span>
                      <span style={{ fontFamily: body, fontSize: "0.95rem", color: C.body, lineHeight: 1.5 }}>
                        {opt.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 2 — SUBMISSION DETAILS */}
          <section style={sectionWrap}>
            <h3 style={sectionHeading}>Details of your Submission to STORYBOX</h3>

            <div style={fieldWrap}>
              <label style={labelStyle}>Title of contribution</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 1939 Grand Final, Balmain v Souths"
                style={{ ...inputStyle, ...(focusField === "title" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("title")} onBlur={() => setFocusField(null)}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Year of Creation</label>
              <input
                value={year}
                onChange={e => setYear(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                placeholder="YYYY"
                inputMode="numeric"
                maxLength={4}
                style={{ ...inputStyle, maxWidth: 160, ...(focusField === "year" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("year")} onBlur={() => setFocusField(null)}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Name/s of those to be attributed as Author/Creator of work</label>
              <input
                value={credit}
                onChange={e => setCredit(e.target.value)}
                placeholder="e.g. Photographer's name, archive, or publication"
                style={{ ...inputStyle, ...(focusField === "credit" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("credit")} onBlur={() => setFocusField(null)}
              />
            </div>
          </section>

          {/* SECTION 3 — YOUR DETAILS */}
          <section style={sectionWrap}>
            <h3 style={sectionHeading}>Your Details</h3>

            <div style={fieldWrap}>
              <label style={labelStyle}>Full Name</label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Margaret Thornton"
                style={{ ...inputStyle, ...(focusField === "fullName" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("fullName")} onBlur={() => setFocusField(null)}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Street Address / P.O. Box <span style={optionalTag}>(optional)</span></label>
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

          {/* SECTION 4 — SIGNATURE */}
          <section style={sectionWrap}>
            <h3 style={sectionHeading}>Signature</h3>

            <div style={fieldWrap}>
              <label style={labelStyle}>Sign here</label>
              <SignaturePad value={signature} onChange={setSignature} ariaLabel="Your signature" />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Date</label>
              <input
                value={signatureDate}
                onChange={e => setSignatureDate(e.target.value)}
                type="date"
                style={{ ...inputStyle, maxWidth: 220, ...(focusField === "sigDate" ? inputFocusStyle : {}) }}
                onFocus={() => setFocusField("sigDate")} onBlur={() => setFocusField(null)}
              />
            </div>
          </section>

          {/* SECTION 5 — SUBMISSION CONTENT */}
          <section style={sectionWrap}>
            <h3 style={sectionHeading}>Submission Content</h3>

            <p style={{ fontFamily: body, fontSize: "0.9rem", color: C.muted, margin: "0 0 12px", lineHeight: 1.5 }}>
              Upload up to {MAX_FILES} images (JPG, PNG, or WebP — 15MB max each).
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              multiple
              onChange={handleFiles}
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={files.length >= MAX_FILES}
              style={{
                width: "100%",
                background: files.length >= MAX_FILES ? C.border : C.bg,
                color: files.length >= MAX_FILES ? C.muted : C.heading,
                border: `1.5px dashed ${files.length >= MAX_FILES ? C.border : C.borderFocus}`,
                borderRadius: 12,
                padding: "20px 16px",
                cursor: files.length >= MAX_FILES ? "default" : "pointer",
                fontFamily: heading, fontWeight: 700, fontSize: "0.9rem",
                letterSpacing: "0.12em", textTransform: "uppercase",
                touchAction: "manipulation",
                transition: "all 0.15s",
              }}
            >
              {files.length >= MAX_FILES ? "Maximum files reached" : files.length === 0 ? "+ Add Photos" : "+ Add More Photos"}
            </button>

            <p style={{ fontFamily: body, fontSize: "0.8rem", color: C.muted, textAlign: "center", margin: "10px 0 0" }}>
              {files.length} of {MAX_FILES} files selected
            </p>

            {fileError && (
              <p style={{ fontFamily: body, fontSize: "0.85rem", color: C.error, textAlign: "center", marginTop: 10, padding: "10px 14px", background: "#C4333310", borderRadius: 8 }}>
                {fileError}
              </p>
            )}

            {files.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
                {files.map((f, i) => (
                  <li key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px",
                    background: C.bg, borderRadius: 10,
                    border: `1px solid ${C.border}`,
                  }}>
                    <span style={{ flex: 1, fontFamily: body, fontSize: "0.9rem", color: C.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.name}
                    </span>
                    <span style={{ fontFamily: body, fontSize: "0.75rem", color: C.muted, flexShrink: 0 }}>
                      {(f.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${f.name}`}
                      style={{
                        background: "transparent", border: "none",
                        color: C.muted, cursor: "pointer",
                        padding: 6, borderRadius: 6,
                        display: "flex", alignItems: "center",
                        touchAction: "manipulation",
                      }}
                    >
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* SECTION 6 — UNDER 18 (conditional) */}
          <section style={sectionWrap}>
            <div
              onClick={() => setUnder18(!under18)}
              role="checkbox"
              aria-checked={under18}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setUnder18(!under18); } }}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 16px", borderRadius: 12,
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
                This contribution involves a person under 18
              </span>
            </div>

            {under18 && (
              <div style={{ marginTop: 18 }}>
                <p style={{ fontFamily: body, fontSize: "0.95rem", color: C.body, lineHeight: 1.6, margin: "0 0 18px" }}>
                  If this contribution involves children under the age of 18, then the signature of a parent or legal guardian is also required.
                </p>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Parent's Signature</label>
                  <SignaturePad value={parentSignature} onChange={setParentSignature} ariaLabel="Parent or guardian signature" />
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Date</label>
                  <input
                    value={parentSignatureDate}
                    onChange={e => setParentSignatureDate(e.target.value)}
                    type="date"
                    style={{ ...inputStyle, maxWidth: 220, ...(focusField === "parentSigDate" ? inputFocusStyle : {}) }}
                    onFocus={() => setFocusField("parentSigDate")} onBlur={() => setFocusField(null)}
                  />
                </div>
              </div>
            )}
          </section>

          {/* SECTION 7 — AUTHORISATION */}
          <section style={sectionWrap}>
            <p style={{ fontFamily: body, fontSize: "0.95rem", color: C.body, lineHeight: 1.6, margin: "0 0 16px" }}>
              By contributing you authorise Inner West Council and STORYBOX.CO to feature your contributions in the Inner West Museum of Rugby League and any associated social media or promotion attached to the project or STORYBOX.
            </p>

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
              ) : "Submit Contribution"}
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
