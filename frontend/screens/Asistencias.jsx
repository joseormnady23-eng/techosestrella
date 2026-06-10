/* global React, Icon, ASISTENCIAS, ASIST_META, CUADRILLAS, ROLES, KlikaData */
// ============================================================
//  Pantalla · Asistencias (check-ins · corrección por supervisor/dueño)
// ============================================================
const { useState: useStateAs, useEffect: useEffectAs } = React;

function mapAsistencia(r) {
  return {
    id: r.id,
    fecha: (r.fecha ?? r.created_at ?? "").slice(0, 10),
    quien: r.usuario?.nombre ?? r.usuario_id ?? "—",
    cuadrilla: r.cuadrilla_id ?? null,
    obra: r.obra?.codigo ?? (r.obra_id ? String(r.obra_id) : "—"),
    entrada: r.hora_entrada ? r.hora_entrada.slice(0, 5) : "—",
    salida: r.hora_salida ? r.hora_salida.slice(0, 5) : "—",
    estado: r.estado ?? "ok",
    motivo: r.motivo_correccion ?? "",
    corregido: r.corregido_por ? { por: r.corregido_por } : null,
  };
}

function Asistencias({ role }) {
  const [regs, setRegs] = useStateAs(ASISTENCIAS);
  const [cuadrillas, setCuadrillas] = useStateAs(CUADRILLAS);
  const [crew, setCrew] = useStateAs("todas");
  const [edit, setEdit] = useStateAs(null);
  const [form, setForm] = useStateAs({ entrada: "", salida: "", estado: "ok", motivo: "" });
  const puedeCorregir = role === "dueno" || role === "supervisor";

  useEffectAs(() => {
    if (!window.KlikaData || !KlikaData.conectado()) return;
    KlikaData.asistencias.lista({ per_page: 200 }).then((res) => {
      const arr = (res.data ?? res).map(mapAsistencia);
      if (arr.length) setRegs(arr);
    }).catch(() => {});
    KlikaData.cuadrillas.lista().then((res) => {
      const arr = res.data ?? res;
      if (arr.length) setCuadrillas(arr);
    }).catch(() => {});
  }, []);

  const lista = regs.filter((r) => crew === "todas" || r.cuadrilla === crew);
  const crewNom = (id) => cuadrillas.find((c) => c.id === id)?.nombre?.split("—")[1]?.trim() || id;

  function abrir(r) { setEdit(r); setForm({ entrada: r.entrada === "—" ? "" : r.entrada, salida: r.salida === "—" ? "" : r.salida, estado: r.estado, motivo: r.motivo || "" }); }

  async function guardar() {
    const corrector = ROLES?.[role]?.nombre ?? role;
    setRegs((arr) => arr.map((r) => r.id === edit.id ? {
      ...r, entrada: form.entrada || "—", salida: form.salida || "—", estado: form.estado,
      motivo: form.motivo, corregido: { por: corrector },
    } : r));
    if (window.KlikaData && KlikaData.conectado()) {
      KlikaData.asistencias.corregir(edit.id, {
        hora_entrada: form.entrada || null,
        hora_salida: form.salida || null,
        estado: form.estado,
        motivo_correccion: form.motivo || null,
      }).catch(() => {});
    }
    setEdit(null);
  }

  return (
    <div style={as.page} className="r-page">
      <div style={as.toolbar}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className={"chip" + (crew === "todas" ? " active" : "")} onClick={() => setCrew("todas")}>Todas</button>
          {cuadrillas.map((c) => (
            <button key={c.id} className={"chip" + (crew === c.id ? " active" : "")} onClick={() => setCrew(c.id)}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: c.color ?? "var(--ink-300)", display: "inline-block", marginRight: 6 }} />{(c.nombre ?? "").split("—")[0].trim()}
            </button>
          ))}
        </div>
        {puedeCorregir && <div style={as.hint}><Icon name="edit" size={14} color="var(--ink-400)" /> Puedes corregir check-ins erróneos</div>}
      </div>

      <div className="card r-tcard" style={{ overflow: "hidden" }}>
        <table style={as.table} className="r-table-lg">
          <thead><tr>
            <th style={as.th}>Fecha</th><th style={as.th}>Aplicador</th><th style={as.th}>Cuadrilla</th><th style={as.th}>Obra</th>
            <th style={{ ...as.th, textAlign: "center" }}>Entrada</th><th style={{ ...as.th, textAlign: "center" }}>Salida</th>
            <th style={as.th}>Estado</th>{puedeCorregir && <th style={as.th}></th>}
          </tr></thead>
          <tbody>
            {lista.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--ink-100)" }}>
                <td style={{ ...as.td, color: "var(--ink-500)" }} className="tnum">{r.fecha}</td>
                <td style={{ ...as.td, fontWeight: 600 }}>{r.quien}</td>
                <td style={{ ...as.td, color: "var(--ink-600)" }}>{crewNom(r.cuadrilla)}</td>
                <td style={as.td}><span className="mono" style={{ fontSize: 12.5, color: "var(--ink-400)" }}>{r.obra}</span></td>
                <td style={{ ...as.td, textAlign: "center" }} className="tnum">{r.entrada}</td>
                <td style={{ ...as.td, textAlign: "center" }} className="tnum">{r.salida}</td>
                <td style={as.td}>
                  <span className={"badge " + ASIST_META[r.estado].cls}><span className="dot" />{ASIST_META[r.estado].label}</span>
                  {r.corregido && <span style={as.corr} title={"Corregido por " + r.corregido.por}>· corregido</span>}
                </td>
                {puedeCorregir && <td style={{ ...as.td, textAlign: "right" }}>
                  <button className="btn btn-quiet btn-sm" onClick={() => abrir(r)}><Icon name="edit" size={15} /> Corregir</button>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <div style={as.overlay} onClick={() => setEdit(null)}>
          <div style={as.modal} onClick={(e) => e.stopPropagation()} className="fade-up">
            <div style={as.modalHead}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Corregir check-in</h3>
                <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 2 }}>{edit.quien} · {edit.fecha} · {edit.obra}</div>
              </div>
              <button className="btn btn-icon btn-quiet btn-sm" onClick={() => setEdit(null)}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="r-form2">
                <div className="field"><label>Hora de entrada</label>
                  <input className="input" type="time" value={form.entrada} onChange={(e) => setForm({ ...form, entrada: e.target.value })} /></div>
                <div className="field"><label>Hora de salida</label>
                  <input className="input" type="time" value={form.salida} onChange={(e) => setForm({ ...form, salida: e.target.value })} /></div>
              </div>
              <div className="field"><label>Estado</label>
                <select className="input" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                  {Object.keys(ASIST_META).map((k) => <option key={k} value={k}>{ASIST_META[k].label}</option>)}
                </select></div>
              <div className="field"><label>Motivo de la corrección</label>
                <input className="input" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} placeholder="Ej. olvidó marcar salida, GPS sin señal…" /></div>
              <div style={as.note}><Icon name="shield" size={14} color="var(--ink-400)" /> Quedará registrado que {ROLES[role].nombre} realizó esta corrección.</div>
            </div>
            <div style={as.modalFoot}>
              <button className="btn btn-ghost" onClick={() => setEdit(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}><Icon name="check" size={16} /> Guardar corrección</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const as = {
  page: { padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 1320, margin: "0 auto" },
  toolbar: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  hint: { display: "flex", alignItems: "center", gap: 7, marginLeft: "auto", fontSize: 12.5, color: "var(--ink-400)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".4px", padding: "12px 16px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)" },
  td: { padding: "12px 16px", fontSize: 14, verticalAlign: "middle" },
  corr: { fontSize: 11.5, color: "var(--ink-400)", marginLeft: 7, fontStyle: "italic" },
  note: { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-500)", background: "var(--surface-2)", border: "1px solid var(--ink-100)", borderRadius: 9, padding: "9px 11px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(20,22,26,.45)", display: "grid", placeItems: "center", zIndex: 80, padding: 20 },
  modal: { width: "100%", maxWidth: 470, background: "var(--surface)", borderRadius: 18, boxShadow: "var(--sh-pop)", overflow: "hidden" },
  modalHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--ink-100)" },
  modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 18px", borderTop: "1px solid var(--ink-100)", background: "var(--surface-2)" },
};

window.Asistencias = Asistencias;
