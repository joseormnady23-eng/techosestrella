/* global React, Icon, NCF_SECUENCIAS, TIPO_NCF, ncfDisponibles, ncfPct */
// ============================================================
//  CONTABILIDAD · Secuencias de NCF autorizadas por la DGII
// ============================================================
const { useState: useStateN } = React;

function SecuenciasNCF({ role }) {
  const [secs, setSecs] = useStateN(() => window.NCF_SECUENCIAS.map((s) => ({ ...s })));
  const [edit, setEdit] = useStateN(null);

  const alertas = secs.filter((s) => ncfDisponibles(s) === 0 || ncfPct(s) < 0.1).length;

  function actualizar(tipo, campos) { setSecs((arr) => arr.map((s) => s.tipo === tipo ? { ...s, ...campos } : s)); setEdit(null); }

  return (
    <div style={ns.page} className="r-page">
      {alertas > 0 && (
        <div style={ns.alertBanner}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--amber)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="alert" size={18} color="#fff" /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--amber-ink)" }}>{alertas} secuencia(s) requieren atención</div>
            <div style={{ fontSize: 13, color: "var(--amber-ink)", marginTop: 2 }}>Solicita un nuevo rango a la DGII antes de que se agoten para no detener la facturación.</div>
          </div>
        </div>
      )}

      <div style={ns.grid} className="r-grid2">
        {secs.map((s) => {
          const disp = ncfDisponibles(s);
          const pct = ncfPct(s);
          const usado = (1 - pct) * 100;
          const agotada = disp === 0;
          const bajo = !agotada && pct < 0.1;
          const estadoCls = agotada ? "badge-red" : bajo ? "badge-amber" : "badge-green";
          const estadoLbl = agotada ? "Agotada" : bajo ? "Por agotarse" : "Activa";
          const barColor = agotada ? "var(--red)" : bajo ? "var(--amber)" : "var(--green)";
          return (
            <div key={s.tipo} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span className={"badge " + TIPO_NCF[s.tipo].cls} style={{ height: 24 }}>{TIPO_NCF[s.tipo].short}</span>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{TIPO_NCF[s.tipo].label}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 5 }}>Prefijo <span className="mono" style={{ fontWeight: 600 }}>{s.prefijo}</span> · vence {s.vence}</div>
                </div>
                <span className={"badge " + estadoCls}><span className="dot" />{estadoLbl}</span>
              </div>

              <div style={ns.numbers}>
                <div><div style={ns.numLbl}>Secuencia actual</div><div style={ns.numV} className="mono">{s.prefijo}{String(s.actual).padStart(8, "0")}</div></div>
                <div style={{ textAlign: "right" }}><div style={ns.numLbl}>Disponibles</div><div style={{ ...ns.numV, color: barColor }} className="tnum">{disp.toLocaleString("es-DO")}</div></div>
              </div>

              <div style={ns.track}><div style={{ height: "100%", width: Math.max(2, usado) + "%", background: barColor, borderRadius: 99 }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11.5, color: "var(--ink-400)" }}>
                <span>Usados {s.actual.toLocaleString("es-DO")}</span>
                <span>Límite {s.hasta.toLocaleString("es-DO")}</span>
              </div>

              <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 14 }} onClick={() => setEdit(s.tipo)}>
                <Icon name="swap" size={15} /> Editar secuencia
              </button>
            </div>
          );
        })}
      </div>

      <div style={ns.note}>
        <Icon name="alert" size={15} color="var(--ink-400)" />
        <span>Los rangos de NCF los autoriza la DGII. Cuando recibas una nueva autorización, registra aquí el nuevo límite para seguir emitiendo.</span>
      </div>

      {edit && <RangoModal sec={secs.find((s) => s.tipo === edit)} onClose={() => setEdit(null)} onSave={actualizar} />}
    </div>
  );
}

function RangoModal({ sec, onClose, onSave }) {
  const [prefijo, setPrefijo] = useStateN(sec.prefijo);
  const [desde, setDesde] = useStateN(sec.desde);
  const [hasta, setHasta] = useStateN(sec.hasta);
  const [actual, setActual] = useStateN(sec.actual);
  const [vence, setVence] = useStateN(sec.vence);

  const errPrefijo = !prefijo.trim();
  const errDesde = desde < 1;
  const errHasta = hasta <= desde;
  const errActual = actual < desde || actual > hasta;
  const invalido = errPrefijo || errDesde || errHasta || errActual;

  function guardar() {
    if (invalido) return;
    onSave(sec.tipo, {
      prefijo: prefijo.trim().toUpperCase(),
      desde: +desde, hasta: +hasta, actual: +actual, vence: vence.trim(),
    });
  }

  return (
    <div style={ns.scrim} onClick={onClose}>
      <div className="card fade-up" style={{ width: "min(480px,100%)", padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Editar secuencia · {TIPO_NCF[sec.tipo].short}</h3>
          <button onClick={onClose} style={ns.xBtn}><Icon name="x" size={18} color="var(--ink-400)" /></button>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 14 }}>Ajusta los datos del rango autorizado por la DGII para <strong>{TIPO_NCF[sec.tipo].label}</strong>.</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field" style={{ gridColumn: "1 / -1" }}><label>Prefijo</label>
            <input className="input input-sm mono" value={prefijo} maxLength={4} onChange={(e) => setPrefijo(e.target.value.toUpperCase())} style={errPrefijo ? ns.inErr : null} />
          </div>
          <div className="field"><label>Desde</label>
            <input type="number" className="input input-sm" value={desde} onChange={(e) => setDesde(+e.target.value)} style={errDesde ? ns.inErr : null} />
          </div>
          <div className="field"><label>Hasta (límite)</label>
            <input type="number" className="input input-sm" value={hasta} onChange={(e) => setHasta(+e.target.value)} style={errHasta ? ns.inErr : null} />
          </div>
          <div className="field"><label>Secuencia actual</label>
            <input type="number" className="input input-sm" value={actual} onChange={(e) => setActual(+e.target.value)} style={errActual ? ns.inErr : null} />
          </div>
          <div className="field"><label>Vence</label>
            <input className="input input-sm" value={vence} placeholder="31 dic 2027" onChange={(e) => setVence(e.target.value)} />
          </div>
        </div>

        <div style={{ fontSize: 11.5, color: "var(--ink-400)", marginTop: 10, padding: "9px 11px", background: "var(--surface-2)", borderRadius: 8 }}>
          Próximo NCF: <span className="mono" style={{ fontWeight: 700, color: "var(--ink-700)" }}>{prefijo}{String((+actual || 0) + 1).padStart(8, "0")}</span>
          {!invalido && <span> · {Math.max(0, hasta - actual).toLocaleString("es-DO")} disponibles</span>}
        </div>

        <div style={{ display: "flex", gap: 9, marginTop: 18 }}>
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={invalido} onClick={guardar}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}

const ns = {
  page: { padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 1320, margin: "0 auto" },
  alertBanner: { display: "flex", alignItems: "center", gap: 13, padding: "14px 18px", background: "var(--amber-bg)", border: "1px solid color-mix(in srgb, var(--amber) 30%, transparent)", borderRadius: 12 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 },
  numbers: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", margin: "16px 0 12px" },
  numLbl: { fontSize: 11.5, color: "var(--ink-400)", fontWeight: 600, marginBottom: 3 },
  numV: { fontSize: 17, fontWeight: 800, letterSpacing: "-.3px" },
  track: { height: 9, background: "var(--ink-100)", borderRadius: 99, overflow: "hidden" },
  note: { display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--ink-500)", padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--ink-100)", borderRadius: 10, lineHeight: 1.4 },
  scrim: { position: "fixed", inset: 0, background: "rgba(20,22,26,.42)", zIndex: 60, display: "grid", placeItems: "center", padding: 20 },
  xBtn: { border: "none", background: "transparent", width: 30, height: 30, borderRadius: 7, display: "grid", placeItems: "center", cursor: "pointer" },
  inErr: { borderColor: "var(--red)", boxShadow: "0 0 0 3px color-mix(in srgb, var(--red) 14%, transparent)" },
};

Object.assign(window, { SecuenciasNCF });
