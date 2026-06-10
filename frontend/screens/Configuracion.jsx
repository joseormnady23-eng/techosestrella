/* global React, Icon, TechosLogo, KlikaWord, StarMark, Toggle */
// ============================================================
//  Pantalla · Configuración / Ajustes  (solo dueño)
// ============================================================
const { useState: useStateCfg, useRef: useRefCfg } = React;

const CFG_SECCIONES = [
  { k: "empresa",   label: "Identidad de la empresa", icon: "clients",  desc: "Datos y logo" },
  { k: "sistema",   label: "Configuración del sistema", icon: "settings", desc: "ITBIS, moneda, clima" },
  { k: "pdf",       label: "Documentos PDF",          icon: "quote",    desc: "Cotizaciones y garantía" },
  { k: "branding",  label: "Branding del sistema",    icon: "sparkle",  desc: "Klika y colores" },
];

function Configuracion() {
  const [sec, setSec] = useStateCfg("empresa");
  const [saved, setSaved] = useStateCfg(null);
  function guardar(s) { setSaved(s); setTimeout(() => setSaved(null), 2200); }

  return (
    <div style={cf.page} className="r-page r-main">
      {/* rail de secciones */}
      <aside style={cf.rail} className="r-stick0">
        {CFG_SECCIONES.map((s) => (
          <button key={s.k} onClick={() => setSec(s.k)} style={{ ...cf.railItem, ...(sec === s.k ? cf.railOn : {}) }}>
            <span style={{ ...cf.railIcon, background: sec === s.k ? "var(--blue-600)" : "var(--ink-100)" }}>
              <Icon name={s.icon} size={18} color={sec === s.k ? "#fff" : "var(--ink-500)"} />
            </span>
            <span style={{ textAlign: "left", minWidth: 0 }}>
              <span style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: "var(--ink-900)" }}>{s.label}</span>
              <span style={{ display: "block", fontSize: 12, color: "var(--ink-400)" }}>{s.desc}</span>
            </span>
          </button>
        ))}
        <div style={cf.railNote}><Icon name="shield" size={15} color="var(--ink-400)" /> Solo el dueño puede editar los ajustes.</div>
      </aside>

      {/* contenido */}
      <div style={{ minWidth: 0 }}>
        {sec === "empresa"  && <SecEmpresa  onSave={() => guardar("empresa")}  saved={saved === "empresa"} />}
        {sec === "sistema"  && <SecSistema  onSave={() => guardar("sistema")}  saved={saved === "sistema"} />}
        {sec === "pdf"      && <SecPDF       onSave={() => guardar("pdf")}      saved={saved === "pdf"} />}
        {sec === "branding" && <SecBranding  onSave={() => guardar("branding")} saved={saved === "branding"} />}
      </div>
    </div>
  );
}

// ---------- Encabezado de sección reutilizable ----------
function SecHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: "-.3px" }}>{title}</h2>
      <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "var(--ink-400)" }}>{sub}</p>
    </div>
  );
}
function SaveBar({ onSave, saved }) {
  return (
    <div style={cf.saveBar}>
      {saved && <span style={cf.savedMsg}><Icon name="checkcircle" size={16} color="var(--green)" /> Cambios guardados</span>}
      <button className="btn btn-ghost" type="button">Cancelar</button>
      <button className="btn btn-primary" type="button" onClick={onSave}><Icon name="check" size={16} /> Guardar cambios</button>
    </div>
  );
}
function FieldRow({ label, hint, children, full }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: full ? "1fr" : "200px 1fr", gap: full ? 8 : 18, alignItems: "start", padding: "16px 0", borderBottom: "1px solid var(--ink-100)" }} className={full ? undefined : "r-fieldrow"}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-800)" }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 3, lineHeight: 1.4 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ================= 1 · Identidad de la empresa =================
function SecEmpresa({ onSave, saved }) {
  const fileRef = useRefCfg(null);
  return (
    <div style={cf.col}>
      <SecHead title="Identidad de la empresa" sub="Estos datos aparecen en cotizaciones, PDF y el portal del cliente." />
      <section className="card" style={cf.card}>
        <FieldRow label="Logo de la empresa" hint="PNG o SVG con fondo transparente. Aparece en los documentos.">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={cf.logoBox}><TechosLogo scale={0.62} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={() => {}} />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => fileRef.current?.click()}><Icon name="camera" size={15} /> Cambiar logo</button>
              <span style={{ fontSize: 11.5, color: "var(--ink-400)" }}>Recomendado: 512×512 px</span>
            </div>
          </div>
        </FieldRow>
        <FieldRow label="Nombre de la empresa" hint="Razón social completa.">
          <input className="input" defaultValue="Techos Estrella SRL" />
        </FieldRow>
        <FieldRow label="RNC" hint="Aparece en los documentos PDF y facturas.">
          <input className="input" defaultValue="1-31-45678-9" style={{ maxWidth: 260 }} />
        </FieldRow>
        <FieldRow label="Teléfono">
          <input className="input" defaultValue="809-580-1993" style={{ maxWidth: 260 }} />
        </FieldRow>
        <FieldRow label="Correo electrónico">
          <input className="input" type="email" defaultValue="info@techosestrella.com" style={{ maxWidth: 360 }} />
        </FieldRow>
        <FieldRow label="Dirección">
          <textarea className="input" rows={2} style={{ height: "auto", padding: "11px 14px", resize: "vertical" }} defaultValue="Av. 27 de Febrero #45, Los Jardines Metropolitanos, Santiago de los Caballeros, R.D." />
        </FieldRow>
      </section>
      <SaveBar onSave={onSave} saved={saved} />
    </div>
  );
}

// ================= 2 · Configuración del sistema =================
function SecSistema({ onSave, saved }) {
  const [itbis, setItbis] = useStateCfg(true);
  const [pct, setPct] = useStateCfg(18);
  const [apto, setApto] = useStateCfg(30);      // lluvia < apto = apto
  const [bloq, setBloq] = useStateCfg(60);      // lluvia > bloq = bloqueado

  return (
    <div style={cf.col}>
      <SecHead title="Configuración del sistema" sub="Reglas de cálculo y parámetros que usa Klika en todo el sistema." />

      <section className="card" style={cf.card}>
        <FieldRow label="ITBIS" hint="Impuesto aplicado a las cotizaciones.">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Toggle on={itbis} onChange={() => setItbis((v) => !v)} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: itbis ? "var(--green-ink)" : "var(--ink-400)" }}>{itbis ? "Activado" : "Desactivado"}</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: itbis ? 1 : .4, pointerEvents: itbis ? "auto" : "none" }}>
              <input className="input input-sm" type="number" value={pct} onChange={(e) => setPct(+e.target.value)} style={{ width: 84, textAlign: "right" }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-500)" }}>%</span>
            </div>
          </div>
        </FieldRow>
        <FieldRow label="Moneda" hint="Moneda para precios y documentos.">
          <select className="input" defaultValue="DOP" style={{ maxWidth: 280 }}>
            <option value="DOP">DOP — Peso dominicano (RD$)</option>
            <option value="USD">USD — Dólar estadounidense (US$)</option>
            <option value="EUR">EUR — Euro (€)</option>
          </select>
        </FieldRow>
      </section>

      {/* Umbrales de clima */}
      <section className="card" style={{ ...cf.card, marginTop: 16 }}>
        <div style={{ padding: "16px 0 4px" }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}><Icon name="cloud" size={18} color="var(--ink-500)" /> Umbrales de clima</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 4 }}>Probabilidad de lluvia con la que Klika clasifica cada día en el planificador.</div>
        </div>

        {/* barra visual de zonas */}
        <div style={{ padding: "18px 0 10px" }}>
          <div style={cf.climaBar}>
            <div style={{ width: apto + "%", background: "var(--green)", display: "grid", placeItems: "center" }}>
              <span style={cf.climaLbl}>Apto</span>
            </div>
            <div style={{ width: (bloq - apto) + "%", background: "var(--amber)", display: "grid", placeItems: "center" }}>
              <span style={cf.climaLbl}>Precaución</span>
            </div>
            <div style={{ width: (100 - bloq) + "%", background: "var(--red)", display: "grid", placeItems: "center" }}>
              <span style={cf.climaLbl}>Bloqueado</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-400)", marginTop: 6 }} className="tnum">
            <span>0%</span><span>{apto}%</span><span>{bloq}%</span><span>100%</span>
          </div>
        </div>

        <div style={cf.thresholdGrid} className="r-threshold">
          <ThresholdField label="Apto si la lluvia es menor a" color="var(--green)" value={apto} min={5} max={bloq - 5}
            onChange={(v) => setApto(Math.min(v, bloq - 5))} />
          <ThresholdField label="Bloqueado si la lluvia es mayor a" color="var(--red)" value={bloq} min={apto + 5} max={95}
            onChange={(v) => setBloq(Math.max(v, apto + 5))} />
        </div>
        <div style={cf.climaResume}>
          <Resume color="var(--green)" t="Apto" v={`< ${apto}% de lluvia`} />
          <Resume color="var(--amber)" t="Precaución" v={`${apto}% – ${bloq}%`} />
          <Resume color="var(--red)" t="Bloqueado" v={`> ${bloq}% de lluvia`} />
        </div>
      </section>
      <SaveBar onSave={onSave} saved={saved} />
    </div>
  );
}

function ThresholdField({ label, color, value, min, max, onChange }) {
  return (
    <div style={{ padding: "14px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} /> {label}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input className="input input-sm" type="number" value={value} min={min} max={max} onChange={(e) => onChange(+e.target.value)} style={{ width: 70, textAlign: "right" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-500)" }}>%</span>
        </span>
      </div>
      <input type="range" min={5} max={95} value={value} onChange={(e) => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: color }} />
    </div>
  );
}
function Resume({ color, t, v }) {
  return (
    <div style={{ flex: 1, padding: "11px 13px", background: "var(--surface-2)", border: "1px solid var(--ink-100)", borderRadius: 11 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: color }} /> {t}</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginTop: 4 }} className="tnum">{v}</div>
    </div>
  );
}

// ================= 3 · Documentos PDF =================
function SecPDF({ onSave, saved }) {
  return (
    <div style={cf.col}>
      <SecHead title="Documentos PDF" sub="Textos y apariencia de las cotizaciones y certificados que recibe el cliente." />

      {/* vista previa del encabezado */}
      <section className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={cf.previewLabel}><Icon name="eye" size={14} color="var(--ink-400)" /> Vista previa del encabezado del PDF</div>
        <div style={cf.pdfSheet}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
            <TechosLogo scale={0.7} />
            <div style={{ textAlign: "right", fontSize: 11, color: "var(--ink-500)", lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: "var(--ink-900)", fontSize: 12 }}>Techos Estrella SRL</div>
              <div>RNC 1-31-45678-9</div>
              <div>809-580-1993 · info@techosestrella.com</div>
              <div>Av. 27 de Febrero #45, Santiago, R.D.</div>
            </div>
          </div>
          <div style={{ height: 2, background: "var(--blue-600)", margin: "14px 0 12px", borderRadius: 2 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink-900)" }}>COTIZACIÓN</div>
            <div style={{ fontSize: 11, color: "var(--ink-400)" }} className="mono">N° OB-2401 · 31 may 2026</div>
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            {[1, 2, 3].map((i) => <div key={i} style={{ height: 8, background: "var(--ink-100)", borderRadius: 3, width: ["100%", "92%", "70%"][i - 1] }} />)}
          </div>
        </div>
      </section>

      <section className="card" style={cf.card}>
        <FieldRow label="Pie de página de cotizaciones" hint="Texto al final de cada cotización PDF." full>
          <textarea className="input" rows={3} style={{ height: "auto", padding: "11px 14px", resize: "vertical", lineHeight: 1.5 }}
            defaultValue={"Cotización válida por 30 días. Precios sujetos a cambio sin previo aviso. No incluye trabajos no especificados. Anticipo del 50% para iniciar la obra.\nGracias por confiar en Techos Estrella — impermeabilizando Santiago desde 1993."} />
        </FieldRow>
        <FieldRow label="Condiciones de garantía por defecto" hint="Se pre-llena en cada obra nueva. Puede editarse por obra." full>
          <textarea className="input" rows={4} style={{ height: "auto", padding: "11px 14px", resize: "vertical", lineHeight: 1.5 }}
            defaultValue={"Techos Estrella SRL garantiza el sistema de impermeabilización aplicado por un período de 7 años contra filtraciones, cubriendo materiales y mano de obra.\nLa garantía no cubre daños por terceros, modificaciones estructurales, ni mantenimiento inadecuado. Requiere inspección anual gratuita coordinada con la empresa."} />
        </FieldRow>
      </section>
      <SaveBar onSave={onSave} saved={saved} />
    </div>
  );
}

// ================= 4 · Branding del sistema =================
const PRIMARIOS = ["#1E7FC2", "#2E96D8", "#176399", "#1F8A5B", "#7B4FA0"];
const ACENTOS   = ["#F2A33A", "#E0392B", "#3FAE4A", "#7B4FA0", "#1E7FC2"];

function SecBranding({ onSave, saved }) {
  const fileRef = useRefCfg(null);
  const [primario, setPrimario] = useStateCfg("#1E7FC2");
  const [acento, setAcento] = useStateCfg("#F2A33A");

  return (
    <div style={cf.col}>
      <SecHead title="Branding del sistema" sub="La marca del software Klika y los colores de la interfaz." />
      <section className="card" style={cf.card}>
        <FieldRow label="Logo de Klika" hint="La marca del software (distinta al logo de la empresa).">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ ...cf.logoBox, background: "var(--ink-900)", display: "flex", alignItems: "center", gap: 10 }}>
              <StarMark size={30} /><KlikaWord height={22} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={() => {}} />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => fileRef.current?.click()}><Icon name="camera" size={15} /> Cambiar logo</button>
              <span style={{ fontSize: 11.5, color: "var(--ink-400)" }}>Se usa en la barra lateral y el chat</span>
            </div>
          </div>
        </FieldRow>
        <FieldRow label="Color primario" hint="Botones, enlaces y elementos activos.">
          <ColorPicker value={primario} onChange={setPrimario} options={PRIMARIOS} />
        </FieldRow>
        <FieldRow label="Color de acento" hint="Etiquetas secundarias y detalles.">
          <ColorPicker value={acento} onChange={setAcento} options={ACENTOS} />
        </FieldRow>
        <FieldRow label="Vista previa" hint="Cómo se ven los colores juntos." full>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", paddingTop: 4 }}>
            <button type="button" style={{ ...cf.prevBtn, background: primario }}>Botón primario</button>
            <span style={{ ...cf.prevBadge, background: acento + "22", color: acento, border: "1px solid " + acento + "55" }}>Etiqueta</span>
            <span style={{ fontSize: 13.5, color: primario, fontWeight: 600 }}>Un enlace de ejemplo →</span>
          </div>
        </FieldRow>
      </section>
      <SaveBar onSave={onSave} saved={saved} />
    </div>
  );
}

function ColorPicker({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      {options.map((c) => (
        <button key={c} type="button" onClick={() => onChange(c)}
          style={{ width: 34, height: 34, borderRadius: 9, background: c, border: "2px solid " + (value === c ? "var(--ink-900)" : "transparent"),
            boxShadow: value === c ? "0 0 0 2px #fff inset" : "var(--sh-sm)", cursor: "pointer", display: "grid", placeItems: "center" }}>
          {value === c && <Icon name="check" size={16} color="#fff" />}
        </button>
      ))}
      <label style={cf.customColor}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 22, height: 22, border: "none", background: "none", padding: 0, cursor: "pointer" }} />
        <span className="mono" style={{ fontSize: 12, color: "var(--ink-500)", textTransform: "uppercase" }}>{value}</span>
      </label>
    </div>
  );
}

const cf = {
  page: { padding: "20px 28px 48px", display: "grid", gridTemplateColumns: "264px 1fr", gap: 24, maxWidth: 1200, margin: "0 auto", alignItems: "start" },
  rail: { display: "flex", flexDirection: "column", gap: 5, position: "sticky", top: 20 },
  railItem: { display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12, border: "1px solid transparent", background: "transparent", textAlign: "left", width: "100%", cursor: "pointer", transition: "background .12s" },
  railOn: { background: "var(--surface)", border: "1px solid var(--ink-100)", boxShadow: "var(--sh-sm)" },
  railIcon: { width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 },
  railNote: { display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12, padding: "11px 12px", fontSize: 12, color: "var(--ink-400)", lineHeight: 1.45, background: "var(--ink-100)", borderRadius: 10 },

  col: { maxWidth: 760 },
  card: { padding: "4px 20px 8px" },
  saveBar: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginTop: 18 },
  savedMsg: { display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "var(--green-ink)", marginRight: "auto" },

  logoBox: { padding: "14px 18px", background: "var(--surface-2)", border: "1px solid var(--ink-100)", borderRadius: 13, flexShrink: 0 },

  climaBar: { display: "flex", height: 40, borderRadius: 10, overflow: "hidden", border: "1px solid var(--ink-100)" },
  climaLbl: { fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", padding: "0 6px" },
  thresholdGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, borderTop: "1px solid var(--ink-100)", paddingTop: 4 },
  climaResume: { display: "flex", gap: 10, padding: "16px 0 4px", flexWrap: "wrap" },

  previewLabel: { display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12 },
  pdfSheet: { background: "#fff", border: "1px solid var(--ink-200)", borderRadius: 10, padding: "22px 24px", boxShadow: "var(--sh-md)" },

  prevBtn: { height: 40, padding: "0 18px", borderRadius: 8, border: "none", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "default" },
  prevBadge: { height: 26, display: "inline-flex", alignItems: "center", padding: "0 12px", borderRadius: 99, fontSize: 12.5, fontWeight: 700 },
  customColor: { display: "flex", alignItems: "center", gap: 8, height: 34, padding: "0 11px", borderRadius: 9, border: "1px solid var(--ink-200)", background: "var(--surface)" },
};

window.Configuracion = Configuracion;
