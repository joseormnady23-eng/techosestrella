/* global React, Icon, money0 */
// ============================================================
//  Modal · Solicitar ausencia
//  Usado desde el calendario RRHH, el dashboard y la vista móvil.
// ============================================================
function SolicitarAusencia({ store, onClose, onSubmit, empleadoFijo = null, soloLectura = false }) {
  const { useState } = React;
  const empleadosSel = store.empleados.filter((e) => e.activo);
  const [empId, setEmpId] = useState(empleadoFijo || empleadosSel[0].id);
  const [tipo, setTipo] = useState("vacaciones");
  const [ini, setIni] = useState("");
  const [fin, setFin] = useState("");
  const [motivo, setMotivo] = useState("");
  const [aviso, setAviso] = useState(null); // mensaje al elegir finde/feriado

  const emp = store.empleado(empId);
  const habiles = ini && fin && fin >= ini ? store.diasHabiles(ini, fin) : 0;
  const disponibles = store.vacacionesDisponibles(emp);
  const restantes = disponibles - habiles;
  const motivoReq = ["permiso", "personal", "otro"].includes(tipo);
  const conflictos = (ini && fin) ? store.conflictos(empId, ini, fin) : [];
  const rangoInvalido = ini && fin && fin < ini;

  function validarFecha(iso, setter, cual) {
    if (!iso) { setter(""); return; }
    if (store.esFinde(iso)) { setAviso(`El ${store.fmtFecha(iso)} cae en fin de semana. Elige un día hábil.`); return; }
    if (store.esFeriado(iso)) { setAviso(`El ${store.fmtFecha(iso)} es feriado (${store.nombreFeriado(iso)}). Elige un día hábil.`); return; }
    setAviso(null);
    setter(iso);
    // mantener coherencia ini<=fin
    if (cual === "ini" && fin && fin < iso) setFin("");
  }

  const puedeEnviar = !soloLectura && empId && tipo && ini && fin && !rangoInvalido && habiles > 0
    && (!motivoReq || motivo.trim()) && (tipo !== "vacaciones" || restantes >= 0);

  function enviar() {
    if (!puedeEnviar) return;
    store.crearAusencia({ empId, tipo, ini, fin, motivo });
    onSubmit && onSubmit(emp);
  }

  const tipos = Object.entries(store.TIPO_AUSENCIA);

  return (
    <div style={sa.overlay} onClick={onClose}>
      <div style={sa.modal} onClick={(e) => e.stopPropagation()} className="fade-up">
        <div style={sa.head}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Solicitar ausencia</h3>
          <button className="btn btn-icon btn-quiet btn-sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>

        <div style={sa.body}>
          {/* Empleado */}
          <div className="field">
            <label>Empleado</label>
            {empleadoFijo ? (
              <div style={sa.empFijo}>
                <span style={{ ...sa.avatar, background: emp.color }}>{emp.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
                <div><div style={{ fontWeight: 700, fontSize: 14 }}>{emp.nombre}</div><div style={{ fontSize: 12, color: "var(--ink-400)" }}>{emp.cargo}</div></div>
              </div>
            ) : (
              <select className="input" value={empId} onChange={(e) => setEmpId(e.target.value)}>
                {empleadosSel.map((e) => <option key={e.id} value={e.id}>{e.nombre} · {e.cargo}</option>)}
              </select>
            )}
          </div>

          {/* Tipo */}
          <div className="field">
            <label>Tipo de ausencia</label>
            <div style={sa.tipoGrid}>
              {tipos.map(([k, m]) => (
                <button key={k} onClick={() => setTipo(k)} style={{ ...sa.tipoBtn, ...(tipo === k ? { borderColor: m.color, background: m.color + "14", color: "var(--ink-900)" } : {}) }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: m.color }} /> {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field"><label>Fecha inicio</label>
              <input className="input" type="date" min={store.HOY} value={ini} onChange={(e) => validarFecha(e.target.value, setIni, "ini")} /></div>
            <div className="field"><label>Fecha fin</label>
              <input className="input" type="date" min={ini || store.HOY} value={fin} onChange={(e) => validarFecha(e.target.value, setFin, "fin")} /></div>
          </div>
          {aviso && <div style={sa.avisoBox}><Icon name="alert" size={15} color="var(--amber-ink)" /> {aviso}</div>}

          {/* Días hábiles en tiempo real */}
          {ini && fin && !rangoInvalido && (
            <div style={sa.habilesBox}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={sa.habilesIcon}><Icon name="calendar" size={17} color="var(--blue-600)" /></span>
                <span style={{ fontSize: 13.5, color: "var(--ink-600,var(--ink-700))" }}>Días hábiles solicitados</span>
              </div>
              <span className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{habiles}</span>
            </div>
          )}

          {/* Saldo de vacaciones */}
          {tipo === "vacaciones" && (
            <div style={sa.saldoBox}>
              <div style={sa.saldoCol}><div style={sa.saldoNum} className="tnum">{disponibles}</div><div style={sa.saldoLbl}>Disponibles</div></div>
              <Icon name="chevright" size={16} color="var(--ink-300)" />
              <div style={sa.saldoCol}>
                <div style={{ ...sa.saldoNum, color: restantes < 0 ? "var(--red)" : "var(--green-ink)" }} className="tnum">{restantes}</div>
                <div style={sa.saldoLbl}>Quedarían</div>
              </div>
              {restantes < 0 && <div style={{ flex: 1, fontSize: 12.5, color: "var(--red-ink)", fontWeight: 600, textAlign: "right" }}>No tiene suficientes días disponibles</div>}
            </div>
          )}

          {/* Conflictos con obras */}
          {conflictos.length > 0 && (
            <div style={sa.conflictBox}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13.5, color: "var(--star-orange)" }}>
                <Icon name="alert" size={16} color="var(--star-orange)" /> Conflicto con obras asignadas
              </div>
              {conflictos.map((c) => (
                <div key={c.obraId} style={{ fontSize: 13, color: "var(--ink-700)", marginTop: 6, lineHeight: 1.4 }}>
                  Este empleado está asignado a <strong className="mono">{c.obraId}</strong> · {c.titulo} en estas fechas.
                </div>
              ))}
            </div>
          )}

          {/* Motivo */}
          <div className="field">
            <label>Motivo {motivoReq ? <span style={{ color: "var(--red)" }}>*</span> : <span style={{ color: "var(--ink-400)", fontWeight: 500 }}>(opcional)</span>}</label>
            <textarea className="input" rows={2} style={{ height: "auto", padding: "10px 14px", resize: "vertical", lineHeight: 1.4 }}
              placeholder={tipo === "vacaciones" ? "Ej. Vacaciones familiares" : "Explica el motivo de la ausencia"} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
        </div>

        <div style={sa.foot}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!puedeEnviar} onClick={enviar}><Icon name="send" size={16} /> Solicitar</button>
        </div>
      </div>
    </div>
  );
}

const sa = {
  overlay: { position: "fixed", inset: 0, background: "rgba(20,22,26,.45)", display: "grid", placeItems: "center", zIndex: 85, padding: 20 },
  modal: { width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", background: "var(--surface)", borderRadius: 18, boxShadow: "var(--sh-pop)" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--ink-100)", position: "sticky", top: 0, background: "var(--surface)", zIndex: 2, borderRadius: "18px 18px 0 0" },
  body: { padding: 20, display: "flex", flexDirection: "column", gap: 15 },
  foot: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 18px", borderTop: "1px solid var(--ink-100)", background: "var(--surface-2)", position: "sticky", bottom: 0, borderRadius: "0 0 18px 18px" },
  empFijo: { display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--ink-100)", borderRadius: 11 },
  avatar: { width: 38, height: 38, borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 13, display: "grid", placeItems: "center", flexShrink: 0 },
  tipoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 7 },
  tipoBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 38, padding: "0 8px", borderRadius: 9, border: "1px solid var(--ink-200)", background: "var(--surface)", fontSize: 12.5, fontWeight: 600, color: "var(--ink-500)", cursor: "pointer" },
  avisoBox: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--amber-bg)", border: "1px solid color-mix(in srgb, var(--amber) 30%, transparent)", borderRadius: 10, fontSize: 12.5, color: "var(--amber-ink)", fontWeight: 600 },
  habilesBox: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--blue-50)", border: "1px solid var(--blue-100)", borderRadius: 11 },
  habilesIcon: { width: 34, height: 34, borderRadius: 9, background: "#fff", display: "grid", placeItems: "center" },
  saldoBox: { display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--surface-2)", border: "1px solid var(--ink-100)", borderRadius: 11 },
  saldoCol: { textAlign: "center" },
  saldoNum: { fontSize: 22, fontWeight: 800, lineHeight: 1 },
  saldoLbl: { fontSize: 11.5, color: "var(--ink-400)", fontWeight: 600, marginTop: 3 },
  conflictBox: { padding: "12px 14px", background: "color-mix(in srgb, var(--star-orange) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--star-orange) 35%, transparent)", borderRadius: 11 },
};

window.SolicitarAusencia = SolicitarAusencia;
