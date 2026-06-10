/* global React, Icon, OBRAS, ESTADOS, CLIMA, CLIMA_META, MATERIALES, money0, CUADRILLAS, useKlikaStore, useRHStore */
// ============================================================
//  Pantalla 2 · Dashboard (inicio)
// ============================================================
function Dashboard({ onNav, onKlika, role }) {
  const store = useKlikaStore();
  const rhStore = useRHStore();
  const esDueno = role === "dueno";

  // Datos en vivo del backend (si está conectado). Fallback al mock si no.
  const [live, setLive] = React.useState(null);
  React.useEffect(() => {
    if (window.KlikaData && KlikaData.conectado()) {
      KlikaData.dashboard().then(setLive).catch(() => setLive(null));
    }
  }, []);
  const pendientes = store.pendientes();
  const activas = OBRAS.filter((o) => ["proceso", "aprobada", "pausada"].includes(o.estado));
  const hoy = OBRAS.filter((o) => o.estado === "proceso");
  const cotPend = OBRAS.filter((o) => o.estado === "cotizada");
  const bajoStock = store.materiales.filter((m) => m.stock < m.min);
  const diasBloq = Object.entries(CLIMA).filter(([d, e]) => e !== "apto" && +d >= 1 && +d <= 7);

  const esConta = role === "dueno" || role === "secretaria";

  // ---- Resumen contable del mes (mayo 2026) ----
  const FACT = window.FACTURAS || [];
  const GAST = window.GASTOS || [];
  const mes = "2026-05";
  const facMes = FACT.filter((f) => (f.fechaISO || "").slice(0, 7) === mes && !f.anulada && f.ncf);
  const ingresos = facMes.reduce((a, f) => a + window.facturaCalc(f).total, 0);
  const gastosMes = GAST.filter((g) => (g.fechaISO || "").slice(0, 7) === mes).reduce((a, g) => a + g.monto, 0);
  const porCobrar = FACT.filter((f) => !f.anulada && f.ncf && !window.facturaPagada(f)).reduce((a, f) => a + window.facturaCalc(f).pendiente, 0);
  const rechazadas = FACT.filter((f) => f.ecf === "rechazado" && !f.anulada).length;
  const contaCards = [
    { k: "Ingresos del mes", v: money0(ingresos), sub: "facturas emitidas", icon: "receipt", color: "var(--star-green)", to: "facturas" },
    { k: "Gastos del mes", v: money0(gastosMes), sub: "compras registradas", icon: "wallet", color: "var(--star-orange)", to: "gastos" },
    { k: "Por cobrar", v: money0(porCobrar), sub: "facturas no pagadas", icon: "money", color: "var(--star-blue)", to: "facturas" },
    { k: "Rechazadas DGII", v: String(rechazadas), sub: rechazadas > 0 ? "requieren atención" : "todo en orden", icon: "alert", color: rechazadas > 0 ? "var(--star-red)" : "var(--star-green)", to: "facturas", danger: rechazadas > 0 },
  ];

  // Valores en vivo del backend cuando están disponibles; si no, los del mock.
  const vObras = live ? live.obras_activas : activas.length;
  const vHoy = live ? (live.obras_hoy?.length ?? 0) : hoy.length;
  const vCot = live ? live.cotizaciones_pendientes : cotPend.length;
  const vStock = live ? (live.materiales_bajo_minimo?.length ?? 0) : bajoStock.length;

  const stats = [
    { k: "Obras activas", v: vObras, sub: "en curso o aprobadas", icon: "roof", color: "var(--star-blue)", to: "obras" },
    { k: "Obras de hoy", v: vHoy, sub: "cuadrillas en sitio", icon: "crews", color: "var(--star-green)", to: "obras" },
    { k: "Cotizaciones pendientes", v: vCot, sub: "esperando respuesta", icon: "quote", color: "var(--star-orange)", to: "cotizacion" },
    { k: "Materiales bajo mínimo", v: vStock, sub: "requieren compra", icon: "alert", color: "var(--star-red)", to: "inventario" },
  ];

  function irSolicitudes() { store.abrirSolicitudes(); onNav("inventario"); }

  // ---- Resumen de vacaciones (dueño / secretaria) ----
  const vacHoy = rhStore.deVacacionesHoy();
  const vacPend = rhStore.pendientes();
  const vacProx = rhStore.proximasSemana();

  return (
    <div style={db.page} className="r-page">
      {/* Alerta · cambios pendientes de aprobación (solo dueño) */}
      {esDueno && pendientes.length > 0 && (
        <button onClick={irSolicitudes} style={db.approvalAlert} className="fade-up">
          <span style={db.approvalIcon}><Icon name="shield" size={22} color="#fff" /></span>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontWeight: 800, fontSize: 15.5, color: "var(--red-ink)" }}>{pendientes.length} {pendientes.length === 1 ? "cambio pendiente" : "cambios pendientes"} de aprobación</div>
            <div style={{ fontSize: 13, color: "var(--red-ink)", opacity: .85, marginTop: 2 }}>Solicitudes de cambio de precio, mínimo o rendimiento esperan tu revisión.</div>
          </div>
          <span style={db.approvalCta}>Revisar <Icon name="chevright" size={16} color="var(--red-ink)" /></span>
        </button>
      )}

      {/* Saludo + acción Klika */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h2 style={db.hello}>Buenos días, equipo Techos Estrella 👋</h2>
          <p style={db.helloSub}>Sábado 31 de mayo · 3 obras corriendo hoy, próxima semana hay lluvia el jueves y viernes.</p>
        </div>
        <button onClick={onKlika} style={db.klikaBtn}>
          <span style={db.klikaGlyph}><Icon name="sparkle" size={18} color="#fff" /></span>
          <span style={{ textAlign: "left", lineHeight: 1.25 }}>
            <span style={{ display: "block", fontWeight: 700, fontSize: 14 }}>Pregúntale a Klika</span>
            <span style={{ display: "block", fontSize: 12, color: "var(--ink-400)" }}>“¿Qué obras muevo por la lluvia?”</span>
          </span>
        </button>
      </div>

      {/* Stat cards */}
      <div style={db.stats} className="r-grid4">
        {stats.map((s) => (
          <button key={s.k} className="card" style={db.stat} onClick={() => onNav(s.to)}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--sh-md)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--sh-sm)")}>
            <div style={{ ...db.statIcon, background: s.color + "1A", color: s.color }}>
              <Icon name={s.icon} size={22} color={s.color} />
            </div>
            <div style={db.statV}>{s.v}</div>
            <div style={db.statK}>{s.k}</div>
            <div style={db.statSub}>{s.sub}</div>
          </button>
        ))}
      </div>

      {/* Resumen de vacaciones (solo dueño / secretaria) */}
      {esConta && (
        <div className="card" style={db.vacCard}>
          <div style={db.vacHead}>
            <div style={db.panelTitle}><Icon name="sun" size={18} color="var(--star-orange)" /> Vacaciones y ausencias</div>
            <button className="btn btn-sm btn-quiet" onClick={() => onNav("rrhh")}>Ir a RR.HH. <Icon name="chevright" size={14} /></button>
          </div>
          <div style={db.vacGrid}>
            {/* De vacaciones hoy */}
            <div style={db.vacBlock}>
              <div style={db.vacLbl}>De vacaciones hoy</div>
              {vacHoy.length === 0 ? (
                <div style={db.vacEmpty}>Nadie está de vacaciones hoy.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {vacHoy.map((e) => (
                    <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span style={{ ...db.vacAvatar, background: e.color }}>{e.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{e.nombre}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Pendientes de aprobación */}
            <button style={{ ...db.vacBlock, ...db.vacBtn, ...(vacPend.length > 0 ? { borderColor: "color-mix(in srgb, var(--star-purple) 35%, transparent)", background: "color-mix(in srgb, var(--star-purple) 7%, transparent)" } : {}) }}
              onClick={() => onNav("rrhh")}>
              <div style={db.vacLbl}>Pendientes de aprobación</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                <span className="tnum" style={{ fontSize: 30, fontWeight: 800, color: vacPend.length > 0 ? "var(--star-purple)" : "var(--ink-300)" }}>{vacPend.length}</span>
                {vacPend.length > 0 && <span style={{ fontSize: 12.5, color: "var(--star-purple)", fontWeight: 700 }}>Revisar →</span>}
              </div>
            </button>
            {/* Próximas vacaciones esta semana */}
            <div style={db.vacBlock}>
              <div style={db.vacLbl}>Próximas esta semana</div>
              {vacProx.length === 0 ? (
                <div style={db.vacEmpty}>Sin vacaciones próximas.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 8 }}>
                  {vacProx.map((a) => {
                    const e = rhStore.empleado(a.empId);
                    return (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 3, background: e.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{e.nombre.split(" ")[0]}</span>
                        <span style={{ fontSize: 12, color: "var(--ink-400)", marginLeft: "auto" }}>{rhStore.fmtFecha(a.ini)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resumen contable (solo dueño / secretaria) */}
      {esConta && (
        <div>
          <div style={db.sectionLbl}><Icon name="bank" size={15} color="var(--ink-400)" /> Contabilidad · mayo 2026</div>
          <div style={db.stats} className="r-grid4">
            {contaCards.map((s) => (
              <button key={s.k} className="card" style={{ ...db.stat, ...(s.danger ? { borderColor: "color-mix(in srgb, var(--red) 35%, transparent)" } : {}) }} onClick={() => onNav(s.to)}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--sh-md)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--sh-sm)")}>
                <div style={{ ...db.statIcon, background: s.color + "1A", color: s.color }}>
                  <Icon name={s.icon} size={22} color={s.color} />
                </div>
                <div style={{ ...db.statV, fontSize: 26, color: s.danger ? "var(--red)" : "var(--ink-900)" }} className="tnum">{s.v}</div>
                <div style={db.statK}>{s.k}</div>
                <div style={db.statSub}>{s.sub}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={db.grid}>
        {/* Obras del día */}
        <section className="card" style={db.panel}>
          <div style={db.panelHead}>
            <div style={db.panelTitle}><Icon name="roof" size={18} color="var(--ink-500)" /> Obras de hoy</div>
            <button className="btn btn-sm btn-quiet" onClick={() => onNav("obras")}>Ver todas <Icon name="chevright" size={14} /></button>
          </div>
          <div>
            {[...hoy, ...activas.filter((o)=>o.estado!=="proceso")].slice(0, 4).map((o) => {
              const cu = CUADRILLAS.find((c) => c.id === o.cuadrilla);
              return (
                <button key={o.id} style={db.obraRow} onClick={() => onNav("obra", o.id)}
                  onMouseEnter={(e)=>e.currentTarget.style.background="var(--surface-2)"}
                  onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
                  <div style={{ ...db.obraDot, background: cu ? cu.color : "var(--ink-200)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={db.obraTitle}>{o.titulo}</div>
                    <div style={db.obraMeta}><span className="mono">{o.id}</span> · {o.clienteNom}</div>
                  </div>
                  <div style={{ width: 120 }}>
                    <div style={db.progTrack}><div style={{ ...db.progFill, width: o.avance + "%" }} /></div>
                    <div style={db.progLbl}>{o.avance}% · {cu ? cu.nombre.split("—")[0].trim() : "sin cuadrilla"}</div>
                  </div>
                  <span className={"badge " + ESTADOS[o.estado].cls}><span className="dot" />{ESTADOS[o.estado].label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Alertas de clima */}
        <section className="card" style={db.panel}>
          <div style={db.panelHead}>
            <div style={db.panelTitle}><Icon name="cloud" size={18} color="var(--ink-500)" /> Clima · próximos días</div>
            <button className="btn btn-sm btn-quiet" onClick={() => onNav("planificador")}>Planificador <Icon name="chevright" size={14} /></button>
          </div>
          <div style={{ padding: "4px 6px 8px" }}>
            <div style={db.weekStrip}>
              {[2,3,4,5,6,7,8].map((d) => {
                const e = CLIMA[d], m = CLIMA_META[e];
                const dn = ["L","M","M","J","V","S","D"];
                return (
                  <div key={d} style={{ ...db.weatherDay, background: m.bg, borderColor: m.color + "55" }}>
                    <div style={{ fontSize: 11, color: "var(--ink-400)", fontWeight: 600 }}>{dn[(d-2)%7]}</div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "var(--ink-900)" }}>{d}</div>
                    <Icon name={m.icon} size={20} color={m.color} />
                  </div>
                );
              })}
            </div>
            <div style={db.alertRow}>
              <span style={{ ...db.alertIcon, background: "var(--red-bg)" }}><Icon name="rain" size={16} color="var(--red)" /></span>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                <strong>Jueves y viernes bloqueados</strong> por lluvia. Hay 1 obra programada que cae en día bloqueado.
              </div>
            </div>
            <div style={db.alertRow}>
              <span style={{ ...db.alertIcon, background: "var(--amber-bg)" }}><Icon name="cloud" size={16} color="var(--amber)" /></span>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                <strong>Jueves con precaución.</strong> Klika sugiere mover <em>Villa Olga</em> al lunes.
              </div>
            </div>
          </div>
        </section>

        {/* Cotizaciones pendientes */}
        <section className="card" style={db.panel}>
          <div style={db.panelHead}>
            <div style={db.panelTitle}><Icon name="quote" size={18} color="var(--ink-500)" /> Cotizaciones pendientes</div>
            <button className="btn btn-sm btn-quiet" onClick={() => onNav("cotizacion")}>Ver <Icon name="chevright" size={14} /></button>
          </div>
          <div>
            {cotPend.concat(OBRAS.filter((o)=>o.estado==="aprobada")).slice(0,4).map((o) => (
              <button key={o.id} style={db.obraRow} onClick={() => onNav("obra", o.id)}
                onMouseEnter={(e)=>e.currentTarget.style.background="var(--surface-2)"}
                onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={db.obraTitle}>{o.clienteNom}</div>
                  <div style={db.obraMeta}><span className="mono">{o.id}</span> · {o.titulo}</div>
                </div>
                {esDueno && <div style={db.money}>{money0(o.total)}</div>}
                <span className={"badge " + ESTADOS[o.estado].cls}><span className="dot" />{ESTADOS[o.estado].label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Materiales bajo stock */}
        <section className="card" style={db.panel}>
          <div style={db.panelHead}>
            <div style={db.panelTitle}><Icon name="inventory" size={18} color="var(--ink-500)" /> Materiales bajo mínimo</div>
            <button className="btn btn-sm btn-quiet" onClick={() => onNav("inventario")}>Inventario <Icon name="chevright" size={14} /></button>
          </div>
          <div>
            {bajoStock.map((m) => (
              <div key={m.id} style={db.stockRow}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={db.obraTitle}>{m.nombre}</div>
                  <div style={db.obraMeta}>{m.cat} · mínimo {m.min} {m.unidad}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: "var(--red)", fontSize: 15 }} className="tnum">{m.stock}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-400)" }}>en stock</div>
                </div>
                <div style={db.stockBar}>
                  <div style={{ height: "100%", width: Math.min(100, (m.stock/m.min)*100) + "%", background: "var(--red)", borderRadius: 99 }} />
                </div>
              </div>
            ))}
            <button className="btn btn-soft btn-sm" style={{ margin: "10px 16px 4px" }} onClick={() => onNav("inventario")}>
              <Icon name="plus" size={15} /> Registrar entrada de material
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

const db = {
  page: { padding: "24px 28px 40px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 1320, margin: "0 auto" },
  approvalAlert: { display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "14px 16px", borderRadius: 14, border: "1px solid color-mix(in srgb, var(--red) 38%, transparent)", background: "var(--red-bg)", cursor: "pointer", textAlign: "left" },
  approvalIcon: { width: 42, height: 42, borderRadius: 11, background: "var(--red)", display: "grid", placeItems: "center", flexShrink: 0 },
  approvalCta: { display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 13.5, color: "var(--red-ink)", flexShrink: 0 },
  vacCard: { padding: 18 },
  vacHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  vacGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  vacBlock: { padding: "13px 15px", borderRadius: 12, border: "1px solid var(--ink-100)", background: "var(--surface-2)", minHeight: 96 },
  vacBtn: { textAlign: "left", cursor: "pointer", width: "100%", font: "inherit" },
  vacLbl: { fontSize: 11.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".4px" },
  vacEmpty: { fontSize: 13, color: "var(--ink-400)", marginTop: 10 },
  vacAvatar: { width: 28, height: 28, borderRadius: 8, color: "#fff", fontWeight: 800, fontSize: 11, display: "grid", placeItems: "center", flexShrink: 0 },
  hello: { margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-.4px" },
  helloSub: { margin: "5px 0 0", color: "var(--ink-500)", fontSize: 14 },
  klikaBtn: { display: "flex", alignItems: "center", gap: 11, padding: "10px 16px 10px 11px", background: "var(--surface)",
    border: "1px solid var(--ink-100)", borderRadius: 13, boxShadow: "var(--sh-sm)" },
  klikaGlyph: { width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center",
    background: "linear-gradient(135deg,var(--star-blue),var(--star-purple))" },

  stats: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 },
  sectionLbl: { display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 11 },
  stat: { textAlign: "left", padding: "18px 18px 16px", border: "1px solid var(--ink-100)", cursor: "pointer",
    transition: "box-shadow .14s", background: "var(--surface)", display: "block" },
  statIcon: { width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", marginBottom: 14 },
  statV: { fontSize: 34, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1 },
  statK: { fontSize: 14, fontWeight: 700, marginTop: 8, color: "var(--ink-800)" },
  statSub: { fontSize: 12.5, color: "var(--ink-400)", marginTop: 2 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 },
  panel: { padding: 0, overflow: "hidden" },
  panelHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 16px 13px", borderBottom: "1px solid var(--ink-100)" },
  panelTitle: { display: "flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: 14.5 },

  obraRow: { display: "flex", alignItems: "center", gap: 13, width: "100%", padding: "12px 16px", border: "none",
    background: "transparent", textAlign: "left", borderBottom: "1px solid var(--ink-100)", transition: "background .12s" },
  obraDot: { width: 9, height: 9, borderRadius: 3, flexShrink: 0 },
  obraTitle: { fontWeight: 600, fontSize: 14, color: "var(--ink-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  obraMeta: { fontSize: 12.5, color: "var(--ink-400)", marginTop: 2 },
  progTrack: { height: 6, background: "var(--ink-100)", borderRadius: 99, overflow: "hidden" },
  progFill: { height: "100%", background: "var(--blue-600)", borderRadius: 99 },
  progLbl: { fontSize: 11, color: "var(--ink-400)", marginTop: 4 },
  money: { fontWeight: 700, fontSize: 14, color: "var(--ink-800)" },

  weekStrip: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 7, padding: "12px 10px 6px" },
  weatherDay: { borderRadius: 10, border: "1px solid", padding: "9px 0", display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4 },
  alertRow: { display: "flex", gap: 11, alignItems: "flex-start", padding: "11px 12px", margin: "6px 6px 0", borderRadius: 10, background: "var(--surface-2)" },
  alertIcon: { width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },

  stockRow: { display: "flex", alignItems: "center", gap: 13, padding: "12px 16px", borderBottom: "1px solid var(--ink-100)" },
  stockBar: { width: 54, height: 6, background: "var(--ink-100)", borderRadius: 99, overflow: "hidden" },
};

window.Dashboard = Dashboard;
