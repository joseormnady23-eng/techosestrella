/* global React, Icon, money0, useRHStore, CalendarioAusencias, SolicitarAusencia, ROLES */
// ============================================================
//  Pantalla · Recursos Humanos
//  Tabs: Empleados · Calendario de ausencias · Aprobaciones
// ============================================================
const { useState: useStateRH, useEffect: useEffectRH } = React;

function RecursosHumanos({ role }) {
  const store = useRHStore();
  const esGestor = role === "dueno" || role === "secretaria";
  const [tab, setTab] = useStateRH("empleados");

  useEffectRH(() => { store.inicializar(); }, []);
  const [perfil, setPerfil] = useStateRH(null);     // empId del perfil abierto
  const [editar, setEditar] = useStateRH(null);     // empId a editar
  const [solicitar, setSolicitar] = useStateRH(false);
  const [rechazar, setRechazar] = useStateRH(null); // ausencia a rechazar
  const [toast, setToast] = useStateRH(null);

  function flash(msg, tone) { setToast({ msg, tone }); setTimeout(() => setToast(null), 2400); }
  const pendientes = store.pendientes();

  return (
    <div style={rh.page} className="r-page">
      {/* tabs */}
      <div style={rh.tabs}>
        {[["empleados", "Empleados", "crews"], ["calendario", "Calendario de ausencias", "calendar"], ["aprobaciones", "Aprobaciones", "shield"]].map(([k, l, ic]) => (
          <button key={k} onClick={() => { setTab(k); setPerfil(null); }} style={{ ...rh.tab, ...(tab === k ? rh.tabOn : {}) }}>
            <Icon name={ic} size={16} /> {l}
            {k === "aprobaciones" && pendientes.length > 0 && <span style={rh.tabCount}>{pendientes.length}</span>}
          </button>
        ))}
      </div>

      {tab === "empleados" && (perfil
        ? <PerfilEmpleado store={store} empId={perfil} onBack={() => setPerfil(null)} onEditar={() => setEditar(perfil)} esGestor={esGestor} />
        : <ListaEmpleados store={store} onAbrir={setPerfil} />)}

      {tab === "calendario" && <CalendarioAusencias store={store} onNuevaAusencia={() => setSolicitar(true)} />}

      {tab === "aprobaciones" && (
        <Aprobaciones store={store} esGestor={esGestor}
          onAprobar={(id) => { store.aprobar(id); flash("Ausencia aprobada", "ok"); }}
          onRechazar={(a) => setRechazar(a)} onNueva={() => setSolicitar(true)} />
      )}

      {/* modal solicitar */}
      {solicitar && (
        <SolicitarAusencia store={store} onClose={() => setSolicitar(false)}
          onSubmit={(e) => { setSolicitar(false); flash(`Solicitud enviada para ${e.nombre}`, "ok"); }} />
      )}

      {/* modal editar info laboral */}
      {editar && (
        <EditarEmpleado store={store} empId={editar} onClose={() => setEditar(null)}
          onGuardar={(campos) => { store.editarEmpleado(editar, campos); setEditar(null); flash("Información laboral actualizada", "ok"); }} />
      )}

      {/* modal rechazar */}
      {rechazar && (
        <RechazarAusencia store={store} aus={rechazar} onClose={() => setRechazar(null)}
          onRechazar={(motivo) => { store.rechazar(rechazar.id, motivo); setRechazar(null); flash("Ausencia rechazada", "warn"); }} />
      )}

      {toast && (
        <div style={{ ...rh.toast, background: toast.tone === "warn" ? "var(--amber-ink)" : "var(--ink-900)" }} className="fade-up">
          <Icon name={toast.tone === "warn" ? "alert" : "checkcircle"} size={17} color="#fff" /> {toast.msg}
        </div>
      )}
    </div>
  );
}

// ---------- Lista de empleados ----------
function ListaEmpleados({ store, onAbrir }) {
  const emps = store.empleados;
  const activos = emps.filter((e) => e.activo).length;
  return (
    <React.Fragment>
      <div style={rh.summary} className="r-grid4">
        <MiniCard label="Empleados" value={emps.length} icon="crews" color="var(--star-blue)" />
        <MiniCard label="Activos" value={activos} icon="checkcircle" color="var(--star-green)" />
        <MiniCard label="De vacaciones hoy" value={store.deVacacionesHoy().length} icon="sun" color="var(--star-orange)" />
        <MiniCard label="Solicitudes pendientes" value={store.pendientes().length} icon="shield" color="var(--star-purple)" alert />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={rh.table}>
            <thead><tr>
              <th style={rh.th}>Empleado</th><th style={rh.th}>Cargo</th><th style={rh.th}>Ingreso</th>
              <th style={{ ...rh.th, textAlign: "center" }}>Años</th>
              <th style={{ ...rh.th, width: 220 }}>Vacaciones</th><th style={{ ...rh.th, textAlign: "right" }}>Estado</th>
            </tr></thead>
            <tbody>
              {emps.map((e) => {
                const derecho = store.derechoVacaciones(e);
                const tomados = store.vacacionesTomadas(e);
                const disp = store.vacacionesDisponibles(e);
                const pct = derecho > 0 ? Math.min(100, (tomados / derecho) * 100) : 0;
                return (
                  <tr key={e.id} style={rh.row} onClick={() => onAbrir(e.id)}
                    onMouseEnter={(ev) => ev.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={(ev) => ev.currentTarget.style.background = "transparent"}>
                    <td style={rh.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <span style={{ ...rh.avatar, background: e.color, opacity: e.activo ? 1 : .5 }}>{inic(e.nombre)}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{e.nombre}</div>
                          <div style={{ fontSize: 12, color: "var(--ink-400)" }}>{ROLES[e.rol] ? ROLES[e.rol].label : e.rol}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...rh.td, fontSize: 13.5 }}>{e.cargo}</td>
                    <td style={{ ...rh.td, fontSize: 13, color: "var(--ink-500)" }}>{store.fmtFecha(e.ingreso)}</td>
                    <td style={{ ...rh.td, textAlign: "center" }} className="tnum"><span style={{ fontWeight: 700 }}>{store.añosLaborados(e)}</span></td>
                    <td style={rh.td}>
                      {derecho > 0 ? (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                            <span style={{ color: "var(--ink-500)", fontWeight: 600 }} className="tnum">{tomados} de {derecho} días</span>
                            <span style={{ color: disp > 0 ? "var(--green-ink)" : "var(--ink-400)", fontWeight: 700 }} className="tnum">{disp} disp.</span>
                          </div>
                          <div style={rh.vbar}><div style={{ height: "100%", width: pct + "%", background: e.color, borderRadius: 99 }} /></div>
                        </div>
                      ) : <span style={{ fontSize: 12, color: "var(--ink-400)" }}>Menos de 1 año</span>}
                    </td>
                    <td style={{ ...rh.td, textAlign: "right" }}>
                      <span className={"badge " + (e.activo ? "badge-green" : "badge-gray")}><span className="dot" />{e.activo ? "Activo" : "Inactivo"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
  );
}

// ---------- Perfil de empleado ----------
function PerfilEmpleado({ store, empId, onBack, onEditar, esGestor }) {
  const e = store.empleado(empId);
  const derecho = store.derechoVacaciones(e);
  const tomados = store.vacacionesTomadas(e);
  const disp = store.vacacionesDisponibles(e);
  const aus = store.ausenciasDe(empId).sort((a, b) => b.ini.localeCompare(a.ini));
  const info = [
    ["Cargo", e.cargo], ["Rol en el sistema", ROLES[e.rol] ? ROLES[e.rol].label : e.rol],
    ["Tipo de contrato", e.contrato], ["Fecha de ingreso", store.fmtFechaLarga(e.ingreso)],
    ["Años laborados", store.añosLaborados(e) + " años"],
  ];
  if (esGestor) info.push(["Salario mensual", money0(e.salario)]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button className="btn btn-quiet btn-sm" style={{ alignSelf: "flex-start" }} onClick={onBack}><Icon name="chevleft" size={16} /> Volver a empleados</button>

      <div style={rh.profileGrid}>
        {/* tarjeta info */}
        <div className="card" style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
          <div style={rh.profileHead}>
            <span style={{ ...rh.avatarLg, background: e.color, opacity: e.activo ? 1 : .5 }}>{inic(e.nombre)}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px" }}>{e.nombre}</div>
              <div style={{ fontSize: 13.5, color: "var(--ink-400)", marginTop: 2 }}>{e.cargo}</div>
              <span className={"badge " + (e.activo ? "badge-green" : "badge-gray")} style={{ marginTop: 8 }}><span className="dot" />{e.activo ? "Activo" : "Inactivo"}</span>
            </div>
          </div>
          <div style={{ padding: "6px 18px 14px" }}>
            {info.map(([k, v]) => (
              <div key={k} style={rh.infoRow}><span style={{ color: "var(--ink-400)", fontSize: 13 }}>{k}</span><span style={{ fontWeight: 600, fontSize: 13.5, textAlign: "right" }}>{v}</span></div>
            ))}
          </div>
          {esGestor && <div style={{ padding: "0 18px 18px" }}>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={onEditar}><Icon name="edit" size={16} /> Editar info laboral</button>
          </div>}
        </div>

        {/* vacaciones + calendario personal de ausencias */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12 }}>Vacaciones 2026</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
              <div><div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: e.color }} className="tnum">{disp}</div><div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 4, fontWeight: 600 }}>días disponibles</div></div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }} className="tnum">
                  <span style={{ color: "var(--ink-500)", fontWeight: 600 }}>{tomados} tomados</span><span style={{ color: "var(--ink-400)" }}>{derecho} por año</span>
                </div>
                <div style={{ ...rh.vbar, height: 10 }}><div style={{ height: "100%", width: (derecho ? Math.min(100, tomados / derecho * 100) : 0) + "%", background: e.color, borderRadius: 99 }} /></div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={rh.cardHead}><Icon name="calendar" size={16} color="var(--ink-500)" /> Historial de ausencias</div>
            {aus.length === 0 ? <div style={{ padding: 28, textAlign: "center", color: "var(--ink-400)", fontSize: 13.5 }}>Sin ausencias registradas.</div>
              : aus.map((a) => <AusRow key={a.id} store={store} a={a} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function AusRow({ store, a }) {
  const t = store.TIPO_AUSENCIA[a.tipo];
  const est = store.AUSENCIA_ESTADO[a.estado];
  const habiles = store.diasHabiles(a.ini, a.fin);
  return (
    <div style={rh.ausRow}>
      <span style={{ ...rh.ausIcon, background: t.color + "1A" }}><Icon name={t.icon} size={16} color={t.color} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.label} · <span className="tnum" style={{ color: "var(--ink-500)" }}>{habiles} {habiles === 1 ? "día" : "días"}</span></div>
        <div style={{ fontSize: 12.5, color: "var(--ink-400)" }}>{store.fmtFecha(a.ini)} — {store.fmtFecha(a.fin)}{a.motivo ? " · " + a.motivo : ""}</div>
        {a.motivoRechazo && <div style={{ fontSize: 11.5, color: "var(--red-ink)", marginTop: 2 }}>Rechazo: {a.motivoRechazo}</div>}
      </div>
      <span className={"badge " + est.cls}><span className="dot" />{est.label}</span>
    </div>
  );
}

// ---------- Aprobaciones ----------
function Aprobaciones({ store, esGestor, onAprobar, onRechazar, onNueva }) {
  const pend = store.pendientes();
  const resueltas = store.ausencias.filter((a) => a.estado !== "pendiente").sort((a, b) => b.ini.localeCompare(a.ini));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 14, color: "var(--ink-500)" }}>{pend.length} {pend.length === 1 ? "solicitud pendiente" : "solicitudes pendientes"}</div>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={onNueva}><Icon name="plus" size={16} /> Nueva ausencia</button>
      </div>

      {pend.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--ink-400)" }}>
          <Icon name="checkcircle" size={34} color="var(--green)" />
          <div style={{ marginTop: 10, fontWeight: 600, color: "var(--ink-700)" }}>No hay solicitudes pendientes</div>
        </div>
      ) : pend.map((a) => {
        const e = store.empleado(a.empId);
        const t = store.TIPO_AUSENCIA[a.tipo];
        const habiles = store.diasHabiles(a.ini, a.fin);
        const conf = store.conflictos(a.empId, a.ini, a.fin);
        return (
          <div key={a.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 13, flexWrap: "wrap" }}>
              <span style={{ ...rh.avatar, background: e.color }}>{inic(e.nombre)}</span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{e.nombre}</span>
                  <span className={"badge " + t.cls}><span className="dot" />{t.label}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 5 }}>
                  {store.fmtFecha(a.ini)} — {store.fmtFecha(a.fin)} · <strong className="tnum">{habiles}</strong> {habiles === 1 ? "día hábil" : "días hábiles"} · solicitada {a.solicitada}
                </div>
                {a.motivo && <div style={{ fontSize: 13, color: "var(--ink-600,var(--ink-700))", marginTop: 6 }}><span style={{ color: "var(--ink-400)" }}>Motivo:</span> {a.motivo}</div>}
                {conf.length > 0 && (
                  <div style={rh.conflict}>
                    <Icon name="alert" size={15} color="var(--star-orange)" />
                    <span>Conflicto: {e.nombre.split(" ")[0]} está asignado a <strong className="mono">{conf.map((c) => c.obraId).join(", ")}</strong> en estas fechas.</span>
                  </div>
                )}
              </div>
              {esGestor && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="btn btn-sm btn-soft" style={{ color: "var(--green-ink)", background: "var(--green-bg)" }} onClick={() => onAprobar(a.id)}><Icon name="check" size={15} /> Aprobar</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => onRechazar(a)}><Icon name="x" size={15} /> Rechazar</button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {resueltas.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={rh.cardHead}><Icon name="clock" size={16} color="var(--ink-500)" /> Historial de solicitudes</div>
          {resueltas.map((a) => {
            const e = store.empleado(a.empId);
            return (
              <div key={a.id} style={rh.ausRow}>
                <span style={{ ...rh.avatar, width: 34, height: 34, fontSize: 12, background: e.color }}>{inic(e.nombre)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{e.nombre} · {store.TIPO_AUSENCIA[a.tipo].label}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-400)" }}>{store.fmtFecha(a.ini)} — {store.fmtFecha(a.fin)}{a.motivoRechazo ? " · Rechazo: " + a.motivoRechazo : ""}</div>
                </div>
                <span className={"badge " + store.AUSENCIA_ESTADO[a.estado].cls}><span className="dot" />{store.AUSENCIA_ESTADO[a.estado].label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Editar info laboral ----------
function EditarEmpleado({ store, empId, onClose, onGuardar }) {
  const e = store.empleado(empId);
  const [f, setF] = useStateRH({ cargo: e.cargo, salario: e.salario, contrato: e.contrato, ingreso: e.ingreso });
  return (
    <div style={rh.overlay} onClick={onClose}>
      <div style={rh.modal} onClick={(ev) => ev.stopPropagation()} className="fade-up">
        <div style={rh.modalHead}><h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Editar info laboral</h3>
          <button className="btn btn-icon btn-quiet btn-sm" onClick={onClose}><Icon name="x" size={18} /></button></div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13.5, color: "var(--ink-500)" }}><strong>{e.nombre}</strong></div>
          <div className="field"><label>Cargo</label><input className="input" value={f.cargo} onChange={(ev) => setF({ ...f, cargo: ev.target.value })} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field"><label>Salario mensual (RD$)</label><input className="input" type="number" value={f.salario} onChange={(ev) => setF({ ...f, salario: +ev.target.value })} /></div>
            <div className="field"><label>Tipo de contrato</label>
              <select className="input" value={f.contrato} onChange={(ev) => setF({ ...f, contrato: ev.target.value })}>
                {["Indefinido", "Temporal", "Por obra"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select></div>
          </div>
          <div className="field"><label>Fecha de inicio</label><input className="input" type="date" value={f.ingreso} onChange={(ev) => setF({ ...f, ingreso: ev.target.value })} /></div>
        </div>
        <div style={rh.modalFoot}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onGuardar(f)}><Icon name="check" size={16} /> Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Rechazar ausencia (motivo obligatorio) ----------
function RechazarAusencia({ store, aus, onClose, onRechazar }) {
  const [motivo, setMotivo] = useStateRH("");
  const e = store.empleado(aus.empId);
  return (
    <div style={rh.overlay} onClick={onClose}>
      <div style={{ ...rh.modal, maxWidth: 420 }} onClick={(ev) => ev.stopPropagation()} className="fade-up">
        <div style={rh.modalHead}><h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Rechazar ausencia</h3>
          <button className="btn btn-icon btn-quiet btn-sm" onClick={onClose}><Icon name="x" size={18} /></button></div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13.5, color: "var(--ink-500)", lineHeight: 1.45 }}>Solicitud de <strong>{e.nombre}</strong> · {store.TIPO_AUSENCIA[aus.tipo].label} ({store.fmtFecha(aus.ini)} — {store.fmtFecha(aus.fin)}). El motivo le llegará como notificación.</div>
          <div className="field"><label>Motivo del rechazo <span style={{ color: "var(--red)" }}>*</span></label>
            <textarea className="input" rows={3} style={{ height: "auto", padding: "10px 14px", resize: "vertical", lineHeight: 1.4 }}
              placeholder="Ej. Tenemos dos obras grandes esa semana." value={motivo} autoFocus onChange={(ev) => setMotivo(ev.target.value)} /></div>
        </div>
        <div style={rh.modalFoot}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" style={{ background: "var(--red)" }} disabled={!motivo.trim()} onClick={() => onRechazar(motivo.trim())}><Icon name="x" size={16} /> Rechazar</button>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ label, value, icon, color, alert }) {
  return (
    <div className="card" style={{ padding: "15px 16px", display: "flex", alignItems: "center", gap: 13 }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: color + "1A", display: "grid", placeItems: "center" }}><Icon name={icon} size={21} color={color} /></div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, color: alert && value > 0 ? "var(--star-purple)" : "var(--ink-900)" }} className="tnum">{value}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 3, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}
function inic(nombre) { return nombre.split(" ").map((p) => p[0]).slice(0, 2).join(""); }

const rh = {
  page: { padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 1320, margin: "0 auto" },
  tabs: { display: "flex", gap: 4, borderBottom: "1px solid var(--ink-100)" },
  tab: { display: "inline-flex", alignItems: "center", gap: 8, height: 42, padding: "0 16px", border: "none", background: "transparent", color: "var(--ink-500)", fontWeight: 700, fontSize: 14, borderBottom: "2.5px solid transparent", marginBottom: -1 },
  tabOn: { color: "var(--ink-900)", borderBottomColor: "var(--blue-600)" },
  tabCount: { display: "inline-grid", placeItems: "center", minWidth: 20, height: 20, padding: "0 6px", borderRadius: 99, background: "var(--star-purple)", color: "#fff", fontSize: 11.5, fontWeight: 800 },
  summary: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".4px", padding: "12px 14px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)", whiteSpace: "nowrap" },
  row: { borderBottom: "1px solid var(--ink-100)", cursor: "pointer", transition: "background .12s" },
  td: { padding: "12px 14px", fontSize: 14, verticalAlign: "middle" },
  avatar: { width: 40, height: 40, borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 13, display: "grid", placeItems: "center", flexShrink: 0 },
  avatarLg: { width: 60, height: 60, borderRadius: 15, color: "#fff", fontWeight: 800, fontSize: 20, display: "grid", placeItems: "center", flexShrink: 0 },
  vbar: { height: 7, background: "var(--ink-100)", borderRadius: 99, overflow: "hidden" },

  profileGrid: { display: "grid", gridTemplateColumns: "340px 1fr", gap: 16, alignItems: "start" },
  profileHead: { display: "flex", gap: 14, padding: "20px 18px 14px", borderBottom: "1px solid var(--ink-100)" },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--ink-100)" },
  cardHead: { display: "flex", alignItems: "center", gap: 8, padding: "13px 16px", borderBottom: "1px solid var(--ink-100)", fontWeight: 700, fontSize: 14 },
  ausRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--ink-100)" },
  ausIcon: { width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0 },
  conflict: { display: "flex", alignItems: "center", gap: 8, marginTop: 9, padding: "9px 11px", background: "color-mix(in srgb, var(--star-orange) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--star-orange) 35%, transparent)", borderRadius: 9, fontSize: 12.5, color: "var(--ink-700)", lineHeight: 1.4 },

  overlay: { position: "fixed", inset: 0, background: "rgba(20,22,26,.45)", display: "grid", placeItems: "center", zIndex: 85, padding: 20 },
  modal: { width: "100%", maxWidth: 480, background: "var(--surface)", borderRadius: 18, boxShadow: "var(--sh-pop)", overflow: "hidden" },
  modalHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--ink-100)" },
  modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 18px", borderTop: "1px solid var(--ink-100)", background: "var(--surface-2)" },
  toast: { position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 9, padding: "12px 18px", borderRadius: 12, color: "#fff", fontWeight: 600, fontSize: 14, boxShadow: "var(--sh-lg)", zIndex: 90 },
};

window.RecursosHumanos = RecursosHumanos;
