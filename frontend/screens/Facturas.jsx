/* global React, Icon, FACTURAS, TIPO_NCF, ECF_META, CLIENTES, OBRAS, COTIZ_INDEP, NCF_SECUENCIAS, METODOS_PAGO, facturaCalc, facturaPagada, money, money0, FacturaDetalle, KlikaData */
// ============================================================
//  CONTABILIDAD · Facturas (ventas / 607)
//  Lista · crear (desde cotización o manual) · detalle
// ============================================================
const { useState: useStateF, useMemo: useMemoF, useEffect: useEffectF } = React;

function mapFactura(f) {
  return {
    id: f.id,
    ncf: f.ncf ?? null,
    tipo: f.tipo_ncf ?? "b01",
    ecf: f.estado_ecf ?? "pendiente",
    fecha: (f.fecha_emision ?? "").slice(0, 10),
    fechaISO: f.fecha_emision ?? "",
    cliente: f.cliente?.nombre ?? "",
    rnc: f.cliente?.rnc_cedula ?? "",
    clienteId: f.cliente_id ?? null,
    obraId: f.obra_id ?? null,
    items: (f.items ?? []).map((it) => ({
      desc: it.descripcion ?? "", cant: Number(it.cantidad ?? 1),
      unidad: it.unidad ?? "ud", precio: Number(it.precio_unitario ?? 0), itbis: Number(it.itbis_pct ?? 18),
    })),
    pagos: (f.pagos ?? []).map((p) => ({
      id: p.id, monto: Number(p.monto ?? 0), metodo: p.metodo ?? "efectivo",
      fecha: (p.created_at ?? "").slice(0, 10), nota: p.nota ?? "",
    })),
    anulada: f.anulada ?? false,
    motivoAnulacion: f.motivo_anulacion ?? null,
    motivoRechazo: f.motivo_rechazo ?? null,
    trackId: f.track_id ?? null,
  };
}

const MESES_OPC = [
  { v: "todos", label: "Todos los meses" },
  { v: "2026-06", label: "Junio 2026" },
  { v: "2026-05", label: "Mayo 2026" },
  { v: "2026-04", label: "Abril 2026" },
];

function genNCF(tipo, facturas) {
  const seq = (window.NCF_SECUENCIAS || []).find((s) => s.tipo === tipo) || { prefijo: tipo, actual: 0 };
  const usados = facturas.filter((f) => f.tipo === tipo && f.ncf).length;
  const next = seq.actual + usados + 1;
  const width = seq.prefijo.startsWith("E") ? 10 : 8;
  return seq.prefijo + String(next).padStart(width, "0");
}

function Facturas({ role }) {
  const [facturas, setFacturas] = useStateF(() => window.FACTURAS.map((f) => ({ ...f, items: f.items.map((i) => ({ ...i })), pagos: (f.pagos || []).map((p) => ({ ...p })) })));
  const [view, setView] = useStateF("list");
  const [selId, setSelId] = useStateF(null);
  const [prefill, setPrefill] = useStateF(null);
  const [pickOpen, setPickOpen] = useStateF(false);
  const [menuOpen, setMenuOpen] = useStateF(false);

  const [fTipo, setFTipo] = useStateF("todos");
  const [fEcf, setFEcf] = useStateF("todos");
  const [fMes, setFMes] = useStateF("todos");
  const [fPago, setFPago] = useStateF("todos");

  useEffectF(() => {
    if (!window.KlikaData || !KlikaData.conectado()) return;
    KlikaData.facturas.lista({ per_page: 200 }).then((res) => {
      const arr = (res.data ?? res).map(mapFactura);
      if (arr.length) setFacturas(arr);
    }).catch(() => {});
  }, []);

  function updateFactura(id, patch) { setFacturas((arr) => arr.map((f) => f.id === id ? { ...f, ...patch } : f)); }
  function addFactura(f) { setFacturas((arr) => [f, ...arr]); }

  const visibles = useMemoF(() => facturas.filter((f) => {
    if (fTipo !== "todos" && f.tipo !== fTipo) return false;
    if (fEcf !== "todos" && f.ecf !== fEcf) return false;
    if (fMes !== "todos" && (f.fechaISO || "").slice(0, 7) !== fMes) return false;
    if (fPago === "pagada" && !facturaPagada(f)) return false;
    if (fPago === "pendiente" && facturaPagada(f)) return false;
    return true;
  }), [facturas, fTipo, fEcf, fMes, fPago]);

  // ---- Crear ----
  if (view === "create") {
    return <FacturaCrear role={role} prefill={prefill} facturas={facturas}
      onCancel={() => { setView("list"); setPrefill(null); }}
      onCreate={(f) => { addFactura(f); setSelId(f.id); setPrefill(null); setView("detail"); }} />;
  }

  // ---- Detalle ----
  const sel = facturas.find((f) => f.id === selId);
  if (view === "detail" && sel) {
    return <FacturaDetalle factura={sel} role={role}
      onBack={() => setView("list")}
      onUpdate={(patch) => updateFactura(sel.id, patch)} />;
  }

  // ---- Lista ----
  return (
    <div style={fc.page} className="r-page">
      {/* Barra de filtros + nueva */}
      <div style={fc.toolbar} className="r-toolbar">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", flex: 1, minWidth: 0 }}>
          <Sel value={fTipo} onChange={setFTipo} opts={[["todos", "Todo comprobante"], ...Object.entries(TIPO_NCF).map(([k, v]) => [k, v.short + " · " + v.label])]} />
          <Sel value={fEcf} onChange={setFEcf} opts={[["todos", "Todo estado e-CF"], ...Object.entries(ECF_META).map(([k, v]) => [k, v.label])]} />
          <Sel value={fMes} onChange={setFMes} opts={MESES_OPC.map((m) => [m.v, m.label])} />
          <div style={fc.segPago}>
            {[["todos", "Todas"], ["pagada", "Pagadas"], ["pendiente", "Por cobrar"]].map(([v, l]) => (
              <button key={v} onClick={() => setFPago(v)} style={{ ...fc.segBtn, ...(fPago === v ? fc.segOn : {}) }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <button className="btn btn-primary" onClick={() => setMenuOpen((v) => !v)}>
            <Icon name="plus" size={16} /> Nueva factura <Icon name="chevdown" size={13} />
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }} />
              <div className="card fade-up" style={fc.menu}>
                <button style={fc.menuItem} onClick={() => { setMenuOpen(false); setPickOpen(true); }}>
                  <span style={{ ...fc.menuIcon, background: "var(--blue-50)" }}><Icon name="quote" size={17} color="var(--blue-700)" /></span>
                  <span style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>Desde cotización</div>
                    <div style={{ fontSize: 12, color: "var(--ink-400)" }}>Toma una cotización aprobada</div>
                  </span>
                </button>
                <button style={fc.menuItem} onClick={() => { setMenuOpen(false); setPrefill(null); setView("create"); }}>
                  <span style={{ ...fc.menuIcon, background: "var(--purple-bg)" }}><Icon name="edit" size={16} color="var(--purple)" /></span>
                  <span style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>Factura manual</div>
                    <div style={{ fontSize: 12, color: "var(--ink-400)" }}>Carga los items a mano</div>
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={fc.table}>
            <thead>
              <tr>
                <th style={fc.th}>NCF</th>
                <th style={fc.th}>Cliente</th>
                <th style={{ ...fc.th, textAlign: "center" }}>Tipo</th>
                <th style={fc.th}>Fecha</th>
                <th style={{ ...fc.th, textAlign: "right" }}>Total</th>
                <th style={{ ...fc.th, textAlign: "center" }}>e-CF</th>
                <th style={{ ...fc.th, textAlign: "center" }}>Pagada</th>
                <th style={fc.th}></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((f) => {
                const c = facturaCalc(f);
                const pag = facturaPagada(f);
                const parcial = c.cobrado > 0 && !pag;
                return (
                  <tr key={f.id} style={{ borderBottom: "1px solid var(--ink-100)", cursor: "pointer", opacity: f.anulada ? 0.55 : 1 }}
                    onClick={() => { setSelId(f.id); setView("detail"); }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={fc.td}>
                      <span className="mono" style={{ fontWeight: 600, fontSize: 12.5 }}>{f.ncf || "Borrador"}</span>
                      {f.anulada && <span className="badge badge-red" style={{ marginLeft: 7, height: 19, fontSize: 10 }}>Anulada</span>}
                    </td>
                    <td style={{ ...fc.td, fontWeight: 600 }}>{f.cliente}</td>
                    <td style={{ ...fc.td, textAlign: "center" }}>
                      <span className={"badge " + TIPO_NCF[f.tipo].cls} style={{ height: 21, fontSize: 11 }}>{TIPO_NCF[f.tipo].short}</span>
                    </td>
                    <td style={{ ...fc.td, color: "var(--ink-500)" }}>{f.fecha}</td>
                    <td style={{ ...fc.td, textAlign: "right", fontWeight: 700 }} className="tnum">{money0(c.total)}</td>
                    <td style={{ ...fc.td, textAlign: "center" }}>
                      <span className={"badge " + ECF_META[f.ecf].cls} style={{ height: 21, fontSize: 11 }}>{ECF_META[f.ecf].label}</span>
                    </td>
                    <td style={{ ...fc.td, textAlign: "center" }}>
                      <span className={"badge " + (pag ? "badge-green" : "badge-red")} style={{ height: 21, fontSize: 11 }}>
                        {pag ? "Pagada" : parcial ? "Parcial" : "Pendiente"}
                      </span>
                    </td>
                    <td style={{ ...fc.td, textAlign: "right", color: "var(--ink-300)" }}><Icon name="chevright" size={16} /></td>
                  </tr>
                );
              })}
              {visibles.length === 0 && (
                <tr><td colSpan={8} style={{ ...fc.td, textAlign: "center", color: "var(--ink-400)", padding: "30px 12px" }}>No hay facturas con estos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: elegir cotización aprobada */}
      {pickOpen && <PickCotizacion onClose={() => setPickOpen(false)} onPick={(pf) => { setPickOpen(false); setPrefill(pf); setView("create"); }} />}
    </div>
  );
}

// ---- Selector de cotización aprobada ----
function PickCotizacion({ onClose, onPick }) {
  const obras = window.OBRAS.filter((o) => o.estado === "aprobada");
  const indeps = (window.COTIZ_INDEP || []).filter((c) => c.estado === "aprobada");
  function fromObra(o) {
    const cli = window.CLIENTES.find((c) => c.id === o.cliente);
    onPick({
      origen: o.id, clienteId: o.cliente, cliente: o.clienteNom, rnc: cli?.tipo === "Comercial" || cli?.tipo === "Institucional" ? "1-30-00000-0" : "",
      obraId: o.id,
      items: [{ desc: "Trabajos según cotización · " + o.titulo, cant: 1, unidad: "global", precio: Math.round(o.total / 1.18), itbis: 18 }],
    });
  }
  function fromIndep(c) {
    onPick({
      origen: c.id, clienteId: c.clienteId, cliente: c.cliente, rnc: "",
      obraId: null,
      items: (c.items || []).map((i) => ({ desc: i.desc, cant: i.cant, unidad: i.unidad, precio: i.precio, itbis: 18 })),
    });
  }
  return (
    <div style={fc.scrim} onClick={onClose}>
      <div className="card fade-up" style={fc.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Facturar desde cotización</h3>
          <button onClick={onClose} style={fc.xBtn}><Icon name="x" size={18} color="var(--ink-400)" /></button>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-400)", marginBottom: 12 }}>Cotizaciones aprobadas, listas para facturar.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 380, overflowY: "auto" }}>
          {obras.map((o) => (
            <button key={o.id} onClick={() => fromObra(o)} style={fc.pickItem}>
              <span style={{ ...fc.menuIcon, background: "var(--blue-50)" }}><Icon name="roof" size={16} color="var(--blue-700)" /></span>
              <span style={{ textAlign: "left", minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{o.clienteNom}</div>
                <div style={{ fontSize: 12, color: "var(--ink-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><span className="mono">{o.id}</span> · {o.titulo}</div>
              </span>
              <span style={{ fontWeight: 700, fontSize: 13 }} className="tnum">{money0(o.total)}</span>
            </button>
          ))}
          {indeps.map((c) => (
            <button key={c.id} onClick={() => fromIndep(c)} style={fc.pickItem}>
              <span style={{ ...fc.menuIcon, background: "var(--purple-bg)" }}><Icon name="quote" size={16} color="var(--purple)" /></span>
              <span style={{ textAlign: "left", minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.cliente}</div>
                <div style={{ fontSize: 12, color: "var(--ink-400)" }}><span className="mono">{c.id}</span> · Independiente</div>
              </span>
              <Icon name="chevright" size={16} color="var(--ink-300)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  Crear factura
// ============================================================
function FacturaCrear({ role, prefill, facturas, onCancel, onCreate }) {
  const [clienteMode, setClienteMode] = useStateF(prefill?.clienteId ? "crm" : "crm");
  const [clienteId, setClienteId] = useStateF(prefill?.clienteId || "");
  const [clienteLibre, setClienteLibre] = useStateF(prefill && !prefill.clienteId ? prefill.cliente : "");
  const [rnc, setRnc] = useStateF(prefill?.rnc || "");
  const [tipo, setTipo] = useStateF(prefill?.rnc ? "B01" : "B02");
  const [enviarDgii, setEnviarDgii] = useStateF(true);
  const [items, setItems] = useStateF(prefill?.items?.map((i) => ({ id: "i" + Math.random(), ...i })) || [{ id: "i0", desc: "", cant: 1, unidad: "ud", precio: 0, itbis: 18 }]);
  const [descTipo, setDescTipo] = useStateF("pct");
  const [descVal, setDescVal] = useStateF(0);

  const clienteObj = window.CLIENTES.find((c) => c.id === clienteId);
  const sugerido = (clienteMode === "crm" && clienteObj && (clienteObj.tipo === "Comercial" || clienteObj.tipo === "Institucional")) || rnc ? "B01" : "B02";
  const clienteNombre = clienteMode === "crm" ? (clienteObj?.nombre || "") : clienteLibre.trim();

  const fakeF = { items: items.map((i) => ({ ...i })), descTipo, descVal, pagos: [] };
  const calc = facturaCalc(fakeF);
  const puede = clienteNombre && items.length > 0 && calc.total > 0;

  function setItem(id, k, v) { setItems((a) => a.map((x) => x.id === id ? { ...x, [k]: v } : x)); }
  function addItem() { setItems((a) => [...a, { id: "i" + Date.now(), desc: "", cant: 1, unidad: "ud", precio: 0, itbis: 18 }]); }
  function delItem(id) { setItems((a) => a.filter((x) => x.id !== id)); }

  function build(estado, emitirNCF, enviar) {
    const id = "F-" + Math.floor(2607 + Math.random() * 90);
    const requiere = emitirNCF && enviar;
    return {
      id, ncf: emitirNCF ? genNCF(tipo, facturas) : null, tipo,
      clienteId: clienteMode === "crm" ? clienteId : null, cliente: clienteNombre, rnc,
      fecha: "01 jun 2026", fechaISO: "2026-06-01", obraId: prefill?.obraId || null,
      requiere_ecf: requiere, ecf: !emitirNCF ? "no_aplica" : requiere ? "pendiente" : "no_aplica",
      trackId: requiere ? "DGII-" + Math.random().toString(16).slice(2, 8).toUpperCase() : null,
      borrador: estado === "borrador",
      descTipo, descVal, items: items.map(({ id, ...rest }) => rest), pagos: [],
    };
  }

  return (
    <div style={fc.page} className="r-page">
      <button className="btn btn-quiet btn-sm" onClick={onCancel} style={{ alignSelf: "flex-start" }}><Icon name="chevleft" size={15} /> Volver a facturas</button>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Nueva factura</h2>
        {prefill && <span className="badge badge-blue"><Icon name="quote" size={13} /> Desde {prefill.origen}</span>}
      </div>

      {/* Cliente + comprobante */}
      <div className="card" style={{ padding: 18 }}>
        <div style={fc.formGrid} className="r-form2">
          <div className="field">
            <label>Cliente</label>
            <div style={fc.seg}>
              <button onClick={() => setClienteMode("crm")} style={{ ...fc.segBtn, ...(clienteMode === "crm" ? fc.segOn : {}) }}>Del CRM</button>
              <button onClick={() => setClienteMode("libre")} style={{ ...fc.segBtn, ...(clienteMode === "libre" ? fc.segOn : {}) }}>Nombre libre</button>
            </div>
            {clienteMode === "crm" ? (
              <select className="input input-sm" value={clienteId} onChange={(e) => setClienteId(e.target.value)} style={{ marginTop: 9 }}>
                <option value="">Selecciona un cliente…</option>
                {window.CLIENTES.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            ) : (
              <input className="input input-sm" value={clienteLibre} onChange={(e) => setClienteLibre(e.target.value)} placeholder="Nombre del cliente" style={{ marginTop: 9 }} />
            )}
          </div>
          <div className="field">
            <label>RNC / Cédula <span style={{ color: "var(--ink-400)", fontWeight: 500 }}>· requerido para B01</span></label>
            <input className="input input-sm" value={rnc} onChange={(e) => setRnc(e.target.value)} placeholder="1-30-12345-6" />
            <div style={{ fontSize: 11.5, color: "var(--ink-400)", marginTop: 6 }}>Sin RNC solo se puede emitir comprobante de consumo (B02).</div>
          </div>
        </div>

        <div style={{ height: 1, background: "var(--ink-100)", margin: "16px 0" }} />

        <div style={fc.formGrid} className="r-form2">
          <div className="field">
            <label>Tipo de comprobante (NCF)</label>
            <select className="input input-sm" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {Object.entries(TIPO_NCF).map(([k, v]) => <option key={k} value={k}>{v.short} · {v.label}</option>)}
            </select>
            {tipo !== sugerido && (
              <button onClick={() => setTipo(sugerido)} style={fc.sugBtn}>
                <Icon name="sparkle" size={13} color="var(--blue-700)" /> Sugerido para este cliente: <strong>{sugerido}</strong> — aplicar
              </button>
            )}
            {tipo === sugerido && <div style={{ fontSize: 11.5, color: "var(--ink-400)", marginTop: 6 }}>{TIPO_NCF[tipo].desc}</div>}
          </div>
          <div className="field">
            <label>Envío a la DGII</label>
            <button onClick={() => setEnviarDgii((v) => !v)} style={{ ...fc.dgiiToggle, ...(enviarDgii ? fc.dgiiOn : {}) }}>
              <span style={{ ...fc.dgiiKnob, transform: enviarDgii ? "translateX(20px)" : "translateX(0)" }} />
              <span style={{ marginLeft: enviarDgii ? 0 : 26, marginRight: enviarDgii ? 26 : 0, fontSize: 12.5, fontWeight: 700, color: enviarDgii ? "var(--green-ink)" : "var(--ink-400)" }}>
                {enviarDgii ? "Enviar e-CF" : "No enviar"}
              </span>
            </button>
            <div style={{ fontSize: 11.5, color: "var(--ink-400)", marginTop: 6 }}>Si está apagado, el NCF se genera pero <strong>no se envía</strong> a la DGII.</div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={fc.table}>
            <thead>
              <tr>
                <th style={fc.th}>Descripción</th>
                <th style={{ ...fc.th, textAlign: "right" }}>Cant.</th>
                <th style={fc.th}>Unidad</th>
                <th style={{ ...fc.th, textAlign: "right" }}>P. unit.</th>
                <th style={{ ...fc.th, textAlign: "center" }}>ITBIS</th>
                <th style={{ ...fc.th, textAlign: "right" }}>Importe</th>
                <th style={fc.th}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} style={{ borderBottom: "1px solid var(--ink-100)" }}>
                  <td style={fc.td}><input value={it.desc} onChange={(e) => setItem(it.id, "desc", e.target.value)} style={fc.descInput} placeholder="Descripción del concepto" /></td>
                  <td style={{ ...fc.td, textAlign: "right" }}><input type="number" min="0" value={it.cant} onChange={(e) => setItem(it.id, "cant", +e.target.value)} style={fc.mini} /></td>
                  <td style={fc.td}><input value={it.unidad} onChange={(e) => setItem(it.id, "unidad", e.target.value)} style={{ ...fc.mini, width: 74, textAlign: "left", fontWeight: 400 }} /></td>
                  <td style={{ ...fc.td, textAlign: "right" }}><input type="number" min="0" value={it.precio} onChange={(e) => setItem(it.id, "precio", +e.target.value)} style={{ ...fc.mini, width: 92 }} /></td>
                  <td style={{ ...fc.td, textAlign: "center" }}>
                    <select value={it.itbis} onChange={(e) => setItem(it.id, "itbis", +e.target.value)} style={{ ...fc.mini, width: 66, textAlign: "left" }}>
                      <option value={18}>18%</option>
                      <option value={0}>Exento</option>
                    </select>
                  </td>
                  <td style={{ ...fc.td, textAlign: "right", fontWeight: 700 }} className="tnum">{money0((it.cant || 0) * (it.precio || 0))}</td>
                  <td style={{ ...fc.td, textAlign: "right" }}><button onClick={() => delItem(it.id)} style={fc.xBtn} title="Eliminar"><Icon name="trash" size={15} color="var(--ink-300)" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn btn-quiet btn-sm" style={{ margin: "10px 14px" }} onClick={addItem}><Icon name="plus" size={15} /> Agregar item</button>
      </div>

      {/* Totales + acciones */}
      <div style={fc.bottom} className="r-main">
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 2 }}>Emitir</div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={!puede} onClick={() => onCreate(build("emitida", true, enviarDgii))}>
            <Icon name="send" size={17} /> {enviarDgii ? "Emitir y enviar a DGII" : "Emitir sin enviar"}
          </button>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} disabled={!puede} onClick={() => onCreate(build("borrador", false, false))}>
            <Icon name="edit" size={16} /> Guardar borrador
          </button>
          {!puede && <div style={{ fontSize: 11.5, color: "var(--ink-400)" }}>Completa cliente e items con importe para emitir.</div>}
          <div style={{ fontSize: 11.5, color: "var(--ink-400)", lineHeight: 1.45, marginTop: 2 }}>El NCF se asigna al emitir y <strong>no es editable</strong> luego.</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={fc.totRow}><span>Subtotal</span><span className="tnum" style={{ fontWeight: 600 }}>{money(calc.sub)}</span></div>
          <div style={fc.totRow}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              Descuento
              <span style={fc.descToggle}>
                <button onClick={() => setDescTipo("pct")} style={{ ...fc.descBtn, ...(descTipo === "pct" ? fc.descOn : {}) }}>%</button>
                <button onClick={() => setDescTipo("monto")} style={{ ...fc.descBtn, ...(descTipo === "monto" ? fc.descOn : {}) }}>RD$</button>
              </span>
              <input type="number" min="0" value={descVal} onChange={(e) => setDescVal(+e.target.value)} style={{ ...fc.mini, width: 52 }} />
            </span>
            <span className="tnum" style={{ color: "var(--red)", fontWeight: 600 }}>− {money(calc.desc)}</span>
          </div>
          <div style={{ ...fc.totRow, color: "var(--ink-500)", fontSize: 13 }}><span>Base imponible</span><span className="tnum">{money(calc.base)}</span></div>
          <div style={fc.totRow}><span>ITBIS (18%)</span><span className="tnum" style={{ fontWeight: 600 }}>{money(calc.itbis)}</span></div>
          <div style={{ height: 1, background: "var(--ink-100)", margin: "4px 0" }} />
          <div style={{ ...fc.totRow, fontSize: 19, fontWeight: 800 }}><span>Total</span><span className="tnum" style={{ color: "var(--blue-700)" }}>{money(calc.total)}</span></div>
        </div>
      </div>
    </div>
  );
}

// ---- Select compacto reutilizable ----
function Sel({ value, onChange, opts }) {
  return (
    <select className="input input-sm" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "auto", minWidth: 150, paddingRight: 30 }}>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

const fc = {
  page: { padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 1320, margin: "0 auto" },
  toolbar: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  segPago: { display: "inline-flex", border: "1px solid var(--ink-200)", borderRadius: 8, overflow: "hidden", background: "var(--surface)" },
  seg: { display: "inline-flex", border: "1px solid var(--ink-200)", borderRadius: 8, overflow: "hidden", alignSelf: "flex-start" },
  segBtn: { border: "none", background: "var(--surface)", padding: "7px 13px", fontSize: 12.5, fontWeight: 700, color: "var(--ink-400)" },
  segOn: { background: "var(--ink-900)", color: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 760 },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".4px", padding: "12px 14px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)", whiteSpace: "nowrap" },
  td: { padding: "12px 14px", fontSize: 13.5, verticalAlign: "middle" },
  mini: { width: 64, height: 32, border: "1px solid var(--ink-200)", borderRadius: 7, textAlign: "right", padding: "0 8px", fontSize: 13, fontVariantNumeric: "tabular-nums", outline: "none", background: "var(--surface)" },
  descInput: { width: "100%", minWidth: 180, border: "1px solid var(--ink-200)", borderRadius: 7, height: 34, padding: "0 9px", fontSize: 13.5, outline: "none", background: "var(--surface)" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 },
  bottom: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, alignItems: "start" },
  totRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "7px 0", fontSize: 14, color: "var(--ink-700)" },
  descToggle: { display: "inline-flex", border: "1px solid var(--ink-200)", borderRadius: 7, overflow: "hidden" },
  descBtn: { border: "none", background: "var(--surface)", padding: "4px 9px", fontSize: 12, fontWeight: 700, color: "var(--ink-400)" },
  descOn: { background: "var(--ink-900)", color: "#fff" },
  sugBtn: { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--blue-100)", background: "var(--blue-50)", color: "var(--blue-700)", fontSize: 12, fontWeight: 600, alignSelf: "flex-start" },
  dgiiToggle: { position: "relative", display: "inline-flex", alignItems: "center", height: 36, width: 150, borderRadius: 8, border: "1px solid var(--ink-200)", background: "var(--surface)", padding: "0 12px", alignSelf: "flex-start" },
  dgiiOn: { background: "var(--green-bg)", borderColor: "color-mix(in srgb, var(--green) 30%, transparent)" },
  dgiiKnob: { position: "absolute", top: 3, left: 3, width: 28, height: 28, borderRadius: 6, background: "var(--green)", transition: "transform .16s" },
  menu: { position: "absolute", top: 48, right: 0, width: 250, zIndex: 30, padding: 6, boxShadow: "var(--sh-lg)" },
  menuItem: { display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "9px", borderRadius: 9, border: "none", background: "transparent", cursor: "pointer" },
  menuIcon: { width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },
  scrim: { position: "fixed", inset: 0, background: "rgba(20,22,26,.42)", zIndex: 60, display: "grid", placeItems: "center", padding: 20 },
  modal: { width: "min(520px, 100%)", padding: 20 },
  pickItem: { display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px 11px", borderRadius: 10, border: "1px solid var(--ink-100)", background: "var(--surface)", cursor: "pointer" },
  xBtn: { border: "none", background: "transparent", width: 30, height: 30, borderRadius: 7, display: "grid", placeItems: "center", cursor: "pointer" },
};

Object.assign(window, { Facturas });
