/* global React, Icon, CLIMA, CLIMA_META, PROGRAMACION, OBRAS, CUADRILLAS, ESTADOS, KlikaData */
// ============================================================
//  Pantalla 6 · Planificador del mes (clima + obras)
// ============================================================
const { useState: useStatePl, useEffect: useEffectPl } = React;

function Planificador({ onNav, onKlika, role }) {
  const [sel, setSel] = useStatePl(11);
  const [progMap, setProgMap] = useStatePl(() => ({ ...PROGRAMACION }));
  const [climaMap, setClimaMap] = useStatePl(() => ({ ...CLIMA }));
  const [obrasData, setObrasData] = useStatePl(() => [...OBRAS]);
  const [cuadrillasData, setCuadrillasData] = useStatePl(() => [...CUADRILLAS]);

  // junio 2026 empieza lunes 1
  const dias = Array.from({ length: 30 }, (_, i) => i + 1);
  const dowHead = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  useEffectPl(() => {
    if (!window.KlikaData || !KlikaData.conectado()) return;
    const mes = "2026-06";
    KlikaData.planificador.dias(mes).then((res) => {
      const arr = res.data ?? res;
      if (!arr.length) return;
      const prog = {};
      const clim = {};
      arr.forEach((entry) => {
        const d = entry.fecha ? new Date(entry.fecha).getUTCDate() : null;
        if (!d) return;
        if (!prog[d]) prog[d] = [];
        const obraRef = entry.obra?.codigo ?? (entry.obra_id ? String(entry.obra_id) : null);
        if (obraRef) prog[d].push(obraRef);
        if (entry.clima) clim[d] = entry.clima;
      });
      setProgMap((p) => ({ ...p, ...prog }));
      setClimaMap((c) => ({ ...c, ...clim }));
    }).catch(() => {});
    KlikaData.obras.lista({ per_page: 100 }).then((res) => {
      const arr = (res.data ?? res).map(KlikaData.map.obra);
      if (arr.length) setObrasData(arr);
    }).catch(() => {});
    KlikaData.cuadrillas.lista().then((res) => {
      const arr = res.data ?? res;
      if (arr.length) setCuadrillasData(arr);
    }).catch(() => {});
  }, []);

  function obrasDe(d) { return (progMap[d] || []).map((id) => obrasData.find((o) => o.id === id || o._id == id)).filter(Boolean); }
  function conflicto(d) { return climaMap[d] === "bloqueado" && (progMap[d] || []).length > 0; }

  const conflictos = dias.filter(conflicto);
  const selObras = obrasDe(sel);

  return (
    <div style={pl.page} className="r-page r-main">
      {/* Calendario */}
      <div style={{ minWidth: 0 }}>
        <div style={pl.head}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn btn-icon btn-ghost btn-sm"><Icon name="chevleft" size={16} /></button>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Junio 2026</h3>
            <button className="btn btn-icon btn-ghost btn-sm"><Icon name="chevright" size={16} /></button>
          </div>
          <div style={pl.legend}>
            {Object.entries(CLIMA_META).map(([k, m]) => (
              <span key={k} style={pl.legendItem}><span style={{ width: 11, height: 11, borderRadius: 4, background: m.color }} /> {m.label}</span>
            ))}
          </div>
        </div>

        {conflictos.length > 0 && (
          <div style={pl.conflictBar}>
            <Icon name="alert" size={18} color="var(--red)" />
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>
              {conflictos.length} {conflictos.length === 1 ? "conflicto" : "conflictos"}: obra programada en día bloqueado por lluvia.
            </span>
            <button className="btn btn-sm" style={{ marginLeft: "auto", background: "var(--red)", color: "#fff" }} onClick={onKlika}>
              <Icon name="sparkle" size={14} /> Pedir a Klika reprogramar
            </button>
          </div>
        )}

        <div className="card" style={{ padding: 14, overflow: "hidden" }}>
          <div style={pl.dowRow}>{dowHead.map((d) => <div key={d} style={pl.dow}>{d}</div>)}</div>
          <div style={pl.grid}>
            {dias.map((d) => {
              const m = CLIMA_META[climaMap[d] ?? "soleado"] ?? CLIMA_META.soleado;
              const obs = obrasDe(d);
              const conf = conflicto(d);
              const isSel = sel === d;
              return (
                <button key={d} onClick={() => setSel(d)} className="r-calcell"
                  style={{ ...pl.cell, borderColor: isSel ? "var(--ink-900)" : (conf ? "var(--red)" : "var(--ink-100)"),
                    boxShadow: isSel ? "0 0 0 2px var(--ink-900)" : "none", background: m.bg + "" }}>
                  <div style={pl.cellTop}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-900)" }} className="tnum">{d}</span>
                    <span style={{ display: "inline-flex" }}><Icon name={m.icon} size={15} color={m.color} /></span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
                    {obs.slice(0, 2).map((o) => {
                      const cu = cuadrillasData.find((c) => c.id === o.cuadrilla);
                      return (
                        <span key={o.id} style={{ ...pl.chipObra, background: conf ? "var(--red)" : (cu ? cu.color : "var(--ink-400)") }}>
                          {conf && <Icon name="alert" size={10} color="#fff" />}
                          {o.clienteNom.split("·")[0].split(" ").slice(0, 2).join(" ")}
                        </span>
                      );
                    })}
                    {obs.length > 2 && <span style={{ fontSize: 10.5, color: "var(--ink-400)", fontWeight: 600 }}>+{obs.length - 2} más</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel lateral · Klika + día seleccionado */}
      <aside style={pl.aside} className="r-stick0">
        <div style={pl.klikaPanel}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={pl.klikaGlyph}><Icon name="sparkle" size={17} color="#fff" /></span>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Klika sugiere</div>
          </div>
          <div style={pl.suggest}>
            <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-100)" }}>
              El <strong style={{ color: "#fff" }}>jueves 11 llueve</strong> y tienes <strong style={{ color: "#fff" }}>Familia Then</strong> programada. Te recomiendo moverla al <strong style={{ color: "#fff" }}>lunes 15</strong> (apto) — la cuadrilla A queda libre.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn btn-sm" style={{ background: "#fff", color: "var(--ink-900)", flex: 1, justifyContent: "center" }}>
                <Icon name="swap" size={14} /> Mover al lunes
              </button>
              <button className="btn btn-sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>Ignorar</button>
            </div>
          </div>
          <button onClick={onKlika} style={pl.askBtn}>
            <Icon name="sparkle" size={14} /> Abrir chat con Klika
          </button>
        </div>

        {/* Detalle del día seleccionado */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-400)", fontWeight: 600 }}>Junio</div>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }} className="tnum">{sel}</div>
            </div>
            {(() => { const ms = CLIMA_META[climaMap[sel] ?? "soleado"] ?? CLIMA_META.soleado; return (
              <span className="badge" style={{ background: ms.bg, color: ms.ink, height: 28 }}>
                <Icon name={ms.icon} size={14} color={ms.color} /> {ms.label}
              </span>
            ); })()}
          </div>
          {selObras.length ? selObras.map((o) => {
            const cu = cuadrillasData.find((c) => c.id === o.cuadrilla);
            const conf = conflicto(sel);
            return (
              <button key={o.id} onClick={() => onNav("obra", o.id)} style={{ ...pl.dayObra, borderColor: conf ? "var(--red)" : "var(--ink-100)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: cu ? cu.color : "var(--ink-300)" }} />
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{o.clienteNom}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 3 }}>{o.titulo}</div>
                {conf && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7, fontSize: 12, color: "var(--red)", fontWeight: 600 }}><Icon name="alert" size={13} /> Cae en día bloqueado</div>}
              </button>
            );
          }) : <div style={{ fontSize: 13.5, color: "var(--ink-400)", padding: "8px 0" }}>Sin obras programadas este día.</div>}
        </div>
      </aside>
    </div>
  );
}

const pl = {
  page: { padding: "20px 28px 40px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, maxWidth: 1320, margin: "0 auto", alignItems: "start" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 },
  legend: { display: "flex", gap: 14 },
  legendItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--ink-500)", fontWeight: 500 },
  conflictBar: { display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "var(--red-bg)", border: "1px solid #f3c4bf", borderRadius: 11, marginBottom: 14, flexWrap: "wrap" },
  dowRow: { display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 8, marginBottom: 8 },
  dow: { textAlign: "center", fontSize: 11.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".4px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 8 },
  cell: { minHeight: 92, borderRadius: 10, border: "1.5px solid", padding: "7px 8px", textAlign: "left", cursor: "pointer",
    display: "flex", flexDirection: "column", transition: "box-shadow .12s", minWidth: 0, overflow: "hidden" },
  cellTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  chipObra: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "#fff",
    padding: "2px 6px", borderRadius: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, maxWidth: "100%" },

  aside: { display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 20 },
  klikaPanel: { background: "linear-gradient(160deg,var(--ink-900),#23252b)", borderRadius: 16, padding: 16, position: "relative", overflow: "hidden" },
  klikaGlyph: { width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", background: "linear-gradient(135deg,var(--star-blue),var(--star-purple))" },
  suggest: { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: 13 },
  askBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", marginTop: 12, height: 38,
    borderRadius: 9, border: "1px solid rgba(255,255,255,.15)", background: "transparent", color: "#fff", fontWeight: 600, fontSize: 13 },
  dayObra: { display: "block", width: "100%", textAlign: "left", padding: "11px 12px", borderRadius: 10, border: "1px solid", background: "var(--surface-2)", marginBottom: 8 },
};

window.Planificador = Planificador;
