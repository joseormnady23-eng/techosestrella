/* global React, Icon, MATERIALES, FACTOR_COND, COND_META, money, money0 */
// ============================================================
//  Motor de cotización (compartido) · QuoteEngine
//  cantidad = (m² × manos × factor condición) ÷ rendimiento
// ============================================================
const { useState: useStateQ, useMemo: useMemoQ } = React;

function QuoteEngine({ obra, role, onPortal, compact }) {
  // material por defecto sugerido por sección
  const matBase = MATERIALES[0];     // membrana acrílica blanca
  const matPrimer = MATERIALES[1];   // primer

  // genera items automáticos a partir de las secciones del techo
  const autoItems = useMemoQ(() => {
    const items = [];
    (obra?.secciones || []).forEach((s, i) => {
      const factor = FACTOR_COND[s.cond];
      // imprimante (1 mano)
      items.push({
        id: `auto-${i}-p`, seccion: s.nombre, desc: matPrimer.nombre, m2: s.m2, manos: 1, factor,
        rend: matPrimer.rend, precio: matPrimer.precio, etapa: 1, tipo: "material",
      });
      // membrana (manos de la sección)
      items.push({
        id: `auto-${i}-m`, seccion: s.nombre, desc: matBase.nombre, m2: s.m2, manos: s.manos, factor,
        rend: matBase.rend, precio: matBase.precio, etapa: 1, tipo: "material",
      });
    });
    return items;
  }, [obra]);

  const [items, setItems] = useStateQ(() => [
    ...autoItems,
    { id: "mo-1", seccion: "—", desc: "Mano de obra · aplicación (cuadrilla 3 días)", m2: null, manos: null, factor: null, rend: null, precio: 28000, cantManual: 1, etapa: 1, tipo: "mano" },
  ]);
  const [descTipo, setDescTipo] = useStateQ("pct"); // pct | monto
  const [descVal, setDescVal] = useStateQ(8);
  const [etapaSel, setEtapaSel] = useStateQ("todas");
  const [itbisOn, setItbisOn] = useStateQ(true);

  function cantidad(it) {
    if (it.tipo === "mano") return it.cantManual;
    return (it.m2 * it.manos * it.factor) / it.rend;
  }
  function importe(it) { return cantidad(it) * it.precio; }

  const visibles = items.filter((it) => etapaSel === "todas" || it.etapa === +etapaSel);
  const subtotal = visibles.reduce((a, it) => a + importe(it), 0);
  const descuento = descTipo === "pct" ? subtotal * (descVal / 100) : Math.min(descVal, subtotal);
  const base = subtotal - descuento;
  const itbis = itbisOn ? base * 0.18 : 0;
  const total = base + itbis;

  function addManual() {
    setItems((arr) => [...arr, { id: "m-" + Date.now(), seccion: "—", desc: "Nuevo concepto manual", m2: null, manos: null, factor: null, rend: null, precio: 0, cantManual: 1, unidad: "ud", etapa: 1, tipo: "mano" }]);
  }
  function setItemField(id, key, val) { setItems((arr) => arr.map((x) => x.id === id ? { ...x, [key]: val } : x)); }
  function delItem(id) { setItems((arr) => arr.filter((x) => x.id !== id)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Aviso motor */}
      <div style={qe.engineNote}>
        <span style={qe.engineIcon}><Icon name="sparkle" size={15} color="var(--blue-700)" /></span>
        <div style={{ fontSize: 13, lineHeight: 1.45 }}>
          Klika calculó las cantidades desde las secciones del techo:
          <strong> cantidad = (m² × manos × factor de condición) ÷ rendimiento</strong>. Puedes ajustar manos, precio o agregar mano de obra.
        </div>
      </div>

      {/* Filtro de etapas */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px" }}>Cotizar por etapas</span>
        {["todas", "1", "2"].map((e) => (
          <button key={e} className={"chip" + (etapaSel === e ? " active" : "")} onClick={() => setEtapaSel(e)}>
            {e === "todas" ? "Todas las etapas" : "Etapa " + e}
          </button>
        ))}
        <span style={{ fontSize: 12.5, color: "var(--ink-400)", marginLeft: 4 }}>El cliente puede aprobar solo una etapa.</span>
      </div>

      {/* Tabla de items */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={qe.table}>
            <thead>
              <tr>
                <th style={qe.th}>Sección / descripción</th>
                <th style={{ ...qe.th, textAlign: "right" }}>m²</th>
                <th style={{ ...qe.th, textAlign: "center" }}>Manos</th>
                <th style={{ ...qe.th, textAlign: "center" }}>Factor</th>
                <th style={{ ...qe.th, textAlign: "right" }}>Rend.</th>
                <th style={{ ...qe.th, textAlign: "right" }}>Cantidad</th>
                <th style={{ ...qe.th, textAlign: "right" }}>P. unit.</th>
                <th style={{ ...qe.th, textAlign: "right" }}>Importe</th>
                <th style={qe.th}></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((it) => (
                <tr key={it.id} style={{ borderBottom: "1px solid var(--ink-100)" }}>
                  <td style={qe.td}>
                    {it.seccion !== "—" && <div style={{ fontSize: 11.5, color: "var(--blue-700)", fontWeight: 700, marginBottom: 2 }}>{it.seccion}</div>}
                    {it.tipo === "mano" ? (
                      <input value={it.desc} onChange={(e) => setItemField(it.id, "desc", e.target.value)} style={qe.descInput} placeholder="Descripción" />
                    ) : (
                      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{it.desc}</div>
                    )}
                    {it.tipo === "mano" && <span className="badge badge-purple" style={{ marginTop: 5, height: 20, fontSize: 11 }}>Manual · mano de obra</span>}
                  </td>
                  <td style={{ ...qe.td, textAlign: "right" }} className="tnum">{it.m2 ?? "—"}</td>
                  <td style={{ ...qe.td, textAlign: "center" }}>
                    {it.manos != null ? (
                      <input type="number" value={it.manos} onChange={(e) => setItemField(it.id, "manos", +e.target.value)} style={qe.miniInput} />
                    ) : "—"}
                  </td>
                  <td style={{ ...qe.td, textAlign: "center" }}>
                    {it.factor != null ? (
                      <input type="number" step="0.05" value={it.factor} onChange={(e) => setItemField(it.id, "factor", +e.target.value)} style={qe.miniInput} />
                    ) : <span className="tnum">—</span>}
                  </td>
                  <td style={{ ...qe.td, textAlign: "right" }}>
                    {it.rend != null ? (
                      <input type="number" step="0.5" value={it.rend} onChange={(e) => setItemField(it.id, "rend", +e.target.value)} style={qe.miniInput} />
                    ) : <span className="tnum">—</span>}
                  </td>
                  <td style={{ ...qe.td, textAlign: "right", fontWeight: 700 }}>
                    {it.tipo === "mano" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                        <input type="number" value={it.cantManual} onChange={(e) => setItemField(it.id, "cantManual", +e.target.value)} style={qe.miniInput} />
                        <input value={it.unidad || ""} onChange={(e) => setItemField(it.id, "unidad", e.target.value)} style={{ ...qe.miniInput, width: 40, textAlign: "left", fontWeight: 400 }} placeholder="ud" />
                      </span>
                    ) : <span className="tnum">{cantidad(it).toFixed(1)}</span>}
                  </td>
                  <td style={{ ...qe.td, textAlign: "right" }}>
                    <input type="number" value={it.precio} onChange={(e) => setItemField(it.id, "precio", +e.target.value)} style={{ ...qe.miniInput, width: 84 }} />
                  </td>
                  <td style={{ ...qe.td, textAlign: "right", fontWeight: 700, fontSize: 13.5 }} className="tnum">{money0(importe(it))}</td>
                  <td style={{ ...qe.td, textAlign: "right" }}>
                    <button onClick={() => delItem(it.id)} style={qe.delBtn} title="Eliminar"><Icon name="trash" size={15} color="var(--ink-300)" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn btn-quiet btn-sm" style={{ margin: "10px 14px" }} onClick={addManual}>
          <Icon name="plus" size={15} /> Agregar concepto manual (mano de obra)
        </button>
      </div>

      {/* Totales + acciones */}
      <div style={qe.bottom} className="r-main">
        <div style={qe.actions}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>Enviar cotización</div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}><Icon name="whatsapp" size={18} /> Enviar por WhatsApp</button>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}><Icon name="mail" size={17} /> Enviar por correo</button>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}><Icon name="download" size={17} /> Descargar PDF</button>
          <button className="btn btn-soft" style={{ width: "100%", justifyContent: "center" }} onClick={onPortal}><Icon name="eye" size={17} /> Ver como cliente</button>
        </div>

        <div className="card" style={qe.totals}>
          <div style={qe.totRow}><span>Subtotal</span><span className="tnum" style={{ fontWeight: 600 }}>{money(subtotal)}</span></div>
          <div style={qe.totRow}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              Descuento
              <span style={qe.descToggle}>
                <button onClick={() => setDescTipo("pct")} style={{ ...qe.descBtn, ...(descTipo === "pct" ? qe.descOn : {}) }}>%</button>
                <button onClick={() => setDescTipo("monto")} style={{ ...qe.descBtn, ...(descTipo === "monto" ? qe.descOn : {}) }}>RD$</button>
              </span>
              <input type="number" value={descVal} onChange={(e) => setDescVal(+e.target.value)} style={{ ...qe.miniInput, width: 52 }} />
            </span>
            <span className="tnum" style={{ color: "var(--red)", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>− {money(descuento)}</span>
          </div>
          <div style={{ ...qe.totRow, color: "var(--ink-500)", fontSize: 13 }}><span>Base imponible</span><span className="tnum">{money(base)}</span></div>
          <div style={qe.totRow}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              ITBIS (18%)
              <button onClick={() => setItbisOn((v) => !v)} style={{ ...qe.itbisToggle, ...(itbisOn ? qe.itbisOn : {}) }} title="Activar / desactivar ITBIS">
                <span style={{ ...qe.itbisKnob, transform: itbisOn ? "translateX(16px)" : "translateX(0)" }} />
              </button>
            </span>
            <span className="tnum" style={{ fontWeight: 600, color: itbisOn ? "var(--ink-700)" : "var(--ink-300)" }}>{itbisOn ? money(itbis) : "Exento"}</span>
          </div>
          <div style={{ height: 1, background: "var(--ink-100)", margin: "4px 0" }} />
          <div style={{ ...qe.totRow, fontSize: 19, fontWeight: 800 }}>
            <span>Total</span><span className="tnum" style={{ color: "var(--blue-700)" }}>{money(total)}</span>
          </div>
          {etapaSel !== "todas" && <div style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 6 }}>Mostrando solo la Etapa {etapaSel}.</div>}
        </div>
      </div>
    </div>
  );
}

const qe = {
  engineNote: { display: "flex", gap: 11, alignItems: "flex-start", padding: "12px 14px", background: "var(--blue-50)",
    borderRadius: 11, border: "1px solid var(--blue-100)" },
  engineIcon: { width: 28, height: 28, borderRadius: 8, background: "#fff", display: "grid", placeItems: "center", flexShrink: 0 },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 720 },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase",
    letterSpacing: ".4px", padding: "11px 12px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)", whiteSpace: "nowrap" },
  td: { padding: "10px 12px", fontSize: 13.5, verticalAlign: "middle" },
  miniInput: { width: 52, height: 32, border: "1px solid var(--ink-200)", borderRadius: 7, textAlign: "right",
    padding: "0 8px", fontSize: 13, fontVariantNumeric: "tabular-nums", outline: "none" },
  descInput: { width: "100%", maxWidth: 220, border: "1px solid var(--ink-200)", borderRadius: 7, height: 32, padding: "0 9px", fontSize: 13.5, fontWeight: 500, outline: "none", background: "var(--surface)" },
  itbisToggle: { position: "relative", width: 34, height: 18, borderRadius: 99, border: "none", background: "var(--ink-200)", cursor: "pointer", padding: 0, flexShrink: 0 },
  itbisOn: { background: "var(--blue-600)" },
  itbisKnob: { position: "absolute", top: 2, left: 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "transform .15s", boxShadow: "0 1px 2px rgba(0,0,0,.25)" },
  delBtn: { border: "none", background: "transparent", width: 30, height: 30, borderRadius: 7, display: "grid", placeItems: "center", cursor: "pointer" },

  bottom: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, alignItems: "start" },
  actions: { display: "flex", flexDirection: "column", gap: 9 },
  totals: { padding: 18 },
  totRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "7px 0", fontSize: 14, color: "var(--ink-700)" },
  descToggle: { display: "inline-flex", border: "1px solid var(--ink-200)", borderRadius: 7, overflow: "hidden" },
  descBtn: { border: "none", background: "var(--surface)", padding: "4px 9px", fontSize: 12, fontWeight: 700, color: "var(--ink-400)" },
  descOn: { background: "var(--ink-900)", color: "#fff" },
};

// ============================================================
//  Motor de cotización INDEPENDIENTE (sin obra) · IndependentQuote
//  Sin m² ni secciones — solo items manuales y/o materiales del inventario.
// ============================================================
function IndependentQuote({ quote, role, onPortal, onSave }) {
  const [items, setItems] = useStateQ(quote.items);
  const [clienteMode, setClienteMode] = useStateQ(quote.clienteId ? "crm" : (quote.cliente ? "libre" : "crm"));
  const [clienteId, setClienteId] = useStateQ(quote.clienteId || "");
  const [clienteLibre, setClienteLibre] = useStateQ(!quote.clienteId ? (quote.cliente || "") : "");
  const [desc, setDesc] = useStateQ(quote.desc || "");
  const [descTipo, setDescTipo] = useStateQ(quote.descTipo || "pct");
  const [descVal, setDescVal] = useStateQ(quote.descVal ?? 0);
  const [itbisOn, setItbisOn] = useStateQ(quote.itbis ?? true);
  const [guardado, setGuardado] = useStateQ(false);

  const subtotal = items.reduce((a, it) => a + (it.cant || 0) * (it.precio || 0), 0);
  const descuento = descTipo === "pct" ? subtotal * (descVal / 100) : Math.min(descVal, subtotal);
  const base = subtotal - descuento;
  const itbis = itbisOn ? base * 0.18 : 0;
  const total = base + itbis;

  const clienteNombre = clienteMode === "crm"
    ? (window.CLIENTES.find((c) => c.id === clienteId)?.nombre || "")
    : clienteLibre.trim();
  const puedeGuardar = clienteNombre && items.length > 0;

  function addMaterial() {
    const m = window.MATERIALES[0];
    setItems((arr) => [...arr, { id: "i-" + Date.now(), tipo: "material", matId: m.id, desc: m.nombre, cant: 1, unidad: m.unidad, precio: m.precio }]);
    setGuardado(false);
  }
  function addManual() {
    setItems((arr) => [...arr, { id: "i-" + Date.now(), tipo: "manual", desc: "", cant: 1, unidad: "ud", precio: 0 }]);
    setGuardado(false);
  }
  function setField(id, key, val) { setItems((arr) => arr.map((x) => x.id === id ? { ...x, [key]: val } : x)); setGuardado(false); }
  function pickMaterial(id, matId) {
    const m = window.MATERIALES.find((x) => x.id === matId);
    setItems((arr) => arr.map((x) => x.id === id ? { ...x, matId, desc: m.nombre, unidad: m.unidad, precio: m.precio } : x));
    setGuardado(false);
  }
  function delItem(id) { setItems((arr) => arr.filter((x) => x.id !== id)); setGuardado(false); }

  function guardar() {
    onSave({
      cliente: clienteNombre,
      clienteId: clienteMode === "crm" ? clienteId : null,
      desc, items, descTipo, descVal, itbis: itbisOn, total, estado: "cotizada",
    });
    setGuardado(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Aviso: cotización sin obra */}
      <div style={{ ...qe.engineNote, background: "var(--purple-bg)", borderColor: "color-mix(in srgb, var(--purple) 22%, transparent)" }}>
        <span style={{ ...qe.engineIcon }}><Icon name="quote" size={15} color="var(--purple)" /></span>
        <div style={{ fontSize: 13, lineHeight: 1.45 }}>
          <strong>Cotización independiente</strong> — no está asociada a una obra. Ideal para venta de materiales a particulares o un presupuesto rápido. Los items se cargan a mano o desde el inventario; <strong>no hay cálculo por m² ni secciones</strong>.
        </div>
      </div>

      {/* Cliente + descripción */}
      <div className="card r-main" style={{ padding: 18, display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)", gap: 18 }}>
        <div className="field">
          <label>Cliente</label>
          <div style={iq.segWrap}>
            <button onClick={() => setClienteMode("crm")} style={{ ...iq.seg, ...(clienteMode === "crm" ? iq.segOn : {}) }}>Del CRM</button>
            <button onClick={() => setClienteMode("libre")} style={{ ...iq.seg, ...(clienteMode === "libre" ? iq.segOn : {}) }}>Nombre libre</button>
          </div>
          {clienteMode === "crm" ? (
            <select className="input input-sm" value={clienteId} onChange={(e) => { setClienteId(e.target.value); setGuardado(false); }} style={{ marginTop: 9 }}>
              <option value="">Selecciona un cliente…</option>
              {window.CLIENTES.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          ) : (
            <input className="input input-sm" value={clienteLibre} onChange={(e) => { setClienteLibre(e.target.value); setGuardado(false); }}
              placeholder="Ej. Wilson De la Cruz (mostrador)" style={{ marginTop: 9 }} />
          )}
          <div style={{ fontSize: 11.5, color: "var(--ink-400)", marginTop: 7 }}>
            {clienteMode === "crm" ? "Cliente registrado en el CRM." : "Para clientes no registrados — no se crea ficha en el CRM."}
          </div>
        </div>
        <div className="field">
          <label>Descripción general <span style={{ color: "var(--ink-400)", fontWeight: 500 }}>· opcional</span></label>
          <textarea className="input" value={desc} onChange={(e) => { setDesc(e.target.value); setGuardado(false); }}
            placeholder="Ej. Venta de materiales para reposición de inventario…"
            style={{ height: 80, padding: "10px 14px", resize: "vertical", lineHeight: 1.45 }} />
        </div>
      </div>

      {/* Tabla de items */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={qe.table}>
            <thead>
              <tr>
                <th style={qe.th}>Descripción / material</th>
                <th style={{ ...qe.th, textAlign: "right" }}>Cantidad</th>
                <th style={{ ...qe.th, textAlign: "left" }}>Unidad</th>
                <th style={{ ...qe.th, textAlign: "right" }}>P. unit.</th>
                <th style={{ ...qe.th, textAlign: "right" }}>Importe</th>
                <th style={qe.th}></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={6} style={{ ...qe.td, textAlign: "center", color: "var(--ink-400)", padding: "26px 12px" }}>
                  Aún no hay items. Agrega un material del inventario o un concepto manual.
                </td></tr>
              )}
              {items.map((it) => (
                <tr key={it.id} style={{ borderBottom: "1px solid var(--ink-100)" }}>
                  <td style={qe.td}>
                    {it.tipo === "material" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <select value={it.matId} onChange={(e) => pickMaterial(it.id, e.target.value)} style={iq.matSelect}>
                          {window.MATERIALES.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                        <span className="badge badge-blue" style={{ alignSelf: "flex-start", height: 20, fontSize: 11 }}>Inventario</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <input value={it.desc} onChange={(e) => setField(it.id, "desc", e.target.value)} style={qe.descInput} placeholder="Concepto manual" />
                        <span className="badge badge-purple" style={{ alignSelf: "flex-start", height: 20, fontSize: 11 }}>Manual</span>
                      </div>
                    )}
                  </td>
                  <td style={{ ...qe.td, textAlign: "right" }}>
                    <input type="number" min="0" value={it.cant} onChange={(e) => setField(it.id, "cant", +e.target.value)} style={qe.miniInput} />
                  </td>
                  <td style={{ ...qe.td }}>
                    <input value={it.unidad} onChange={(e) => setField(it.id, "unidad", e.target.value)} style={{ ...qe.miniInput, width: 86, textAlign: "left", fontWeight: 400 }} placeholder="ud" />
                  </td>
                  <td style={{ ...qe.td, textAlign: "right" }}>
                    <input type="number" min="0" value={it.precio} onChange={(e) => setField(it.id, "precio", +e.target.value)} style={{ ...qe.miniInput, width: 92 }} />
                  </td>
                  <td style={{ ...qe.td, textAlign: "right", fontWeight: 700, fontSize: 13.5 }} className="tnum">{money0((it.cant || 0) * (it.precio || 0))}</td>
                  <td style={{ ...qe.td, textAlign: "right" }}>
                    <button onClick={() => delItem(it.id)} style={qe.delBtn} title="Eliminar"><Icon name="trash" size={15} color="var(--ink-300)" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 14px" }}>
          <button className="btn btn-quiet btn-sm" onClick={addMaterial}><Icon name="inventory" size={15} /> Material del inventario</button>
          <button className="btn btn-quiet btn-sm" onClick={addManual}><Icon name="plus" size={15} /> Item manual</button>
        </div>
      </div>

      {/* Totales + acciones */}
      <div style={qe.bottom} className="r-main">
        <div style={qe.actions}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>Cotización</div>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} disabled={!puedeGuardar} onClick={guardar}>
            <Icon name={guardado ? "check" : "download"} size={17} /> {guardado ? "Guardada" : "Guardar"}
          </button>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={!puedeGuardar}><Icon name="whatsapp" size={18} /> Enviar por WhatsApp</button>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} disabled={!puedeGuardar}><Icon name="mail" size={17} /> Enviar por correo</button>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} disabled={!puedeGuardar}><Icon name="download" size={17} /> Descargar PDF</button>
          {!puedeGuardar && <div style={{ fontSize: 11.5, color: "var(--ink-400)", lineHeight: 1.4 }}>Agrega un cliente y al menos un item para guardar o enviar.</div>}
        </div>

        <div className="card" style={qe.totals}>
          <div style={qe.totRow}><span>Subtotal</span><span className="tnum" style={{ fontWeight: 600 }}>{money(subtotal)}</span></div>
          <div style={qe.totRow}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              Descuento
              <span style={qe.descToggle}>
                <button onClick={() => { setDescTipo("pct"); setGuardado(false); }} style={{ ...qe.descBtn, ...(descTipo === "pct" ? qe.descOn : {}) }}>%</button>
                <button onClick={() => { setDescTipo("monto"); setGuardado(false); }} style={{ ...qe.descBtn, ...(descTipo === "monto" ? qe.descOn : {}) }}>RD$</button>
              </span>
              <input type="number" min="0" value={descVal} onChange={(e) => { setDescVal(+e.target.value); setGuardado(false); }} style={{ ...qe.miniInput, width: 52 }} />
            </span>
            <span className="tnum" style={{ color: "var(--red)", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>− {money(descuento)}</span>
          </div>
          <div style={{ ...qe.totRow, color: "var(--ink-500)", fontSize: 13 }}><span>Base imponible</span><span className="tnum">{money(base)}</span></div>
          <div style={qe.totRow}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              ITBIS (18%)
              <button onClick={() => { setItbisOn((v) => !v); setGuardado(false); }} style={{ ...qe.itbisToggle, ...(itbisOn ? qe.itbisOn : {}) }} title="Activar / desactivar ITBIS">
                <span style={{ ...qe.itbisKnob, transform: itbisOn ? "translateX(16px)" : "translateX(0)" }} />
              </button>
            </span>
            <span className="tnum" style={{ fontWeight: 600, color: itbisOn ? "var(--ink-700)" : "var(--ink-300)" }}>{itbisOn ? money(itbis) : "Exento"}</span>
          </div>
          <div style={{ height: 1, background: "var(--ink-100)", margin: "4px 0" }} />
          <div style={{ ...qe.totRow, fontSize: 19, fontWeight: 800 }}>
            <span>Total</span><span className="tnum" style={{ color: "var(--blue-700)" }}>{money(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const iq = {
  segWrap: { display: "inline-flex", border: "1px solid var(--ink-200)", borderRadius: 8, overflow: "hidden", alignSelf: "flex-start" },
  seg: { border: "none", background: "var(--surface)", padding: "7px 14px", fontSize: 12.5, fontWeight: 700, color: "var(--ink-400)" },
  segOn: { background: "var(--ink-900)", color: "#fff" },
  matSelect: { width: "100%", maxWidth: 320, border: "1px solid var(--ink-200)", borderRadius: 7, height: 34, padding: "0 9px", fontSize: 13.5, fontWeight: 500, outline: "none", background: "var(--surface)", color: "var(--ink-900)" },
};

// helper de total para cotizaciones independientes (listado)
function indepTotal(c) {
  const sub = (c.items || []).reduce((a, it) => a + (it.cant || 0) * (it.precio || 0), 0);
  const desc = c.descTipo === "pct" ? sub * ((c.descVal || 0) / 100) : Math.min(c.descVal || 0, sub);
  const base = sub - desc;
  return base + (c.itbis ? base * 0.18 : 0);
}

// ============================================================
//  Pantalla 5 · Cotizaciones (listado + motores: obra / independiente)
// ============================================================
function Cotizacion({ onNav, role, onPortal }) {
  const cotizables = window.OBRAS.filter((o) => ["cotizada", "aprobada"].includes(o.estado));
  const [indeps, setIndeps] = useStateQ(() => window.COTIZ_INDEP.map((c) => ({ ...c })));
  const [sel, setSel] = useStateQ(cotizables[0]?.id || (indeps[0] && indeps[0].id) || null);
  const [menuOpen, setMenuOpen] = useStateQ(false);
  const [obraPick, setObraPick] = useStateQ(false);
  const seqRef = window.React.useRef(93);

  const obra = window.OBRAS.find((o) => o.id === sel);
  const indep = indeps.find((c) => c.id === sel);

  function nuevaIndep() {
    const id = "CT-" + String(seqRef.current++).padStart(4, "0");
    const draft = { id, clienteId: null, cliente: "", desc: "", estado: "borrador", itbis: true, descTipo: "pct", descVal: 0, items: [] };
    setIndeps((arr) => [draft, ...arr]);
    setSel(id);
    setMenuOpen(false);
  }
  function pickObra(id) { setSel(id); setObraPick(false); setMenuOpen(false); }
  function saveIndep(id, patch) {
    setIndeps((arr) => arr.map((c) => c.id === id ? { ...c, ...patch } : c));
  }

  return (
    <div style={ct.page} className="r-page r-main">
      {/* Lista lateral de cotizaciones */}
      <aside className="card r-stick0" style={ct.list}>
        <div style={{ position: "relative", padding: "8px 8px 6px" }}>
          <button className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMenuOpen((v) => !v)}>
            <Icon name="plus" size={15} /> Nueva cotización <Icon name="chevdown" size={13} />
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={ct.menuScrim} />
              <div className="card fade-up" style={ct.menu}>
                <button style={ct.menuItem} onClick={() => { setObraPick(true); setMenuOpen(false); }}>
                  <span style={{ ...ct.menuIcon, background: "var(--blue-50)" }}><Icon name="roof" size={17} color="var(--blue-700)" /></span>
                  <span style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>Asociada a una obra</div>
                    <div style={{ fontSize: 12, color: "var(--ink-400)" }}>Cálculo por m² y secciones del techo</div>
                  </span>
                </button>
                <button style={ct.menuItem} onClick={nuevaIndep}>
                  <span style={{ ...ct.menuIcon, background: "var(--purple-bg)" }}><Icon name="quote" size={17} color="var(--purple)" /></span>
                  <span style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>Cotización independiente</div>
                    <div style={{ fontSize: 12, color: "var(--ink-400)" }}>Venta de materiales · sin obra</div>
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ ...ct.listHead, paddingTop: 4 }}>Cotizaciones</div>
        <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 190px)", padding: "0 1px 4px" }}>
          {indeps.map((c) => {
            const on = sel === c.id;
            const nombre = c.cliente || (window.CLIENTES.find((x) => x.id === c.clienteId)?.nombre) || "Sin cliente";
            return (
              <button key={c.id} onClick={() => setSel(c.id)} style={{ ...ct.listItem, ...(on ? ct.listItemOn : {}) }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: on ? "var(--blue-700)" : "var(--ink-400)" }}>{c.id}</span>
                  <span className={"badge " + window.ESTADOS[c.estado].cls} style={{ height: 20, fontSize: 10.5 }}>{window.ESTADOS[c.estado].label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <span style={ct.tipoIndep}>Independiente</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 13.5, marginTop: 5, textAlign: "left" }}>{nombre}</div>
                {c.desc && <div style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.desc}</div>}
                {role === "dueno" && <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6, textAlign: "left" }}>{money0(indepTotal(c))}</div>}
              </button>
            );
          })}
          {cotizables.map((o) => {
            const on = sel === o.id;
            return (
              <button key={o.id} onClick={() => setSel(o.id)} style={{ ...ct.listItem, ...(on ? ct.listItemOn : {}) }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: on ? "var(--blue-700)" : "var(--ink-400)" }}>{o.id}</span>
                  <span className={"badge " + window.ESTADOS[o.estado].cls} style={{ height: 20, fontSize: 10.5 }}>{window.ESTADOS[o.estado].label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <span style={ct.tipoObra}>Obra</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 13.5, marginTop: 5, textAlign: "left" }}>{o.clienteNom}</div>
                <div style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 1, textAlign: "left" }}>{o.titulo}</div>
                {role === "dueno" && <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6, textAlign: "left" }}>{money0(o.total)}</div>}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Motor */}
      <div style={{ minWidth: 0 }}>
        {indep && (
          <>
            <div style={ct.engineHead}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{indep.cliente || (window.CLIENTES.find((x) => x.id === indep.clienteId)?.nombre) || "Nueva cotización"}</h3>
                  <span className={"badge " + window.ESTADOS[indep.estado].cls}><span className="dot" />{window.ESTADOS[indep.estado].label}</span>
                  <span style={ct.tipoObra}>Independiente</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-400)", marginTop: 3 }}><span className="mono">{indep.id}</span> · Sin obra asociada</div>
              </div>
            </div>
            <IndependentQuote key={indep.id} quote={indep} role={role} onPortal={onPortal} onSave={(patch) => saveIndep(indep.id, patch)} />
          </>
        )}
        {!indep && obra && (
          <>
            <div style={ct.engineHead}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{obra.clienteNom}</h3>
                  <span className={"badge " + window.ESTADOS[obra.estado].cls}><span className="dot" />{window.ESTADOS[obra.estado].label}</span>
                  <span style={ct.tipoObra}>Obra</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-400)", marginTop: 3 }}><span className="mono">{obra.id}</span> · {obra.titulo}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav("obra", obra.id)}>Abrir obra <Icon name="chevright" size={14} /></button>
            </div>
            <QuoteEngine obra={obra} role={role} onPortal={onPortal} />
          </>
        )}
      </div>

      {/* Modal: elegir obra para cotización asociada */}
      {obraPick && (
        <div style={ct.modalScrim} onClick={() => setObraPick(false)}>
          <div className="card fade-up" style={ct.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Cotización asociada a una obra</h3>
              <button onClick={() => setObraPick(false)} style={qe.delBtn}><Icon name="x" size={18} color="var(--ink-400)" /></button>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-400)", marginBottom: 12 }}>Elige la obra a cotizar. El motor calcula los materiales por m² y secciones.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 360, overflowY: "auto" }}>
              {cotizables.map((o) => (
                <button key={o.id} onClick={() => pickObra(o.id)} style={ct.pickItem}>
                  <span style={{ ...ct.menuIcon, background: "var(--blue-50)" }}><Icon name="roof" size={16} color="var(--blue-700)" /></span>
                  <span style={{ textAlign: "left", minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{o.clienteNom}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><span className="mono">{o.id}</span> · {o.titulo}</div>
                  </span>
                  <span className={"badge " + window.ESTADOS[o.estado].cls} style={{ height: 20, fontSize: 10.5 }}>{window.ESTADOS[o.estado].label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ct = {
  page: { padding: "20px 28px 40px", display: "grid", gridTemplateColumns: "270px 1fr", gap: 18, maxWidth: 1320, margin: "0 auto", alignItems: "start" },
  list: { padding: 7, position: "sticky", top: 20 },
  listHead: { fontSize: 11.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px", padding: "9px 11px 7px" },
  listItem: { display: "block", width: "100%", textAlign: "left", padding: "11px 12px", borderRadius: 10, border: "1px solid transparent", background: "transparent", marginBottom: 2 },
  listItemOn: { background: "var(--blue-50)", border: "1px solid var(--blue-100)" },
  engineHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 },
  tipoObra: { display: "inline-flex", alignItems: "center", height: 19, padding: "0 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: ".2px", background: "var(--ink-100)", color: "var(--ink-500)", textTransform: "uppercase" },
  tipoIndep: { display: "inline-flex", alignItems: "center", height: 19, padding: "0 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: ".2px", background: "var(--purple-bg)", color: "var(--purple-ink)", textTransform: "uppercase" },
  menu: { position: "absolute", top: 46, left: 8, right: 8, zIndex: 30, padding: 6, boxShadow: "var(--sh-lg)" },
  menuScrim: { position: "fixed", inset: 0, zIndex: 20 },
  menuItem: { display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "9px 9px", borderRadius: 9, border: "none", background: "transparent", cursor: "pointer" },
  menuIcon: { width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },
  modalScrim: { position: "fixed", inset: 0, background: "rgba(20,22,26,.42)", zIndex: 60, display: "grid", placeItems: "center", padding: 20 },
  modal: { width: "min(520px, 100%)", padding: 20 },
  pickItem: { display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px 11px", borderRadius: 10, border: "1px solid var(--ink-100)", background: "var(--surface)", cursor: "pointer" },
};

Object.assign(window, { QuoteEngine, IndependentQuote, Cotizacion });
