/* global React, Icon, USUARIOS, ROLES */
// ============================================================
//  Pantalla · Usuarios (cuentas y permisos · solo dueño)
// ============================================================
const { useState: useStateUs } = React;
const ROL_META = {
  dueno:      { label: "Dueño",      cls: "badge-purple" },
  secretaria: { label: "Secretaria", cls: "badge-blue" },
  supervisor: { label: "Supervisor", cls: "badge-amber" },
  aplicador:  { label: "Aplicador",  cls: "badge-gray" },
};

function Usuarios({ role }) {
  const [users, setUsers] = useStateUs(USUARIOS);
  const [modal, setModal] = useStateUs(false);
  const [editId, setEditId] = useStateUs(null);
  const vacio = () => ({ nombre: "", rol: "aplicador", tel: "", correo: "" });
  const [form, setForm] = useStateUs(vacio);

  if (role !== "dueno") {
    return (
      <div style={{ padding: 40, maxWidth: 1320, margin: "0 auto" }}>
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink-400)" }}>
          <Icon name="shield" size={28} color="var(--ink-300)" />
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-700)", marginTop: 10 }}>Acceso restringido</div>
          <div style={{ marginTop: 6, fontSize: 14 }}>Solo el dueño puede administrar usuarios.</div>
        </div>
      </div>
    );
  }

  function abrirCrear() { setEditId(null); setForm(vacio()); setModal(true); }
  function abrirEditar(u) { setEditId(u.id); setForm({ nombre: u.nombre, rol: u.rol, tel: u.tel, correo: u.correo }); setModal(true); }
  function guardar() {
    if (!form.nombre.trim()) return;
    if (editId) setUsers((arr) => arr.map((u) => u.id === editId ? { ...u, ...form } : u));
    else {
      const id = "U-" + (users.length + 1);
      setUsers((arr) => [...arr, { id, activo: true, ...form }]);
    }
    setModal(false);
  }
  function toggleActivo(u) { setUsers((arr) => arr.map((x) => x.id === u.id ? { ...x, activo: !x.activo } : x)); }

  return (
    <div style={us.page} className="r-page">
      <div style={us.toolbar}>
        <div style={{ fontSize: 13.5, color: "var(--ink-500)" }}>{users.filter((u) => u.activo).length} activos · {users.filter((u) => !u.activo).length} inactivos</div>
        <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={abrirCrear}><Icon name="plus" size={17} /> Nuevo usuario</button>
      </div>

      <div className="card r-tcard" style={{ overflow: "hidden" }}>
        <table style={us.table} className="r-table-lg">
          <thead><tr>
            <th style={us.th}>Usuario</th><th style={us.th}>Rol</th><th style={us.th}>Teléfono</th>
            <th style={us.th}>Correo</th><th style={us.th}>Estado</th><th style={us.th}></th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--ink-100)", opacity: u.activo ? 1 : .55 }}>
                <td style={us.td}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
                    <span style={{ ...us.av, background: u.activo ? "var(--blue-600)" : "var(--ink-300)" }}>{u.nombre.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                    <span style={{ fontWeight: 600 }}>{u.nombre}</span>
                  </span>
                </td>
                <td style={us.td}><span className={"badge " + ROL_META[u.rol].cls}>{ROL_META[u.rol].label}</span></td>
                <td style={{ ...us.td, color: "var(--ink-600)" }} className="tnum">{u.tel || "—"}</td>
                <td style={{ ...us.td, color: "var(--ink-600)" }}>{u.correo || "—"}</td>
                <td style={us.td}>
                  {u.activo ? <span className="badge badge-green"><span className="dot" />Activo</span> : <span className="badge badge-red"><span className="dot" />Inactivo</span>}
                </td>
                <td style={{ ...us.td, textAlign: "right", whiteSpace: "nowrap" }}>
                  <button className="btn btn-quiet btn-sm" onClick={() => abrirEditar(u)}><Icon name="edit" size={15} /> Editar</button>
                  <button className="btn btn-quiet btn-sm" onClick={() => toggleActivo(u)} style={{ color: u.activo ? "var(--red)" : "var(--green-ink)" }}>
                    <Icon name={u.activo ? "eyeoff" : "check"} size={15} /> {u.activo ? "Desactivar" : "Reactivar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={us.overlay} onClick={() => setModal(false)}>
          <div style={us.modal} onClick={(e) => e.stopPropagation()} className="fade-up">
            <div style={us.modalHead}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{editId ? "Editar usuario" : "Nuevo usuario"}</h3>
              <button className="btn btn-icon btn-quiet btn-sm" onClick={() => setModal(false)}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field"><label>Nombre completo</label>
                <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre y apellido" /></div>
              <div className="field"><label>Rol / permisos</label>
                <select className="input" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                  {Object.keys(ROL_META).map((k) => <option key={k} value={k}>{ROL_META[k].label}</option>)}
                </select>
                <span style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 5 }}>El rol define qué módulos puede ver el usuario.</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="r-form2">
                <div className="field"><label>Teléfono</label>
                  <input className="input" value={form.tel} onChange={(e) => setForm({ ...form, tel: e.target.value })} placeholder="809-555-0000" /></div>
                <div className="field"><label>Correo</label>
                  <input className="input" type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} placeholder="Opcional" /></div>
              </div>
            </div>
            <div style={us.modalFoot}>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" disabled={!form.nombre.trim()} onClick={guardar}><Icon name="check" size={16} /> {editId ? "Guardar cambios" : "Crear usuario"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const us = {
  page: { padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 1320, margin: "0 auto" },
  toolbar: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".4px", padding: "12px 16px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)" },
  td: { padding: "12px 16px", fontSize: 14, verticalAlign: "middle" },
  av: { width: 34, height: 34, borderRadius: 9, color: "#fff", fontWeight: 700, fontSize: 12, display: "grid", placeItems: "center", flexShrink: 0 },
  overlay: { position: "fixed", inset: 0, background: "rgba(20,22,26,.45)", display: "grid", placeItems: "center", zIndex: 80, padding: 20 },
  modal: { width: "100%", maxWidth: 480, background: "var(--surface)", borderRadius: 18, boxShadow: "var(--sh-pop)", overflow: "hidden" },
  modalHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--ink-100)" },
  modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 18px", borderTop: "1px solid var(--ink-100)", background: "var(--surface-2)" },
};

window.Usuarios = Usuarios;
