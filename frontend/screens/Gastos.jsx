/* global React, Icon, GASTOS, GASTO_CAT, TIPO_NCF, METODOS_PAGO, OBRAS, money, money0 */
// ============================================================
//  CONTABILIDAD · Gastos (compras / 606)
// ============================================================
const { useState: useStateG } = React;

function Gastos({ role }) {
  const [gastos, setGastos] = useStateG(() => window.GASTOS.map((g) => ({ ...g })));
  const [open, setOpen] = useStateG(false);
  const [fCat, setFCat] = useStateG("todas");

  const visibles = gastos.filter((g) => fCat === "todas" || g.categoria === fCat);
  const totMonto = visibles.reduce((a, g) => a + g.monto, 0);
  const totItbis = visibles.reduce((a, g) => a + g.itbis, 0);

  function addGasto(g) { setGastos((arr) => [g, ...arr]); setOpen(false); }

  return (
    <div style={gs.page} className="r-page">
      {/* Resumen */}
      <div style={gs.summary} className="r-grid3">
        <GastoResumenCard label="Gastos del periodo" value={money0(totMonto)} icon="wallet" color="var(--star-red)" />
        <GastoResumenCard label="ITBIS pagado (adelantado)" value={money0(totItbis)} icon="money" color="var(--star-blue)" />
        <GastoResumenCard label="Comprobantes" value={String(visibles.length)} icon="receipt" color="var(--star-purple)" />
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <select className="input input-sm" value={fCat} onChange={(e) => setFCat(e.target.value)} style={{ width: "auto", minWidth: 200 }}>
          <option value="todas">Todas las categorías</option>
          {window.GASTO_CAT.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => setOpen(true)}><Icon name="plus" size={16} /> Registrar gasto</button>
      </div>

      {/* Tabla */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={gs.table}>
            <thead>
              <tr>
                <th style={gs.th}>Fecha</th>
                <th style={gs.th}>Proveedor</th>
                <th style={gs.th}>Descripción</th>
                <th style={gs.th}>Categoría</th>
                <th style={{ ...gs.th, textAlign: "right" }}>Monto</th>
                <th style={{ ...gs.th, textAlign: "right" }}>ITBIS</th>
                <th style={gs.th}>NCF proveedor</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((g) => (
                <tr key={g.id} style={{ borderBottom: "1px solid var(--ink-100)" }}>
                  <td style={{ ...gs.td, color: "var(--ink-500)", whiteSpace: "nowrap" }}>{g.fecha}</td>
                  <td style={gs.td}>
                    <div style={{ fontWeight: 600 }}>{g.proveedor}</div>
                    {g.rncProv && <div style={{ fontSize: 11.5, color: "var(--ink-400)" }} className="mono">RNC {g.rncProv}</div>}
                  </td>
                  <td style={{ ...gs.td, maxWidth: 240 }}>{g.descripcion}</td>
                  <td style={gs.td}><span style={gs.catChip}>{g.categoria}</span></td>
                  <td style={{ ...gs.td, textAlign: "right", fontWeight: 700 }} className="tnum">{money0(g.monto)}</td>
                  <td style={{ ...gs.td, textAlign: "right", color: "var(--ink-500)" }} className="tnum">{g.itbis ? money0(g.itbis) : "—"}</td>
                  <td style={gs.td}>
                    {g.ncfProv ? <span className="mono" style={{ fontSize: 12 }}>{g.ncfProv} <span className={"badge " + TIPO_NCF[g.tipoNcf].cls} style={{ height: 18, fontSize: 10, marginLeft: 4 }}>{TIPO_NCF[g.tipoNcf].short}</span></span>
                      : <span style={{ fontSize: 12, color: "var(--ink-400)" }}>Sin comprobante</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--surface-2)" }}>
                <td style={{ ...gs.td, fontWeight: 700 }} colSpan={4}>Total · {visibles.length} gastos</td>
                <td style={{ ...gs.td, textAlign: "right", fontWeight: 800 }} className="tnum">{money0(totMonto)}</td>
                <td style={{ ...gs.td, textAlign: "right", fontWeight: 700, color: "var(--blue-700)" }} className="tnum">{money0(totItbis)}</td>
                <td style={gs.td}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {open && <GastoModal onClose={() => setOpen(false)} onSave={addGasto} />}
    </div>
  );
}

function GastoResumenCard({ label, value, icon, color }) {
  return (
    <div className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ width: 42, height: 42, borderRadius: 11, background: color + "1A", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={icon} size={21} color={color} /></span>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.5px" }} className="tnum">{value}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 1 }}>{label}</div>
      </div>
    </div>
  );
}

// ---- Modal: registrar gasto ----
function GastoModal({ onClose, onSave }) {
  const [categoria, setCategoria] = useStateG(window.GASTO_CAT[0]);
  const [descripcion, setDescripcion] = useStateG("");
  const [monto, setMonto] = useStateG(0);
  const [itbis, setItbis] = useStateG(0);
  const [proveedor, setProveedor] = useStateG("");
  const [rncProv, setRncProv] = useStateG("");
  const [ncfProv, setNcfProv] = useStateG("");
  const [tipoNcf, setTipoNcf] = useStateG("B01");
  const [metodo, setMetodo] = useStateG(window.METODOS_PAGO[0]);
  const [obraId, setObraId] = useStateG("");
  const [recibo, setRecibo] = useStateG(false);

  const puede = proveedor.trim() && descripcion.trim() && monto > 0;
  function autoItbis() { setItbis(Math.round(monto * 0.18 / 1.18)); }

  function save() {
    onSave({
      id: "G-" + Math.floor(142 + Math.random() * 90), fecha: "01 jun 2026", fechaISO: "2026-06-01",
      proveedor: proveedor.trim(), rncProv: rncProv.trim(), descripcion: descripcion.trim(), categoria,
      monto, itbis, ncfProv: ncfProv.trim(), tipoNcf, metodo, obraId: obraId || null, recibo,
    });
  }

  return (
    <div style={gs.scrim} onClick={onClose}>
      <div className="card fade-up" style={{ width: "min(580px,100%)", padding: 20, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Registrar gasto</h3>
          <button onClick={onClose} style={gs.xBtn}><Icon name="x" size={18} color="var(--ink-400)" /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }} className="r-form2">
          <div className="field" style={{ gridColumn: "1 / -1" }}><label>Categoría</label>
            <select className="input input-sm" value={categoria} onChange={(e) => setCategoria(e.target.value)}>{window.GASTO_CAT.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}><label>Descripción</label>
            <input className="input input-sm" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. Compra de cubetas de membrana" /></div>
          <div className="field"><label>Monto (con ITBIS)</label><input type="number" min="0" className="input input-sm" value={monto} onChange={(e) => setMonto(+e.target.value)} onBlur={() => { if (monto && !itbis) autoItbis(); }} /></div>
          <div className="field"><label>ITBIS pagado</label>
            <div style={{ display: "flex", gap: 7 }}>
              <input type="number" min="0" className="input input-sm" value={itbis} onChange={(e) => setItbis(+e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-ghost btn-sm" onClick={autoItbis} title="Calcular 18% sobre el monto">18%</button>
            </div>
          </div>
          <div className="field"><label>Proveedor</label><input className="input input-sm" value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Razón social" /></div>
          <div className="field"><label>RNC proveedor</label><input className="input input-sm" value={rncProv} onChange={(e) => setRncProv(e.target.value)} placeholder="1-31-00000-0" /></div>
          <div className="field"><label>NCF del proveedor</label><input className="input input-sm" value={ncfProv} onChange={(e) => setNcfProv(e.target.value)} placeholder="B0100000000" /></div>
          <div className="field"><label>Tipo NCF</label>
            <select className="input input-sm" value={tipoNcf} onChange={(e) => setTipoNcf(e.target.value)}>{Object.entries(TIPO_NCF).map(([k, v]) => <option key={k} value={k}>{v.short} · {v.label}</option>)}</select>
          </div>
          <div className="field"><label>Método de pago</label>
            <select className="input input-sm" value={metodo} onChange={(e) => setMetodo(e.target.value)}>{window.METODOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          </div>
          <div className="field"><label>Obra asociada <span style={{ color: "var(--ink-400)", fontWeight: 500 }}>· opcional</span></label>
            <select className="input input-sm" value={obraId} onChange={(e) => setObraId(e.target.value)}>
              <option value="">Sin obra</option>
              {window.OBRAS.map((o) => <option key={o.id} value={o.id}>{o.id} · {o.clienteNom}</option>)}
            </select>
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}><label>Foto del recibo <span style={{ color: "var(--ink-400)", fontWeight: 500 }}>· opcional</span></label>
            <button onClick={() => setRecibo((v) => !v)} style={{ ...gs.upload, ...(recibo ? gs.uploadOn : {}) }}>
              <Icon name={recibo ? "checkcircle" : "camera"} size={20} color={recibo ? "var(--green)" : "var(--ink-400)"} />
              <span style={{ fontSize: 13, fontWeight: 600, color: recibo ? "var(--green-ink)" : "var(--ink-500)" }}>{recibo ? "recibo_gasto.jpg adjuntado" : "Subir o tomar foto del recibo"}</span>
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 9, marginTop: 18 }}>
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={!puede} onClick={save}>Guardar gasto</button>
        </div>
      </div>
    </div>
  );
}

const gs = {
  page: { padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 1320, margin: "0 auto" },
  summary: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 820 },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".4px", padding: "12px 14px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)", whiteSpace: "nowrap" },
  td: { padding: "12px 14px", fontSize: 13.5, verticalAlign: "middle" },
  catChip: { display: "inline-block", fontSize: 11.5, fontWeight: 600, color: "var(--ink-600, var(--ink-500))", background: "var(--ink-100)", padding: "3px 9px", borderRadius: 99, whiteSpace: "nowrap" },
  scrim: { position: "fixed", inset: 0, background: "rgba(20,22,26,.42)", zIndex: 60, display: "grid", placeItems: "center", padding: 20 },
  xBtn: { border: "none", background: "transparent", width: 30, height: 30, borderRadius: 7, display: "grid", placeItems: "center", cursor: "pointer" },
  upload: { display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "14px 16px", borderRadius: 10, border: "1.5px dashed var(--ink-200)", background: "var(--surface-2)", cursor: "pointer" },
  uploadOn: { borderStyle: "solid", borderColor: "color-mix(in srgb, var(--green) 40%, transparent)", background: "var(--green-bg)" },
};

Object.assign(window, { Gastos });
