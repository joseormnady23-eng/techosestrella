/* global React, Icon, CUADRILLAS, VEHICULOS, OBRAS, ESTADOS, KlikaData */
// ============================================================
//  Pantalla 8 · Cuadrillas
// ============================================================
const { useState: useStateCr, useEffect: useEffectCr } = React;
const CREW_COLORS = ["var(--star-blue)", "var(--star-green)", "var(--star-purple)", "var(--star-red)", "var(--amber)"];

function mapCuadrilla(c) {
  return {
    id: c.id, nombre: c.nombre ?? "", lider: c.lider?.nombre ?? c.lider ?? "",
    color: CREW_COLORS[(c.id - 1) % CREW_COLORS.length] ?? "var(--star-blue)",
    miembros: (c.miembros ?? []).map((m) => m.nombre ?? m),
    obras: (c.obras ?? []).map((o) => o.codigo ?? String(o.id)),
    vehiculo: c.vehiculo_id ?? null,
  };
}

function Cuadrillas({ onNav, role }) {
  const [crews, setCrews] = useStateCr(CUADRILLAS);
  const [crewModal, setCrewModal] = useStateCr(false);
  const [form, setForm] = useStateCr({ nombre: "", lider: "" });
  const [addTo, setAddTo] = useStateCr(null);
  const [memberName, setMemberName] = useStateCr("");

  useEffectCr(() => {
    if (!window.KlikaData || !KlikaData.conectado()) return;
    KlikaData.cuadrillas.lista().then((res) => {
      const arr = (res.data ?? res).map(mapCuadrilla);
      if (arr.length) setCrews(arr);
    }).catch(() => {});
  }, []);

  async function crearCuadrilla() {
    if (!form.nombre.trim() || !form.lider.trim()) return;
    const tempId = "CU-" + (crews.length + 1);
    const nueva = {
      id: tempId, nombre: form.nombre.trim(), lider: form.lider.trim(),
      color: CREW_COLORS[crews.length % CREW_COLORS.length],
      miembros: [form.lider.trim()], obras: [],
    };
    setCrews((arr) => [...arr, nueva]);
    setForm({ nombre: "", lider: "" });
    setCrewModal(false);
    if (window.KlikaData && KlikaData.conectado()) {
      try {
        const raw = await KlikaData.cuadrillas.crear({ nombre: form.nombre.trim(), lider: form.lider.trim() });
        const creada = mapCuadrilla(raw.data ?? raw);
        setCrews((arr) => arr.map((c) => c.id === tempId ? creada : c));
      } catch (e) { console.error("crearCuadrilla", e); }
    }
  }

  async function agregarMiembro(crewId) {
    if (!memberName.trim()) return;
    setCrews((arr) => arr.map((c) => c.id === crewId ? { ...c, miembros: [...c.miembros, memberName.trim()] } : c));
    setMemberName("");
    setAddTo(null);
    if (window.KlikaData && KlikaData.conectado()) {
      KlikaData.cuadrillas.agregarMiembro(crewId, memberName.trim()).catch(() => {});
    }
  }

  function quitarMiembro(crewId, nombre) {
    setCrews((arr) => arr.map((c) => c.id === crewId ? { ...c, miembros: c.miembros.filter((m) => m !== nombre) } : c));
    if (window.KlikaData && KlikaData.conectado()) {
      KlikaData.cuadrillas.quitarMiembro(crewId, nombre).catch(() => {});
    }
  }

  return (
    <div style={cr.page} className="r-page">
      <div style={cr.grid}>
        {crews.map((cu) => {
          const obras = cu.obras.map((id) => OBRAS.find((o) => o.id === id)).filter(Boolean);
          return (
            <div key={cu.id} className="card" style={cr.card}>
              <div style={{ ...cr.cardTop, background: cu.color }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={cr.crewTag}>{cu.id}</span>
                  <span style={cr.crewCount}>{cu.miembros.length} miembros</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", marginTop: 10 }}>{cu.nombre}</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.8)", marginTop: 2 }}>Líder: {cu.lider}</div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={cr.label}>Miembros</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
                  {cu.miembros.map((m) => (
                    <span key={m} style={cr.member}>
                      <span style={{ ...cr.memberAv, background: cu.color }}>{m.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                      {m}
                      {m !== cu.lider && (
                        <button onClick={() => quitarMiembro(cu.id, m)} style={cr.removeMember} title="Quitar"><Icon name="x" size={12} color="var(--ink-400)" /></button>
                      )}
                    </span>
                  ))}
                  {addTo === cu.id ? (
                    <span style={cr.addRow}>
                      <input autoFocus value={memberName} onChange={(e) => setMemberName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") agregarMiembro(cu.id); if (e.key === "Escape") { setAddTo(null); setMemberName(""); } }}
                        placeholder="Nombre del aplicador" style={cr.addInput} />
                      <button onClick={() => agregarMiembro(cu.id)} style={cr.addOk} title="Agregar"><Icon name="check" size={14} color="#fff" /></button>
                    </span>
                  ) : (
                    <button style={cr.addMember} onClick={() => { setAddTo(cu.id); setMemberName(""); }} title="Agregar miembro"><Icon name="plus" size={15} color="var(--ink-400)" /></button>
                  )}
                </div>
                {(() => {
                  const v = VEHICULOS.find((x) => x.id === cu.vehiculo);
                  return (
                    <div style={cr.vehBox}>
                      <span style={cr.vehIcon}><Icon name="truck" size={17} color={v ? "var(--ink-600)" : "var(--ink-300)"} /></span>
                      {v ? (
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{v.modelo}</div>
                          <div style={{ fontSize: 11.5, color: "var(--ink-400)" }}>{v.tipo} · <span className="mono">{v.placa}</span></div>
                        </div>
                      ) : <div style={{ fontSize: 12.5, color: "var(--ink-400)" }}>Sin vehículo asignado</div>}
                    </div>
                  );
                })()}
                <div style={cr.label}>Obras asignadas</div>
                {obras.length ? obras.map((o) => (
                  <button key={o.id} onClick={() => onNav("obra", o.id)} style={cr.obraRow}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.clienteNom}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-400)" }}><span className="mono">{o.id}</span> · {o.titulo}</div>
                    </div>
                    <span className={"badge " + ESTADOS[o.estado].cls} style={{ height: 22, fontSize: 11 }}>{ESTADOS[o.estado].label}</span>
                  </button>
                )) : <div style={{ fontSize: 13, color: "var(--ink-400)", padding: "6px 0" }}>Disponible · sin obras.</div>}
              </div>
            </div>
          );
        })}
        <button style={cr.addCard} onClick={() => setCrewModal(true)}>
          <span style={cr.addCircle}><Icon name="plus" size={24} color="var(--ink-400)" /></span>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-600)" }}>Nueva cuadrilla</span>
          <span style={{ fontSize: 12.5, color: "var(--ink-400)" }}>Agrupa aplicadores y asígnalos a obras</span>
        </button>
      </div>

      {crewModal && (
        <div style={cr.overlay} onClick={() => setCrewModal(false)}>
          <div style={cr.modal} onClick={(e) => e.stopPropagation()} className="fade-up">
            <div style={cr.modalHead}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Nueva cuadrilla</h3>
              <button className="btn btn-icon btn-quiet btn-sm" onClick={() => setCrewModal(false)}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field"><label>Nombre de la cuadrilla</label>
                <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Cuadrilla D — Pérez" /></div>
              <div className="field"><label>Jefe / líder</label>
                <input className="input" value={form.lider} onChange={(e) => setForm({ ...form, lider: e.target.value })} placeholder="Nombre del jefe de cuadrilla" />
                <span style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 5 }}>El líder se agrega automáticamente como primer miembro.</span>
              </div>
            </div>
            <div style={cr.modalFoot}>
              <button className="btn btn-ghost" onClick={() => setCrewModal(false)}>Cancelar</button>
              <button className="btn btn-primary" disabled={!form.nombre.trim() || !form.lider.trim()} onClick={crearCuadrilla}><Icon name="check" size={16} /> Crear cuadrilla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cr = {
  page: { padding: "20px 28px 40px", maxWidth: 1320, margin: "0 auto" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: 16 },
  card: { padding: 0, overflow: "hidden" },
  cardTop: { padding: "16px 18px" },
  crewTag: { fontSize: 11.5, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,.22)", padding: "3px 9px", borderRadius: 6, fontFamily: "var(--font-mono)" },
  crewCount: { fontSize: 12, color: "rgba(255,255,255,.85)", fontWeight: 600 },
  label: { fontSize: 11.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 9 },
  vehBox: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 11, border: "1px solid var(--ink-100)", background: "var(--surface-2)", marginBottom: 16 },
  vehIcon: { width: 34, height: 34, borderRadius: 9, background: "var(--surface)", border: "1px solid var(--ink-100)", display: "grid", placeItems: "center", flexShrink: 0 },
  member: { display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 8px 4px 4px", borderRadius: 99, background: "var(--surface-2)", border: "1px solid var(--ink-100)", fontSize: 12.5, fontWeight: 500 },
  memberAv: { width: 24, height: 24, borderRadius: "50%", color: "#fff", fontWeight: 700, fontSize: 10, display: "grid", placeItems: "center" },
  removeMember: { width: 18, height: 18, borderRadius: "50%", border: "none", background: "var(--ink-100)", display: "grid", placeItems: "center", cursor: "pointer", marginLeft: 2 },
  addMember: { width: 32, height: 32, borderRadius: "50%", border: "1.5px dashed var(--ink-200)", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer" },
  addRow: { display: "inline-flex", alignItems: "center", gap: 5 },
  addInput: { height: 32, width: 150, border: "1px solid var(--ink-200)", borderRadius: 8, padding: "0 9px", fontSize: 12.5, outline: "none" },
  addOk: { width: 30, height: 30, borderRadius: 8, border: "none", background: "var(--blue-600)", display: "grid", placeItems: "center", cursor: "pointer" },
  obraRow: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 11px", borderRadius: 10, border: "1px solid var(--ink-100)", background: "var(--surface-2)", marginBottom: 7, textAlign: "left" },
  addCard: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 200, borderRadius: 16, border: "2px dashed var(--ink-200)", background: "transparent", cursor: "pointer", padding: 20, textAlign: "center" },
  addCircle: { width: 52, height: 52, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--ink-100)", display: "grid", placeItems: "center", marginBottom: 4 },

  overlay: { position: "fixed", inset: 0, background: "rgba(20,22,26,.45)", display: "grid", placeItems: "center", zIndex: 80, padding: 20 },
  modal: { width: "100%", maxWidth: 460, background: "var(--surface)", borderRadius: 18, boxShadow: "var(--sh-pop)", overflow: "hidden" },
  modalHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--ink-100)" },
  modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 18px", borderTop: "1px solid var(--ink-100)", background: "var(--surface-2)" },
};

window.Cuadrillas = Cuadrillas;
