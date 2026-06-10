/* global React, Icon, VEHICULOS, CUADRILLAS */
// ============================================================
//  Pantalla · Vehículos / flota
// ============================================================
const { useState: useStateVe } = React;
const VE_ESTADO = {
  activo: { label: "Activo", cls: "badge-green" },
  taller: { label: "En taller", cls: "badge-amber" },
  baja:   { label: "Dado de baja", cls: "badge-red" },
};
const VE_TIPOS = ["Camioneta", "Camión", "Furgoneta", "Motocicleta", "Otro"];

function Vehiculos({ role }) {
  const [veh, setVeh] = useStateVe(VEHICULOS);
  const [asigns, setAsigns] = useStateVe(() => {
    const m = {};
    CUADRILLAS.forEach((c) => { if (c.vehiculo) m[c.vehiculo] = c.id; });
    return m;
  });
  const [modal, setModal] = useStateVe(false);
  const [editId, setEditId] = useStateVe(null);
  const vacio = () => ({ placa: "", tipo: "Camioneta", modelo: "", estado: "activo" });
  const [form, setForm] = useStateVe(vacio);
  const esDueno = role === "dueno";

  const crewDe = (vId) => CUADRILLAS.find((c) => c.id === asigns[vId]);

  function abrirCrear() { setEditId(null); setForm(vacio()); setModal(true); }
  function abrirEditar(v) { setEditId(v.id); setForm({ placa: v.placa, tipo: v.tipo, modelo: v.modelo, estado: v.estado }); setModal(true); }
  function guardar() {
    if (!form.placa.trim()) return;
    if (editId) setVeh((arr) => arr.map((v) => v.id === editId ? { ...v, ...form } : v));
    else {
      const id = "V-" + String(veh.length + 1).padStart(2, "0");
      setVeh((arr) => [...arr, { id, ...form, placa: form.placa.trim().toUpperCase() }]);
    }
    setModal(false);
  }
  function asignar(vId, crewId) {
    setAsigns((m) => {
      const next = { ...m };
      // un vehículo por cuadrilla: quitar este vehículo de cualquier crew y liberar la crew elegida
      Object.keys(next).forEach((k) => { if (next[k] === crewId) delete next[k]; });
      if (crewId) next[vId] = crewId; else delete next[vId];
      return next;
    });
  }

  return (
    <div style={ve.page} className="r-page">
      <div style={ve.toolbar}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Sum n={veh.filter((v) => v.estado === "activo").length} label="Activos" color="var(--star-green)" />
          <Sum n={veh.filter((v) => v.estado === "taller").length} label="En taller" color="var(--star-orange)" />
          <Sum n={Object.keys(asigns).length} label="Asignados" color="var(--star-blue)" />
        </div>
        {esDueno && <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={abrirCrear}><Icon name="plus" size={17} /> Agregar vehículo</button>}
      </div>

      <div className="card r-tcard" style={{ overflow: "hidden" }}>
        <table style={ve.table} className="r-table">
          <thead><tr>
            <th style={ve.th}>Placa</th><th style={ve.th}>Tipo</th><th style={ve.th}>Modelo</th>
            <th style={ve.th}>Estado</th><th style={ve.th}>Cuadrilla asignada</th>{esDueno && <th style={ve.th}></th>}
          </tr></thead>
          <tbody>
            {veh.map((v) => {
              const crew = crewDe(v.id);
              return (
                <tr key={v.id} style={{ borderBottom: "1px solid var(--ink-100)" }}>
                  <td style={ve.td}><span style={ve.plate}>{v.placa}</span></td>
                  <td style={ve.td}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span style={ve.tIcon}><Icon name="truck" size={16} color="var(--ink-500)" /></span>{v.tipo}
                    </span>
                  </td>
                  <td style={{ ...ve.td, color: "var(--ink-600)" }}>{v.modelo}</td>
                  <td style={ve.td}><span className={"badge " + VE_ESTADO[v.estado].cls}><span className="dot" />{VE_ESTADO[v.estado].label}</span></td>
                  <td style={ve.td}>
                    {esDueno ? (
                      <select value={crew?.id || ""} onChange={(e) => asignar(v.id, e.target.value)} style={ve.select}>
                        <option value="">Sin asignar</option>
                        {CUADRILLAS.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    ) : crew ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 3, background: crew.color }} />{crew.nombre}
                      </span>
                    ) : <span style={{ color: "var(--ink-300)" }}>Sin asignar</span>}
                  </td>
                  {esDueno && <td style={{ ...ve.td, textAlign: "right" }}>
                    <button className="btn btn-quiet btn-sm" onClick={() => abrirEditar(v)}><Icon name="edit" size={15} /> Editar</button>
                  </td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={ve.overlay} onClick={() => setModal(false)}>
          <div style={ve.modal} onClick={(e) => e.stopPropagation()} className="fade-up">
            <div style={ve.modalHead}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{editId ? "Editar vehículo" : "Agregar vehículo"}</h3>
              <button className="btn btn-icon btn-quiet btn-sm" onClick={() => setModal(false)}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="r-form2">
                <div className="field"><label>Placa</label>
                  <input className="input" value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value })} placeholder="A123456" /></div>
                <div className="field"><label>Tipo</label>
                  <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                    {VE_TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select></div>
              </div>
              <div className="field"><label>Modelo</label>
                <input className="input" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} placeholder="Toyota Hilux 2019" /></div>
              <div className="field"><label>Estado</label>
                <select className="input" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                  {Object.keys(VE_ESTADO).map((k) => <option key={k} value={k}>{VE_ESTADO[k].label}</option>)}
                </select></div>
            </div>
            <div style={ve.modalFoot}>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" disabled={!form.placa.trim()} onClick={guardar}><Icon name="check" size={16} /> {editId ? "Guardar" : "Agregar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Sum({ n, label, color }) {
  return (
    <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: color + "1A", display: "grid", placeItems: "center" }}><Icon name="truck" size={20} color={color} /></div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }} className="tnum">{n}</div>
        <div style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 3, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

const ve = {
  page: { padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 1320, margin: "0 auto" },
  toolbar: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".4px", padding: "12px 16px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)" },
  td: { padding: "12px 16px", fontSize: 14, verticalAlign: "middle" },
  plate: { fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13.5, letterSpacing: ".5px", background: "var(--ink-900)", color: "#fff", padding: "5px 11px", borderRadius: 7 },
  tIcon: { width: 30, height: 30, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--ink-100)", display: "grid", placeItems: "center" },
  select: { border: "1px solid var(--ink-200)", borderRadius: 8, height: 36, padding: "0 9px", fontSize: 13, outline: "none", background: "var(--surface)", minWidth: 190 },
  overlay: { position: "fixed", inset: 0, background: "rgba(20,22,26,.45)", display: "grid", placeItems: "center", zIndex: 80, padding: 20 },
  modal: { width: "100%", maxWidth: 480, background: "var(--surface)", borderRadius: 18, boxShadow: "var(--sh-pop)", overflow: "hidden" },
  modalHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--ink-100)" },
  modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 18px", borderTop: "1px solid var(--ink-100)", background: "var(--surface-2)" },
};

window.Vehiculos = Vehiculos;
