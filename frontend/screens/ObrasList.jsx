/* global React, Icon, OBRAS, ESTADOS, CUADRILLAS, CLIENTES, money0 */
// ============================================================
//  Pantalla 3 · Lista de obras
// ============================================================
const { useState: useStateObras } = React;

function ObrasList({ onNav, role }) {
  const [filtro, setFiltro] = useStateObras("todas");
  const [q, setQ] = useStateObras("");
  const [vista, setVista] = useStateObras("tabla"); // tabla | tarjetas
  const [modal, setModal] = useStateObras(false);
  const [tick, setTick] = useStateObras(0);
  const nextCode = "OB-" + (Math.max(...OBRAS.map((o) => +o.id.split("-")[1])) + 1);
  const obraVacia = () => ({ cliente: CLIENTES[0].id, titulo: "", direccion: "", ciudad: "", lat: "", lng: "", inicio: "", fin: "", cuadrilla: "", supervisor: "" });
  const [form, setForm] = useStateObras(obraVacia);
  const esDueno = role === "dueno";

  function crearObra() {
    if (!form.titulo.trim()) return;
    const cli = CLIENTES.find((c) => c.id === form.cliente);
    OBRAS.unshift({
      id: nextCode, cliente: form.cliente, clienteNom: cli?.nombre || "—", titulo: form.titulo.trim(),
      estado: "cotizada", cuadrilla: form.cuadrilla || null, supervisor: form.supervisor.trim(),
      direccion: form.direccion.trim(), ciudad: form.ciudad.trim(),
      lat: form.lat, lng: form.lng, mapa: true,
      inicio: form.inicio || "—", fin: form.fin || "—", avance: 0, total: 0,
      secciones: [{ nombre: "Sección 1", m2: 0, cond: "bueno", manos: 2 }],
    });
    setForm(obraVacia());
    setModal(false);
    setTick((t) => t + 1);
    onNav("obra", nextCode);
  }

  const counts = OBRAS.reduce((a, o) => { a[o.estado] = (a[o.estado] || 0) + 1; return a; }, {});
  const filtros = [
    { k: "todas", label: "Todas", n: OBRAS.length },
    { k: "proceso", label: "En proceso", n: counts.proceso || 0 },
    { k: "aprobada", label: "Aprobadas", n: counts.aprobada || 0 },
    { k: "cotizada", label: "Cotizadas", n: counts.cotizada || 0 },
    { k: "pausada", label: "Pausadas", n: counts.pausada || 0 },
    { k: "terminada", label: "Terminadas", n: counts.terminada || 0 },
  ];

  let lista = OBRAS.filter((o) => filtro === "todas" || o.estado === filtro);
  if (q) lista = lista.filter((o) => (o.titulo + o.clienteNom + o.id).toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={ob.page} className="r-page">
      {/* Barra de filtros */}
      <div style={ob.toolbar}>
        <div style={ob.chips}>
          {filtros.map((f) => (
            <button key={f.k} className={"chip" + (filtro === f.k ? " active" : "")} onClick={() => setFiltro(f.k)}>
              {f.label} <span style={{ opacity: .6 }}>{f.n}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 9, marginLeft: "auto" }}>
          <div style={ob.search}>
            <Icon name="search" size={16} color="var(--ink-400)" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" style={ob.searchInput} />
          </div>
          <div style={ob.segmented}>
            <button onClick={() => setVista("tabla")} style={{ ...ob.segBtn, ...(vista === "tabla" ? ob.segOn : {}) }} title="Tabla"><Icon name="list" size={17} /></button>
            <button onClick={() => setVista("tarjetas")} style={{ ...ob.segBtn, ...(vista === "tarjetas" ? ob.segOn : {}) }} title="Tarjetas"><Icon name="grid" size={17} /></button>
          </div>
          <button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="plus" size={17} /> Nueva obra</button>
        </div>
      </div>

      {vista === "tabla" ? (
        <div className="card r-tcard" style={{ overflow: "hidden" }}>
          <table style={ob.table} className="r-table-lg">
            <thead>
              <tr>
                <th style={ob.th}>Código</th>
                <th style={ob.th}>Cliente / Obra</th>
                <th style={ob.th}>Estado</th>
                <th style={ob.th}>Cuadrilla</th>
                <th style={ob.th}>Fechas</th>
                <th style={ob.th}>Avance</th>
                {esDueno && <th style={{ ...ob.th, textAlign: "right" }}>Monto</th>}
                <th style={ob.th}></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((o) => {
                const cu = CUADRILLAS.find((c) => c.id === o.cuadrilla);
                return (
                  <tr key={o.id} style={ob.tr} onClick={() => onNav("obra", o.id)}
                    onMouseEnter={(e)=>e.currentTarget.style.background="var(--surface-2)"}
                    onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
                    <td style={ob.td}><span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>{o.id}</span></td>
                    <td style={ob.td}>
                      <div style={{ fontWeight: 600 }}>{o.clienteNom}</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 1 }}>{o.titulo}</div>
                    </td>
                    <td style={ob.td}><span className={"badge " + ESTADOS[o.estado].cls}><span className="dot" />{ESTADOS[o.estado].label}</span></td>
                    <td style={ob.td}>
                      {cu ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 3, background: cu.color }} />
                          {cu.nombre.split("—")[1]?.trim() || cu.nombre}
                        </span>
                      ) : <span style={{ color: "var(--ink-300)", fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ ...ob.td, fontSize: 13, color: "var(--ink-500)" }} className="tnum">{o.inicio} – {o.fin}</td>
                    <td style={ob.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={ob.prog}><div style={{ height: "100%", width: o.avance + "%", background: o.avance === 100 ? "var(--green)" : "var(--blue-600)", borderRadius: 99 }} /></div>
                        <span style={{ fontSize: 12, color: "var(--ink-500)", width: 30 }} className="tnum">{o.avance}%</span>
                      </div>
                    </td>
                    {esDueno && <td style={{ ...ob.td, textAlign: "right", fontWeight: 700, fontSize: 13.5 }}>{money0(o.total)}</td>}
                    <td style={{ ...ob.td, textAlign: "right" }}><Icon name="chevright" size={16} color="var(--ink-300)" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={ob.cards}>
          {lista.map((o) => {
            const cu = CUADRILLAS.find((c) => c.id === o.cuadrilla);
            return (
              <button key={o.id} className="card" style={ob.cardItem} onClick={() => onNav("obra", o.id)}
                onMouseEnter={(e)=>e.currentTarget.style.boxShadow="var(--sh-md)"}
                onMouseLeave={(e)=>e.currentTarget.style.boxShadow="var(--sh-sm)"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span className="mono" style={{ fontWeight: 600, fontSize: 12.5, color: "var(--ink-400)" }}>{o.id}</span>
                  <span className={"badge " + ESTADOS[o.estado].cls}><span className="dot" />{ESTADOS[o.estado].label}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15.5, marginTop: 10, textAlign: "left" }}>{o.clienteNom}</div>
                <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 3, textAlign: "left" }}>{o.titulo}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 14, fontSize: 12.5, color: "var(--ink-400)" }}>
                  <Icon name="calendar" size={14} /> {o.inicio} – {o.fin}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                  <div style={{ ...ob.prog, flex: 1 }}><div style={{ height: "100%", width: o.avance + "%", background: o.avance === 100 ? "var(--green)" : "var(--blue-600)", borderRadius: 99 }} /></div>
                  <span style={{ fontSize: 12, color: "var(--ink-500)" }} className="tnum">{o.avance}%</span>
                </div>
                {cu && <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12, fontSize: 12.5, color: "var(--ink-600)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: cu.color }} /> {cu.nombre}
                </div>}
              </button>
            );
          })}
        </div>
      )}

      {modal && (
        <div style={ob.overlay} onClick={() => setModal(false)}>
          <div style={ob.modal} onClick={(e) => e.stopPropagation()} className="fade-up">
            <div style={ob.modalHead}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Nueva obra</h3>
                <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 2 }}>Código <span className="mono" style={{ fontWeight: 700, color: "var(--blue-700)" }}>{nextCode}</span> · generado automáticamente</div>
              </div>
              <button className="btn btn-icon btn-quiet btn-sm" onClick={() => setModal(false)}><Icon name="x" size={18} /></button>
            </div>
            <div style={ob.modalBody}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="r-form2">
                <div className="field"><label>Cliente</label>
                  <select className="input" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })}>
                    {CLIENTES.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="field"><label>Supervisor</label>
                  <input className="input" placeholder="Nombre del supervisor" value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} /></div>
              </div>
              <div className="field"><label>Título de la obra</label>
                <input className="input" placeholder="Ej. Impermeabilización azotea principal" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }} className="r-form21">
                <div className="field"><label>Dirección</label>
                  <input className="input" placeholder="Calle, número, sector" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></div>
                <div className="field"><label>Ciudad</label>
                  <input className="input" placeholder="Santiago" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="r-form2">
                <div className="field"><label>Latitud</label>
                  <input className="input" placeholder="19.4517" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} /></div>
                <div className="field"><label>Longitud</label>
                  <input className="input" placeholder="-70.6970" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="r-form2">
                <div className="field"><label>Inicio estimado</label>
                  <input className="input" placeholder="03 jun" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} /></div>
                <div className="field"><label>Fin estimado</label>
                  <input className="input" placeholder="08 jun" value={form.fin} onChange={(e) => setForm({ ...form, fin: e.target.value })} /></div>
              </div>
              <div className="field"><label>Cuadrilla asignada</label>
                <select className="input" value={form.cuadrilla} onChange={(e) => setForm({ ...form, cuadrilla: e.target.value })}>
                  <option value="">Sin asignar</option>
                  {CUADRILLAS.map((cu) => <option key={cu.id} value={cu.id}>{cu.nombre}</option>)}
                </select>
              </div>
            </div>
            <div style={ob.modalFoot}>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" disabled={!form.titulo.trim()} onClick={crearObra}><Icon name="check" size={16} /> Crear obra</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ob = {
  page: { padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 1320, margin: "0 auto" },
  toolbar: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  chips: { display: "flex", gap: 8, flexWrap: "wrap" },
  search: { display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 12px", background: "var(--surface)",
    border: "1px solid var(--ink-200)", borderRadius: 9, width: 220 },
  searchInput: { border: "none", background: "transparent", outline: "none", fontSize: 13.5, flex: 1 },
  segmented: { display: "flex", gap: 3, padding: 3, background: "var(--surface)", border: "1px solid var(--ink-200)", borderRadius: 9 },
  segBtn: { width: 34, height: 30, borderRadius: 6, border: "none", background: "transparent", color: "var(--ink-400)", display: "grid", placeItems: "center" },
  segOn: { background: "var(--ink-900)", color: "#fff" },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 11.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase",
    letterSpacing: ".5px", padding: "13px 16px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)" },
  tr: { cursor: "pointer", transition: "background .12s" },
  td: { padding: "13px 16px", borderBottom: "1px solid var(--ink-100)", fontSize: 14, verticalAlign: "middle" },
  prog: { width: 70, height: 6, background: "var(--ink-100)", borderRadius: 99, overflow: "hidden" },

  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 },
  cardItem: { padding: 18, textAlign: "left", border: "1px solid var(--ink-100)", cursor: "pointer", background: "var(--surface)", transition: "box-shadow .14s" },

  overlay: { position: "fixed", inset: 0, background: "rgba(20,22,26,.45)", display: "grid", placeItems: "center", zIndex: 80, padding: 20 },
  modal: { width: "100%", maxWidth: 560, background: "var(--surface)", borderRadius: 18, boxShadow: "var(--sh-pop)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" },
  modalHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--ink-100)" },
  modalBody: { padding: 20, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" },
  modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 18px", borderTop: "1px solid var(--ink-100)", background: "var(--surface-2)" },
};

window.ObrasList = ObrasList;
