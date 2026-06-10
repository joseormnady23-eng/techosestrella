/* global React, Icon, TIPO_NCF, ECF_META, METODOS_PAGO, OBRAS, facturaCalc, facturaPagada, money, money0, KlikaData */
// ============================================================
//  CONTABILIDAD · Detalle de factura
//  estado DGII · items · pagos · cobro · anular · XML
// ============================================================
const { useState: useStateFD } = React;

function FacturaDetalle({ factura: f, role, onBack, onUpdate }) {
  const [pagoOpen, setPagoOpen] = useStateFD(false);
  const [anularOpen, setAnularOpen] = useStateFD(false);
  const [xmlOpen, setXmlOpen] = useStateFD(false);
  const c = facturaCalc(f);
  const pagada = facturaPagada(f);
  const cobroPct = c.total > 0 ? Math.min(100, (c.cobrado / c.total) * 100) : 0;
  const obra = f.obraId ? window.OBRAS.find((o) => o.id === f.obraId) : null;

  async function registrarPago(p) {
    onUpdate({ pagos: [...(f.pagos || []), p] });
    setPagoOpen(false);
    if (window.KlikaData && KlikaData.conectado() && f.id) {
      KlikaData.facturas.pagar(f.id, { monto: p.monto, metodo: p.metodo, nota: p.nota || null }).catch(() => {});
    }
  }
  async function anular(motivo) {
    onUpdate({ anulada: true, motivoAnulacion: motivo });
    setAnularOpen(false);
    if (window.KlikaData && KlikaData.conectado() && f.id) {
      KlikaData.facturas.anular(f.id).catch(() => {});
    }
  }
  async function reintentar() {
    onUpdate({ ecf: "pendiente", motivoRechazo: null });
    if (window.KlikaData && KlikaData.conectado() && f.id) {
      KlikaData.facturas.enviarDgii(f.id).catch(() => {});
    }
  }

  return (
    <div style={fd.page} className="r-page">
      <button className="btn btn-quiet btn-sm" onClick={onBack} style={{ alignSelf: "flex-start" }}><Icon name="chevleft" size={15} /> Volver a facturas</button>

      {/* Encabezado */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={fd.head} className="r-main2">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className={"badge " + TIPO_NCF[f.tipo].cls} style={{ height: 24 }}>{TIPO_NCF[f.tipo].short} · {TIPO_NCF[f.tipo].label}</span>
              <span className={"badge " + ECF_META[f.ecf].cls}><span className="dot" />{ECF_META[f.ecf].label}</span>
              {f.anulada && <span className="badge badge-red">Anulada</span>}
            </div>
            <h2 style={{ margin: "12px 0 2px", fontSize: 26, fontWeight: 800, letterSpacing: "-.5px" }} className="mono">{f.ncf || "Borrador"}</h2>
            <div style={{ fontSize: 14, color: "var(--ink-500)" }}>{f.cliente}{f.rnc ? " · RNC " + f.rnc : ""} · {f.fecha}</div>
            {f.trackId && <div style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 3 }}>TrackID DGII: <span className="mono">{f.trackId}</span></div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12.5, color: "var(--ink-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>Total</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "var(--blue-700)", letterSpacing: "-1px" }} className="tnum">{money0(c.total)}</div>
            <span className={"badge " + (pagada ? "badge-green" : "badge-red")} style={{ marginTop: 6 }}>{pagada ? "Pagada" : c.cobrado > 0 ? "Cobro parcial" : "Por cobrar"}</span>
          </div>
        </div>

        {/* Banner rechazo DGII */}
        {f.ecf === "rechazado" && !f.anulada && (
          <div style={fd.rejectBar}>
            <span style={{ ...fd.rejectIcon }}><Icon name="alert" size={18} color="#fff" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "var(--red-ink)" }}>Rechazada por la DGII</div>
              <div style={{ fontSize: 13, color: "var(--red-ink)", marginTop: 3, lineHeight: 1.45 }}>{f.motivoRechazo}</div>
            </div>
            <button className="btn btn-sm" style={{ background: "var(--red)", color: "#fff", flexShrink: 0 }} onClick={reintentar}><Icon name="send" size={15} /> Reintentar envío</button>
          </div>
        )}

        {/* Acciones */}
        <div style={fd.actionsBar}>
          <button className="btn btn-ghost btn-sm" onClick={() => { if (f.id && window.KlikaData) window.open(KlikaData.facturas.pdf(f.id)); }}><Icon name="download" size={16} /> Descargar PDF</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setXmlOpen(true)}><Icon name="quote" size={15} /> Ver XML</button>
          {!f.anulada && <button className="btn btn-sm" style={{ background: "var(--red-bg)", color: "var(--red-ink)" }} onClick={() => setAnularOpen(true)}><Icon name="x" size={15} /> Anular factura</button>}
        </div>
      </div>

      <div style={fd.grid} className="r-main">
        {/* Items + totales */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={fd.cardHead}>Detalle de items</div>
            <div style={{ overflowX: "auto" }}>
              <table style={fd.table}>
                <thead>
                  <tr>
                    <th style={fd.th}>Descripción</th>
                    <th style={{ ...fd.th, textAlign: "right" }}>Cant.</th>
                    <th style={{ ...fd.th, textAlign: "right" }}>P. unit.</th>
                    <th style={{ ...fd.th, textAlign: "center" }}>ITBIS</th>
                    <th style={{ ...fd.th, textAlign: "right" }}>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {f.items.map((it, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--ink-100)" }}>
                      <td style={fd.td}><div style={{ fontWeight: 500 }}>{it.desc}</div></td>
                      <td style={{ ...fd.td, textAlign: "right" }} className="tnum">{it.cant} <span style={{ color: "var(--ink-400)", fontSize: 12 }}>{it.unidad}</span></td>
                      <td style={{ ...fd.td, textAlign: "right" }} className="tnum">{money0(it.precio)}</td>
                      <td style={{ ...fd.td, textAlign: "center", color: "var(--ink-400)", fontSize: 12.5 }}>{it.itbis ? it.itbis + "%" : "Exento"}</td>
                      <td style={{ ...fd.td, textAlign: "right", fontWeight: 700 }} className="tnum">{money0(it.cant * it.precio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "14px 18px", borderTop: "1px solid var(--ink-100)", display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: "min(320px, 100%)" }}>
                <Row k="Subtotal" v={money(c.sub)} />
                {c.desc > 0 && <Row k="Descuento" v={"− " + money(c.desc)} red />}
                <Row k="Base imponible" v={money(c.base)} muted />
                <Row k="ITBIS (18%)" v={money(c.itbis)} />
                <div style={{ height: 1, background: "var(--ink-100)", margin: "6px 0" }} />
                <Row k="Total" v={money(c.total)} big />
              </div>
            </div>
          </div>

          {obra && (
            <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--blue-50)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="roof" size={18} color="var(--blue-700)" /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--ink-400)" }}>Obra asociada</div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}><span className="mono">{obra.id}</span> · {obra.titulo}</div>
              </div>
            </div>
          )}
        </div>

        {/* Cobro / pagos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)" }}>Cobro</div>
              <div style={{ fontSize: 12, color: "var(--ink-400)" }}>{Math.round(cobroPct)}%</div>
            </div>
            <div style={fd.track}><div style={{ ...fd.fill, width: cobroPct + "%", background: pagada ? "var(--green)" : "var(--blue-600)" }} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9 }}>
              <div><div style={{ fontSize: 11, color: "var(--ink-400)" }}>Cobrado</div><div style={{ fontWeight: 700, fontSize: 15, color: "var(--green-ink)" }} className="tnum">{money0(c.cobrado)}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: "var(--ink-400)" }}>Pendiente</div><div style={{ fontWeight: 700, fontSize: 15, color: c.pendiente > 0 ? "var(--red)" : "var(--ink-400)" }} className="tnum">{money0(c.pendiente)}</div></div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ ...fd.cardHead, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Pagos registrados</span>
              {!f.anulada && <button className="btn btn-soft btn-sm" onClick={() => setPagoOpen(true)}><Icon name="plus" size={14} /> Registrar pago</button>}
            </div>
            <div style={{ padding: "4px 0" }}>
              {(f.pagos || []).length === 0 && <div style={{ padding: "18px", textAlign: "center", color: "var(--ink-400)", fontSize: 13 }}>Aún no hay pagos registrados.</div>}
              {(f.pagos || []).map((p, i) => (
                <div key={i} style={fd.pagoRow}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green-bg)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="money" size={16} color="var(--green-ink)" /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }} className="tnum">{money0(p.monto)}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-400)" }}>{p.metodo} · {p.fecha}{p.ref ? " · " + p.ref : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {pagoOpen && <PagoModal max={c.pendiente} onClose={() => setPagoOpen(false)} onSave={registrarPago} />}
      {anularOpen && <AnularModal ncf={f.ncf} onClose={() => setAnularOpen(false)} onConfirm={anular} />}
      {xmlOpen && <XmlModal factura={f} calc={c} onClose={() => setXmlOpen(false)} />}
    </div>
  );
}

function Row({ k, v, red, muted, big }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: big ? "4px 0" : "5px 0", fontSize: big ? 17 : 13.5, fontWeight: big ? 800 : 500, color: muted ? "var(--ink-500)" : "var(--ink-800)" }}>
      <span>{k}</span>
      <span className="tnum" style={{ color: red ? "var(--red)" : big ? "var(--blue-700)" : "inherit", fontWeight: big ? 800 : 600 }}>{v}</span>
    </div>
  );
}

// ---- Modal: registrar pago ----
function PagoModal({ max, onClose, onSave }) {
  const [monto, setMonto] = useStateFD(Math.round(max) || 0);
  const [metodo, setMetodo] = useStateFD(window.METODOS_PAGO[1]);
  const [ref, setRef] = useStateFD("");
  const [fecha, setFecha] = useStateFD("01 jun 2026");
  return (
    <div style={fd.scrim} onClick={onClose}>
      <div className="card fade-up" style={{ width: "min(440px,100%)", padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Registrar pago</h3>
          <button onClick={onClose} style={fd.xBtn}><Icon name="x" size={18} color="var(--ink-400)" /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div className="field"><label>Monto</label><input type="number" className="input input-sm" value={monto} onChange={(e) => setMonto(+e.target.value)} /><div style={{ fontSize: 11.5, color: "var(--ink-400)", marginTop: 5 }}>Pendiente: {money0(max)}</div></div>
          <div className="field"><label>Método de pago</label>
            <select className="input input-sm" value={metodo} onChange={(e) => setMetodo(e.target.value)}>{window.METODOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          </div>
          <div className="field"><label>Referencia <span style={{ color: "var(--ink-400)", fontWeight: 500 }}>· opcional</span></label><input className="input input-sm" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="No. transferencia / cheque" /></div>
          <div className="field"><label>Fecha</label><input className="input input-sm" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
        </div>
        <div style={{ display: "flex", gap: 9, marginTop: 18 }}>
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={!monto || monto <= 0} onClick={() => onSave({ monto, metodo, ref, fecha })}>Guardar pago</button>
        </div>
      </div>
    </div>
  );
}

// ---- Modal: anular factura (confirmación + motivo) ----
function AnularModal({ ncf, onClose, onConfirm }) {
  const [motivo, setMotivo] = useStateFD("");
  return (
    <div style={fd.scrim} onClick={onClose}>
      <div className="card fade-up" style={{ width: "min(460px,100%)", padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--red-bg)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="alert" size={20} color="var(--red)" /></span>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Anular factura</h3>
            <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 3 }}>Vas a anular <span className="mono" style={{ fontWeight: 600 }}>{ncf}</span>. Esta acción se notifica a la DGII y no se puede deshacer.</div>
          </div>
        </div>
        <div className="field"><label>Motivo de anulación <span style={{ color: "var(--red)" }}>*</span></label>
          <textarea className="input" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. Error en el RNC del cliente / factura duplicada…" style={{ height: 84, padding: "10px 14px", resize: "vertical", lineHeight: 1.45 }} />
        </div>
        <div style={{ display: "flex", gap: 9, marginTop: 18 }}>
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Cancelar</button>
          <button className="btn" style={{ flex: 1, justifyContent: "center", background: "var(--red)", color: "#fff" }} disabled={!motivo.trim()} onClick={() => onConfirm(motivo.trim())}>Anular factura</button>
        </div>
      </div>
    </div>
  );
}

// ---- Modal: ver XML (e-CF) ----
function XmlModal({ factura: f, calc, onClose }) {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<ECF xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
    '  <Encabezado>',
    '    <Version>1.0</Version>',
    '    <IdDoc>',
    '      <TipoeCF>' + f.tipo + '</TipoeCF>',
    '      <eNCF>' + (f.ncf || "—") + '</eNCF>',
    '      <FechaVencimientoSecuencia>31-12-2026</FechaVencimientoSecuencia>',
    '    </IdDoc>',
    '    <Emisor>',
    '      <RNCEmisor>1-31-00874-5</RNCEmisor>',
    '      <RazonSocialEmisor>TECHOS ESTRELLA SRL</RazonSocialEmisor>',
    '    </Emisor>',
    '    <Comprador>',
    '      <RNCComprador>' + (f.rnc || "—") + '</RNCComprador>',
    '      <RazonSocialComprador>' + f.cliente + '</RazonSocialComprador>',
    '    </Comprador>',
    '    <Totales>',
    '      <MontoGravadoTotal>' + calc.base.toFixed(2) + '</MontoGravadoTotal>',
    '      <TotalITBIS>' + calc.itbis.toFixed(2) + '</TotalITBIS>',
    '      <MontoTotal>' + calc.total.toFixed(2) + '</MontoTotal>',
    '    </Totales>',
    '  </Encabezado>',
    '</ECF>',
  ].join("\n");
  return (
    <div style={fd.scrim} onClick={onClose}>
      <div className="card fade-up" style={{ width: "min(620px,100%)", padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>XML del e-CF</h3>
          <button onClick={onClose} style={fd.xBtn}><Icon name="x" size={18} color="var(--ink-400)" /></button>
        </div>
        <pre style={fd.xml}>{xml}</pre>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

const fd = {
  page: { padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 1320, margin: "0 auto" },
  head: { display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: "22px 24px", alignItems: "start" },
  rejectBar: { display: "flex", alignItems: "center", gap: 13, padding: "14px 24px", background: "var(--red-bg)", borderTop: "1px solid color-mix(in srgb, var(--red) 22%, transparent)" },
  rejectIcon: { width: 34, height: 34, borderRadius: 9, background: "var(--red)", display: "grid", placeItems: "center", flexShrink: 0 },
  actionsBar: { display: "flex", gap: 9, flexWrap: "wrap", padding: "13px 24px", borderTop: "1px solid var(--ink-100)", background: "var(--surface-2)" },
  grid: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, alignItems: "start" },
  cardHead: { fontSize: 13, fontWeight: 700, color: "var(--ink-700)", padding: "14px 18px", borderBottom: "1px solid var(--ink-100)" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 460 },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".4px", padding: "11px 14px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)", whiteSpace: "nowrap" },
  td: { padding: "11px 14px", fontSize: 13.5, verticalAlign: "middle" },
  track: { height: 9, background: "var(--ink-100)", borderRadius: 99, overflow: "hidden", marginTop: 9 },
  fill: { height: "100%", borderRadius: 99, transition: "width .3s" },
  pagoRow: { display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: "1px solid var(--ink-100)" },
  scrim: { position: "fixed", inset: 0, background: "rgba(20,22,26,.42)", zIndex: 60, display: "grid", placeItems: "center", padding: 20 },
  xBtn: { border: "none", background: "transparent", width: 30, height: 30, borderRadius: 7, display: "grid", placeItems: "center", cursor: "pointer" },
  xml: { margin: 0, padding: 16, background: "var(--ink-900)", color: "#D8DEE9", borderRadius: 10, fontSize: 12, lineHeight: 1.55, fontFamily: "var(--font-mono)", overflowX: "auto", maxHeight: 360, whiteSpace: "pre" },
};

Object.assign(window, { FacturaDetalle });
