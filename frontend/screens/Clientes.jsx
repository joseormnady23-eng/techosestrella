/* global React, Icon, CLIENTES, OBRAS, ESTADOS, money0 */
// ============================================================
//  Pantalla 9 · Clientes (CRM)
// ============================================================
const { useState: useStateCl } = React;

function Clientes({ onNav, role }) {
  const [clientes, setClientes] = useStateCl(() => CLIENTES.map((c) => ({
    activo: true, tipoPersona: "Persona", telAlt: "", direccion: c.sector, ciudad: "", rnc: "", notas: "", ...c,
  })));
  const [sel, setSel] = useStateCl(CLIENTES[0].id);
  const [q, setQ] = useStateCl("");
  const [modal, setModal] = useStateCl(false);
  const [editId, setEditId] = useStateCl(null); // null = crear
  const formVacio = () => ({ nombre: "", contacto: "", tipoPersona: "Persona", tipo: "Residencial", tel: "", telAlt: "", correo: "", direccion: "", ciudad: "", sector: "", rnc: "", notas: "" });
  const [form, setForm] = useStateCl(formVacio);
  const cliente = clientes.find((c) => c.id === sel);
  const lista = clientes.filter((c) => (c.nombre + c.contacto + (c.sector || "")).toLowerCase().includes(q.toLowerCase()));
  const obrasCli = OBRAS.filter((o) => o.cliente === sel);
  const tipoColor = { Residencial: "badge-blue", Comercial: "badge-purple", Institucional: "badge-amber" };

  function abrirCrear() { setEditId(null); setForm(formVacio()); setModal(true); }
  function abrirEditar(c) {
    setEditId(c.id);
    setForm({ nombre: c.nombre, contacto: c.contacto, tipoPersona: c.tipoPersona || "Persona", tipo: c.tipo, tel: c.tel, telAlt: c.telAlt || "", correo: c.correo, direccion: c.direccion || "", ciudad: c.ciudad || "", sector: c.sector || "", rnc: c.rnc || "", notas: c.notas || "" });
    setModal(true);
  }
  function guardar() {
    if (!form.nombre.trim()) return;
    if (editId) {
      setClientes((arr) => arr.map((c) => c.id === editId ? { ...c, ...form } : c));
    } else {
      const id = "C-" + (Math.max(...clientes.map((c) => +c.id.split("-")[1])) + 1);
      setClientes((arr) => [...arr, { id, activo: true, desde: "2026", obras: 0, ...form, sector: form.sector || form.ciudad }]);
      setSel(id);
    }
    setModal(false);
  }
  function toggleActivo(c) { setClientes((arr) => arr.map((x) => x.id === c.id ? { ...x, activo: !x.activo } : x)); }

  return (
    <div style={cl.page} className="r-page r-main">
      {/* lista */}
      <aside className="card r-clist" style={cl.list}>
        <div style={{ padding: 11 }}>
          <div style={cl.search}>
            <Icon name="search" size={16} color="var(--ink-400)" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente…" style={cl.searchInput} />
          </div>
          <button className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 9 }} onClick={abrirCrear}><Icon name="plus" size={16} /> Nuevo cliente</button>
        </div>
        <div style={{ overflowY: "auto" }}>
          {lista.map((c) => (
            <button key={c.id} onClick={() => setSel(c.id)} style={{ ...cl.listItem, ...(sel === c.id ? cl.listItemOn : {}), opacity: c.activo ? 1 : .5 }}>
              <span style={{ ...cl.av, background: sel === c.id ? "var(--blue-600)" : "var(--ink-300)" }}>{c.contacto.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
              <span style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nombre}</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--ink-400)" }}>{c.activo ? c.sector : "Inactivo"}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* detalle */}
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <span style={cl.bigAv}>{cliente.contacto.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{cliente.nombre}</h3>
                <span className={"badge " + tipoColor[cliente.tipo]}>{cliente.tipo}</span>
                <span className="badge badge-gray">{cliente.tipoPersona || "Persona"}</span>
                {!cliente.activo && <span className="badge badge-red">Inactivo</span>}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--ink-500)", marginTop: 4 }}>Contacto: {cliente.contacto} · Cliente desde {cliente.desde}</div>
              <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
                <a className="btn btn-ghost btn-sm" href="#" onClick={(e)=>e.preventDefault()}><Icon name="phone" size={15} /> {cliente.tel}</a>
                <a className="btn btn-ghost btn-sm" href="#" onClick={(e)=>e.preventDefault()}><Icon name="whatsapp" size={15} /> WhatsApp</a>
                <a className="btn btn-ghost btn-sm" href="#" onClick={(e)=>e.preventDefault()}><Icon name="mail" size={15} /> {cliente.correo}</a>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(cliente)}><Icon name="edit" size={15} /> Editar</button>
              <button className="btn btn-ghost btn-sm" onClick={() => toggleActivo(cliente)} style={{ color: cliente.activo ? "var(--red)" : "var(--green-ink)" }}>
                <Icon name={cliente.activo ? "eyeoff" : "check"} size={15} /> {cliente.activo ? "Desactivar" : "Reactivar"}
              </button>
            </div>
          </div>
          <div style={cl.infoGrid}>
            <InfoCell label="Teléfono alterno" value={cliente.telAlt || "—"} />
            <InfoCell label="RNC / Cédula" value={cliente.rnc || "—"} />
            <InfoCell label="Dirección" value={cliente.direccion || "—"} />
            <InfoCell label="Ciudad" value={cliente.ciudad || "—"} />
          </div>
          {cliente.notas && <div style={cl.notas}><span style={{ fontWeight: 700, color: "var(--ink-600)" }}>Notas: </span>{cliente.notas}</div>}
        </div>

        {/* stats del cliente */}
        <div style={cl.stats} className="r-grid3">
          <MiniStat label="Obras totales" value={obrasCli.length} />
          <MiniStat label="En curso" value={obrasCli.filter((o) => ["proceso", "aprobada", "pausada"].includes(o.estado)).length} />
          {role === "dueno" && <MiniStat label="Facturado histórico" value={money0(obrasCli.filter((o) => o.estado === "terminada").reduce((a, o) => a + o.total, 0))} wide />}
        </div>

        {/* historial de obras */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={cl.histHead}><Icon name="roof" size={16} color="var(--ink-500)" /> Historial de obras</div>
          {obrasCli.map((o) => (
            <button key={o.id} onClick={() => onNav("obra", o.id)} style={cl.obraRow}>
              <span className="mono" style={{ fontSize: 12.5, color: "var(--ink-400)", width: 64 }}>{o.id}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{o.titulo}</div>
                <div style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 1 }} className="tnum">{o.inicio} – {o.fin}</div>
              </div>
              {role === "dueno" && <span style={{ fontWeight: 700, fontSize: 13.5 }}>{money0(o.total)}</span>}
              <span className={"badge " + ESTADOS[o.estado].cls}><span className="dot" />{ESTADOS[o.estado].label}</span>
              <Icon name="chevright" size={15} color="var(--ink-300)" />
            </button>
          ))}
        </div>
      </div>

      {modal && (
        <div style={cl.overlay} onClick={() => setModal(false)}>
          <div style={cl.modal} onClick={(e) => e.stopPropagation()} className="fade-up">
            <div style={cl.modalHead}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{editId ? "Editar cliente" : "Nuevo cliente"}</h3>
              <button className="btn btn-icon btn-quiet btn-sm" onClick={() => setModal(false)}><Icon name="x" size={18} /></button>
            </div>
            <div style={cl.modalBody}>
              <div className="field"><label>Nombre / razón social</label>
                <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Villa Olga · Familia Reyes" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="r-form2">
                <div className="field"><label>Persona de contacto</label>
                  <input className="input" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="Ana Reyes" /></div>
                <div className="field"><label>Tipo</label>
                  <div style={cl.seg}>
                    {["Persona", "Empresa"].map((t) => (
                      <button key={t} onClick={() => setForm({ ...form, tipoPersona: t })} style={{ ...cl.segBtn, ...(form.tipoPersona === t ? cl.segOn : {}) }}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="r-form2">
                <div className="field"><label>Teléfono</label>
                  <input className="input" value={form.tel} onChange={(e) => setForm({ ...form, tel: e.target.value })} placeholder="809-555-0142" /></div>
                <div className="field"><label>Teléfono alterno</label>
                  <input className="input" value={form.telAlt} onChange={(e) => setForm({ ...form, telAlt: e.target.value })} placeholder="Opcional" /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="r-form2">
                <div className="field"><label>Correo</label>
                  <input className="input" type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} placeholder="correo@ejemplo.com" /></div>
                <div className="field"><label>RNC / Cédula</label>
                  <input className="input" value={form.rnc} onChange={(e) => setForm({ ...form, rnc: e.target.value })} placeholder="001-0000000-0" /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }} className="r-form21">
                <div className="field"><label>Dirección</label>
                  <input className="input" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Calle, número, sector" /></div>
                <div className="field"><label>Ciudad</label>
                  <input className="input" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} placeholder="Santiago" /></div>
              </div>
              <div className="field"><label>Categoría</label>
                <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  {["Residencial", "Comercial", "Institucional"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field"><label>Notas</label>
                <textarea className="input" rows={3} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Observaciones, preferencias de contacto…" style={{ resize: "vertical", paddingTop: 9 }} /></div>
            </div>
            <div style={cl.modalFoot}>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" disabled={!form.nombre.trim()} onClick={guardar}><Icon name="check" size={16} /> {editId ? "Guardar cambios" : "Crear cliente"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--ink-400)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13.5, marginTop: 3 }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, wide }) {
  return (
    <div className="card" style={{ padding: "14px 16px", gridColumn: wide ? "span 1" : "auto" }}>
      <div style={{ fontSize: 12, color: "var(--ink-400)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }} className="tnum">{value}</div>
    </div>
  );
}

const cl = {
  page: { padding: "20px 28px 40px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 18, maxWidth: 1320, margin: "0 auto", alignItems: "start" },
  list: { padding: 0, overflow: "hidden", position: "sticky", top: 20, maxHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column" },
  search: { display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 12px", background: "var(--bg)", border: "1px solid var(--ink-100)", borderRadius: 9 },
  searchInput: { border: "none", background: "transparent", outline: "none", fontSize: 13.5, flex: 1 },
  listItem: { display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px 12px", border: "none", borderLeft: "3px solid transparent", background: "transparent", textAlign: "left" },
  listItemOn: { background: "var(--blue-50)", borderLeftColor: "var(--blue-600)" },
  av: { width: 36, height: 36, borderRadius: 9, color: "#fff", fontWeight: 700, fontSize: 12.5, display: "grid", placeItems: "center", flexShrink: 0 },
  bigAv: { width: 60, height: 60, borderRadius: 15, background: "var(--purple)", color: "#fff", fontWeight: 800, fontSize: 20, display: "grid", placeItems: "center", flexShrink: 0 },
  stats: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 },
  histHead: { display: "flex", alignItems: "center", gap: 8, padding: "14px 16px", borderBottom: "1px solid var(--ink-100)", fontWeight: 700, fontSize: 14 },
  obraRow: { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 16px", border: "none", borderBottom: "1px solid var(--ink-100)", background: "transparent", textAlign: "left" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--ink-100)" },
  notas: { marginTop: 14, fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-600)", background: "var(--surface-2)", borderRadius: 10, padding: "11px 13px" },
  seg: { display: "flex", gap: 4, padding: 4, background: "var(--bg)", borderRadius: 9, height: 42 },
  segBtn: { flex: 1, border: "none", background: "transparent", borderRadius: 6, fontWeight: 600, fontSize: 13, color: "var(--ink-500)", cursor: "pointer" },
  segOn: { background: "var(--surface)", color: "var(--ink-900)", boxShadow: "var(--sh-sm)" },
  overlay: { position: "fixed", inset: 0, background: "rgba(20,22,26,.45)", display: "grid", placeItems: "center", zIndex: 80, padding: 20 },
  modal: { width: "100%", maxWidth: 560, background: "var(--surface)", borderRadius: 18, boxShadow: "var(--sh-pop)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" },
  modalHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--ink-100)" },
  modalBody: { padding: 20, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" },
  modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 18px", borderTop: "1px solid var(--ink-100)", background: "var(--surface-2)" },
};

window.Clientes = Clientes;
