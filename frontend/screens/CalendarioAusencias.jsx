/* global React, Icon, useRHStore */
// ============================================================
//  Calendario de ausencias · vista mensual
//  Feriados RD · ausencias por color · pendientes punteadas · conflictos naranja
// ============================================================
function CalendarioAusencias({ store, onNuevaAusencia }) {
  const { useState } = React;
  const hoy = store.HOY;
  const [ym, setYm] = useState({ y: 2026, m: 5 }); // junio 2026 (m: 0-11)
  const [filtro, setFiltro] = useState("todos");

  const primero = new Date(ym.y, ym.m, 1);
  const diasMes = new Date(ym.y, ym.m + 1, 0).getDate();
  const offset = (primero.getDay() + 6) % 7; // lunes = 0
  const mm = String(ym.m + 1).padStart(2, "0");

  function mover(d) {
    let y = ym.y, m = ym.m + d;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setYm({ y, m });
  }

  const empleados = store.empleados.filter((e) => e.activo);
  const ausencias = store.visibles().filter((a) => filtro === "todos" || a.empId === filtro);

  // celdas: blancos de relleno + días del mes
  const celdas = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= diasMes; d++) celdas.push(d);

  function nombreCorto(empId) { const e = store.empleado(empId); return e ? e.nombre.split(" ")[0] : ""; }

  return (
    <div style={cal.wrap}>
      {/* barra superior */}
      <div style={cal.bar}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={() => mover(-1)}><Icon name="chevleft" size={17} /></button>
          <div style={{ fontSize: 17, fontWeight: 800, minWidth: 150, textAlign: "center", textTransform: "capitalize" }}>{store.MESES[ym.m]} {ym.y}</div>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={() => mover(1)}><Icon name="chevright" size={17} /></button>
          <button className="btn btn-ghost btn-sm" onClick={() => setYm({ y: 2026, m: 5 })} style={{ marginLeft: 4 }}>Hoy</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto", flexWrap: "wrap" }}>
          <select className="input input-sm" value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ width: "auto", minWidth: 180 }}>
            <option value="todos">Todos los empleados</option>
            {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={onNuevaAusencia}><Icon name="plus" size={16} /> Nueva ausencia</button>
        </div>
      </div>

      {/* leyenda */}
      <div style={cal.legend}>
        <span style={cal.legItem}><span style={{ ...cal.legDot, background: "var(--ink-200)" }} /> Feriado</span>
        <span style={cal.legItem}><span style={{ ...cal.legChip, border: "1.5px dashed var(--ink-400)", background: "transparent" }} /> Pendiente</span>
        <span style={cal.legItem}><span style={{ ...cal.legChip, background: "var(--star-blue)" }} /> Aprobada</span>
        <span style={cal.legItem}><span style={{ ...cal.legChip, background: "var(--star-orange)", boxShadow: "0 0 0 2px color-mix(in srgb,var(--star-orange) 40%,transparent)" }} /> Conflicto con obra</span>
      </div>

      {/* grilla */}
      <div className="card" style={{ overflow: "hidden", padding: 0 }}>
        <div style={cal.weekhead}>
          {store.DIAS_LMV.map((d, i) => <div key={d} style={{ ...cal.weekcell, color: i >= 5 ? "var(--ink-300)" : "var(--ink-500)" }}>{d}</div>)}
        </div>
        <div style={cal.grid}>
          {celdas.map((d, i) => {
            if (d === null) return <div key={"b" + i} style={{ ...cal.cell, background: "var(--surface-2)" }} />;
            const iso = `${ym.y}-${mm}-${String(d).padStart(2, "0")}`;
            const feriado = store.nombreFeriado(iso);
            const finde = store.esFinde(iso);
            const esHoy = iso === hoy;
            const delDia = ausencias.filter((a) => store.entreISO(iso, a.ini, a.fin));
            return (
              <div key={iso} style={{ ...cal.cell, ...(feriado ? cal.cellFeriado : {}), ...(finde && !feriado ? { background: "var(--surface-2)" } : {}) }} title={feriado || ""}>
                <div style={cal.cellTop}>
                  <span style={{ ...cal.dayNum, ...(esHoy ? cal.dayHoy : {}), color: finde && !esHoy ? "var(--ink-300)" : "var(--ink-700)" }}>{d}</span>
                  {feriado && <span style={cal.feriadoTag} title={feriado}>{feriado}</span>}
                </div>
                <div style={cal.chips}>
                  {delDia.slice(0, 3).map((a) => {
                    const e = store.empleado(a.empId);
                    const pend = a.estado === "pendiente";
                    const conf = store.diaEnConflicto(a, iso);
                    return (
                      <div key={a.id} title={`${e.nombre} · ${store.TIPO_AUSENCIA[a.tipo].label}${conf ? " · ⚠ conflicto con obra" : ""}${pend ? " (pendiente)" : ""}`}
                        style={{
                          ...cal.chip,
                          background: pend ? "transparent" : (conf ? "var(--star-orange)" : e.color),
                          color: pend ? e.color : "#fff",
                          border: pend ? `1.5px dashed ${e.color}` : "1.5px solid transparent",
                          boxShadow: conf ? "0 0 0 2px color-mix(in srgb,var(--star-orange) 45%,transparent)" : "none",
                        }}>
                        {conf && <Icon name="alert" size={11} color={pend ? "var(--star-orange)" : "#fff"} />}
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nombreCorto(a.empId)}</span>
                      </div>
                    );
                  })}
                  {delDia.length > 3 && <div style={cal.mas}>+{delDia.length - 3}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const cal = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  bar: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  legend: { display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", fontSize: 12.5, color: "var(--ink-500)", fontWeight: 600 },
  legItem: { display: "inline-flex", alignItems: "center", gap: 7 },
  legDot: { width: 14, height: 14, borderRadius: 4 },
  legChip: { width: 18, height: 13, borderRadius: 4, display: "inline-block" },
  weekhead: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)" },
  weekcell: { padding: "10px 8px", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".4px", textAlign: "left" },
  grid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)" },
  cell: { minHeight: 104, borderRight: "1px solid var(--ink-100)", borderBottom: "1px solid var(--ink-100)", padding: 7, display: "flex", flexDirection: "column", gap: 5, overflow: "hidden" },
  cellFeriado: { background: "var(--ink-100)" },
  cellTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 },
  dayNum: { fontSize: 13, fontWeight: 700, width: 24, height: 24, display: "grid", placeItems: "center", borderRadius: 7, flexShrink: 0 },
  dayHoy: { background: "var(--blue-600)", color: "#fff" },
  feriadoTag: { fontSize: 9.5, fontWeight: 700, color: "var(--ink-500)", textAlign: "right", lineHeight: 1.15, maxWidth: 78, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" },
  chips: { display: "flex", flexDirection: "column", gap: 3, marginTop: "auto" },
  chip: { display: "flex", alignItems: "center", gap: 4, height: 19, padding: "0 6px", borderRadius: 5, fontSize: 11, fontWeight: 700, lineHeight: 1 },
  mas: { fontSize: 10.5, fontWeight: 700, color: "var(--ink-400)", paddingLeft: 4 },
};

window.CalendarioAusencias = CalendarioAusencias;
