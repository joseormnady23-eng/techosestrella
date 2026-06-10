/* global React, Icon, TechosLogo, PhoneFrame, money, money0 */
// ============================================================
//  Pantalla 12 · Portal del cliente (vista externa, móvil)
// ============================================================
const { useState: useStatePC } = React;

function PortalCliente({ onClose }) {
  const [tab, setTab] = useStatePC("cotizacion"); // cotizacion | avance
  const [estado, setEstado] = useStatePC(null);    // null | aprobada-1 | cambios | rechazada

  const etapas = [
    { n: 1, titulo: "Etapa 1 · Techo principal", desc: "Impermeabilización 120 m² · 2 manos", total: 132400 },
    { n: 2, titulo: "Etapa 2 · Marquesina", desc: "Reparación + membrana 28 m²", total: 55020 },
  ];
  const fotos = [
    { fase: "Antes", color: "#9aa3ad" }, { fase: "Durante", color: "#7fa9c9" }, { fase: "Después", color: "#8fc095" },
  ];

  return (
    <div style={pc.stage} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={pc.closeRow} className="r-phonewrap">
          <span style={{ color: "var(--ink-300)", fontSize: 13, fontWeight: 600 }}>Vista del cliente · enlace público</span>
          <button className="btn btn-sm" style={{ background: "rgba(255,255,255,.1)", color: "#fff" }} onClick={onClose}><Icon name="x" size={15} /> Cerrar</button>
        </div>
        <PhoneFrame>
          <div style={pc.wrap}>
            {/* header marca */}
            <div style={pc.header}>
              <TechosLogo scale={0.75} />
              <div style={{ marginTop: 14, fontSize: 13, color: "var(--ink-500)" }}>Propuesta para</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Familia Reyes · Villa Olga</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 2 }} className="mono">OB-2401 · válida hasta 15 jun 2026</div>
            </div>

            {/* tabs */}
            <div style={pc.tabs}>
              <button onClick={() => setTab("cotizacion")} style={{ ...pc.tab, ...(tab === "cotizacion" ? pc.tabOn : {}) }}>Cotización</button>
              <button onClick={() => setTab("avance")} style={{ ...pc.tab, ...(tab === "avance" ? pc.tabOn : {}) }}>Avance de obra</button>
            </div>

            {tab === "cotizacion" ? (
              <div style={{ padding: 16 }}>
                {estado && (
                  <div style={{ ...pc.statusBanner,
                    background: estado === "rechazada" ? "var(--red-bg)" : estado === "cambios" ? "var(--amber-bg)" : "var(--green-bg)",
                    color: estado === "rechazada" ? "var(--red-ink)" : estado === "cambios" ? "var(--amber-ink)" : "var(--green-ink)" }}>
                    <Icon name={estado === "rechazada" ? "x" : estado === "cambios" ? "edit" : "checkcircle"} size={18} />
                    {estado === "aprobada-1" && "¡Aprobaste la Etapa 1! Te contactaremos para coordinar."}
                    {estado === "cambios" && "Pediste cambios. Techos Estrella revisará y te responderá."}
                    {estado === "rechazada" && "Rechazaste la propuesta."}
                  </div>
                )}

                {etapas.map((e) => (
                  <div key={e.n} style={pc.etapa}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{e.titulo}</div>
                        <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginTop: 2 }}>{e.desc}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                      <span style={{ fontSize: 12, color: "var(--ink-400)" }}>Total con ITBIS</span>
                      <span style={{ fontWeight: 800, fontSize: 17, color: "var(--blue-700)" }}>{money0(e.total)}</span>
                    </div>
                    {e.n === 1 && (
                      <button onClick={() => setEstado("aprobada-1")}
                        style={{ ...pc.approveBtn, ...(estado === "aprobada-1" ? { background: "var(--green)", borderColor: "var(--green)", color: "#fff" } : {}) }}>
                        <Icon name="check" size={17} /> {estado === "aprobada-1" ? "Etapa 1 aprobada" : "Aprobar solo esta etapa"}
                      </button>
                    )}
                  </div>
                ))}

                <div style={pc.totalBox}>
                  <span style={{ fontSize: 13.5, color: "var(--ink-500)" }}>Total propuesta completa</span>
                  <span style={{ fontWeight: 800, fontSize: 20 }}>{money0(187420)}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 16 }}>
                  <button onClick={() => setEstado("aprobada-1")} className="btn btn-primary" style={{ height: 50, justifyContent: "center", fontSize: 15.5 }}>
                    <Icon name="checkcircle" size={19} /> Aprobar todo
                  </button>
                  <div style={{ display: "flex", gap: 9 }}>
                    <button onClick={() => setEstado("cambios")} className="btn btn-ghost" style={{ flex: 1, height: 46, justifyContent: "center" }}><Icon name="edit" size={16} /> Pedir cambios</button>
                    <button onClick={() => setEstado("rechazada")} className="btn btn-ghost" style={{ flex: 1, height: 46, justifyContent: "center", color: "var(--red)" }}><Icon name="x" size={16} /> Rechazar</button>
                  </div>
                </div>

                <div style={pc.contact}>
                  <span style={{ fontSize: 12.5, color: "var(--ink-400)" }}>¿Dudas? Escríbenos</span>
                  <button className="btn btn-soft btn-sm"><Icon name="whatsapp" size={15} /> WhatsApp</button>
                </div>
              </div>
            ) : (
              <div style={{ padding: 16 }}>
                <div style={pc.progressTop}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 8 }}>
                    <span style={{ fontWeight: 700 }}>Tu obra va al 60%</span>
                    <span style={{ color: "var(--ink-400)" }}>en proceso</span>
                  </div>
                  <div style={{ height: 10, background: "var(--ink-100)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg,var(--blue-500),var(--blue-700))", borderRadius: 99 }} />
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px", margin: "20px 0 12px" }}>Fotos de avance</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {fotos.map((f, i) => (
                    <div key={i} style={pc.photo}>
                      <div style={{ height: 110, background: `repeating-linear-gradient(45deg,${f.color},${f.color} 10px,${f.color}dd 10px,${f.color}dd 20px)`, position: "relative", display: "grid", placeItems: "center" }}>
                        <span style={{ position: "absolute", top: 8, left: 8, fontSize: 11, fontWeight: 700, color: "#fff", background: "rgba(0,0,0,.35)", padding: "3px 9px", borderRadius: 99 }}>{f.fase}</span>
                        <Icon name="camera" size={24} color="rgba(255,255,255,.8)" />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={pc.note}><Icon name="eye" size={14} color="var(--ink-400)" /> Solo ves las fotos que Techos Estrella marcó como visibles.</div>

                <div style={pc.warranty}>
                  <Icon name="shield" size={22} color="var(--green)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Garantía de 7 años</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-500)" }}>Se activa al terminar la obra</div>
                  </div>
                </div>
              </div>
            )}

            <div style={pc.footer}>Techos Estrella SRL · Santiago, R.D. · techosestrella.com</div>
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
}

const pc = {
  stage: { position: "fixed", inset: 0, background: "rgba(15,16,19,.82)", zIndex: 95, display: "grid", placeItems: "center", padding: "20px 0", overflowY: "auto" },
  closeRow: { display: "flex", alignItems: "center", justifyContent: "space-between", width: 390, gap: 12 },
  wrap: { minHeight: "100%", background: "var(--surface)" },
  header: { padding: "18px 18px 16px", borderBottom: "1px solid var(--ink-100)", textAlign: "left" },
  tabs: { display: "flex", padding: "0 16px", borderBottom: "1px solid var(--ink-100)", position: "sticky", top: 0, background: "var(--surface)", zIndex: 2 },
  tab: { flex: 1, padding: "13px 0", border: "none", background: "transparent", fontSize: 14, fontWeight: 600, color: "var(--ink-400)", borderBottom: "2.5px solid transparent", marginBottom: -1 },
  tabOn: { color: "var(--ink-900)", borderColor: "var(--blue-600)" },
  statusBanner: { display: "flex", alignItems: "center", gap: 9, padding: "12px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 16, lineHeight: 1.4 },
  etapa: { border: "1px solid var(--ink-100)", borderRadius: 14, padding: 15, marginBottom: 12, background: "var(--surface-2)" },
  approveBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 13, height: 44, borderRadius: 10, border: "1.5px solid var(--green)", background: "var(--green-bg)", color: "var(--green-ink)", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  totalBox: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--ink-900)", borderRadius: 14, color: "#fff", marginTop: 6 },
  contact: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, padding: "12px 14px", background: "var(--blue-50)", borderRadius: 12 },
  progressTop: { padding: 15, background: "var(--surface-2)", borderRadius: 14, border: "1px solid var(--ink-100)" },
  photo: { borderRadius: 12, overflow: "hidden", border: "1px solid var(--ink-100)" },
  note: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-400)", marginTop: 12, lineHeight: 1.4 },
  warranty: { display: "flex", alignItems: "center", gap: 12, marginTop: 18, padding: 14, background: "var(--green-bg)", borderRadius: 14 },
  footer: { textAlign: "center", fontSize: 11.5, color: "var(--ink-400)", padding: "18px 16px 24px" },
};

window.PortalCliente = PortalCliente;
