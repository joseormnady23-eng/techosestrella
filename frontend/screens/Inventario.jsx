/* global React, Icon, MATERIALES, money0, useKlikaStore, BarcodeSVG, imprimirEtiqueta, ROLES */
// ============================================================
//  Pantalla 7 · Inventario
//  + Códigos de barra  + Aprobaciones de cambios sensibles
// ============================================================
const { useState: useStateInv, useEffect: useEffectInv } = React;

const MOVIMIENTOS = [
  { id: 1, fecha: "30 may", tipo: "salida", mat: "Membrana acrílica blanca", cant: -6, obra: "OB-2403", quien: "Pedro Núñez" },
  { id: 2, fecha: "29 may", tipo: "entrada", mat: "Manto asfáltico 4mm", cant: +12, obra: "Compra · Ferr. Pérez", quien: "Yokasta P." },
  { id: 3, fecha: "28 may", tipo: "salida", mat: "Primer / sellador de poros", cant: -4, obra: "OB-2401", quien: "José Ramírez" },
  { id: 4, fecha: "27 may", tipo: "ajuste", mat: "Cinta de refuerzo", cant: -2, obra: "Merma / daño", quien: "Frank Disla" },
  { id: 5, fecha: "26 may", tipo: "salida", mat: "Membrana acrílica roja", cant: -3, obra: "OB-2406", quien: "Frank Disla" },
];

function Inventario({ role }) {
  const store = useKlikaStore();
  const mats = store.materiales;
  const CAMPOS = store.CAMPOS_SENSIBLES;
  const esDueno = role === "dueno";
  const nombreUsuario = (ROLES[role] && ROLES[role].nombre) || "Usuario";

  const [vista, setVista] = useStateInv(() => store.consumirFocoSolicitudes() ? "solicitudes" : "inventario");
  const [cat, setCat] = useStateInv("todas");
  const [estado, setEstado] = useStateInv("todos"); // todos | bajo | ok
  const [modal, setModal] = useStateInv(false);
  const [movTipo, setMovTipo] = useStateInv("entrada");
  const [movs, setMovs] = useStateInv(MOVIMIENTOS);
  const [mov, setMov] = useStateInv({ matId: mats[0].id, cant: "", ref: "", nota: "" });
  const [prodModal, setProdModal] = useStateInv(false);
  const [nuevo, setNuevo] = useStateInv({ nombre: "", cat: "", unidad: "", rend: "", stock: "", min: "", precio: "" });
  const [barcodeMat, setBarcodeMat] = useStateInv(null);      // material para modal de código
  const [reqCtx, setReqCtx] = useStateInv(null);              // { mat, campo } para modal de solicitud
  const [rejectId, setRejectId] = useStateInv(null);          // id de solicitud a rechazar
  const [scanFeed, setScanFeed] = useStateInv("");            // texto de búsqueda por código en movimiento
  const [toast, setToast] = useStateInv(null);

  function flash(msg, tone) { setToast({ msg, tone }); setTimeout(() => setToast(null), 2600); }

  const cats = ["todas", ...new Set(mats.map((m) => m.cat))];
  const lista = mats.filter((m) => (cat === "todas" || m.cat === cat)
    && (estado === "todos" || (estado === "bajo" ? m.stock < m.min : m.stock >= m.min)));
  const bajos = mats.filter((m) => m.stock < m.min).length;
  const pendientes = store.pendientes();

  function setFieldDirecto(id, key, val) { store.setCampoDirecto(id, key, val); }

  function guardarProducto() {
    if (!nuevo.nombre.trim()) return;
    const id = "M-" + String(mats.length + 1).padStart(2, "0");
    store.agregarMaterial({
      id, nombre: nuevo.nombre.trim(), cat: nuevo.cat.trim() || "Sin categoría",
      unidad: nuevo.unidad.trim() || "unidad", rend: +nuevo.rend || 0,
      stock: +nuevo.stock || 0, min: +nuevo.min || 0, precio: +nuevo.precio || 0,
    });
    setNuevo({ nombre: "", cat: "", unidad: "", rend: "", stock: "", min: "", precio: "" });
    setProdModal(false);
    flash("Producto agregado al inventario", "ok");
  }

  function guardarMovimiento() {
    const material = mats.find((m) => m.id === mov.matId);
    const cantNum = Math.abs(+mov.cant) || 0;
    if (!material || !cantNum) return;
    const delta = movTipo === "entrada" ? cantNum : movTipo === "salida" ? -cantNum : (+mov.cant || 0);
    store.setStock(material.id, material.stock + delta);
    setMovs((arr) => [{
      id: Date.now(), fecha: "hoy", tipo: movTipo, mat: material.nombre, cant: delta,
      obra: mov.ref || (movTipo === "entrada" ? "Compra" : movTipo === "ajuste" ? "Ajuste" : "Salida"),
      quien: nombreUsuario,
    }, ...arr]);
    setMov({ matId: mats[0].id, cant: "", ref: "", nota: "" });
    setScanFeed("");
    setModal(false);
    flash("Movimiento registrado", "ok");
  }

  // Búsqueda por código en el formulario de movimiento
  function buscarPorCodigo(code) {
    setScanFeed(code);
    const limpio = code.replace(/\s+/g, "");
    if (limpio.length >= 8) {
      const m = store.matPorCodigo(limpio);
      if (m) setMov((prev) => ({ ...prev, matId: m.id }));
    }
  }
  // Simula un escaneo (toma un material con código al azar)
  function simularEscaneo() {
    const conCodigo = mats.filter((m) => store.codigoDe(m.id));
    if (!conCodigo.length) return;
    const m = conCodigo[Math.floor(Math.random() * conCodigo.length)];
    const code = store.codigoDe(m.id);
    setScanFeed(code);
    setMov((prev) => ({ ...prev, matId: m.id }));
  }

  const matSeleccionado = mats.find((m) => m.id === mov.matId);

  function abrirSolicitud(mat, campo) { setReqCtx({ mat, campo, propuesto: String(mat[campo]), motivo: "" }); }

  return (
    <div style={iv.page} className="r-page">
      {/* resumen */}
      <div style={iv.summary} className="r-grid4">
        <SumCard label="Materiales" value={mats.length} icon="inventory" color="var(--star-blue)" />
        <SumCard label="Bajo mínimo" value={bajos} icon="alert" color="var(--star-red)" alert />
        <SumCard label="Categorías" value={cats.length - 1} icon="layers" color="var(--star-purple)" />
        <SumCard label="Pendientes de aprobación" value={pendientes.length} icon="shield" color="var(--star-orange)" alert />
      </div>

      {/* tabs de vista */}
      <div style={iv.tabs}>
        <button onClick={() => setVista("inventario")} style={{ ...iv.tab, ...(vista === "inventario" ? iv.tabOn : {}) }}>
          <Icon name="inventory" size={16} /> Materiales
        </button>
        <button onClick={() => setVista("solicitudes")} style={{ ...iv.tab, ...(vista === "solicitudes" ? iv.tabOn : {}) }}>
          <Icon name="shield" size={16} /> Solicitudes de cambio
          {pendientes.length > 0 && <span style={iv.tabCount}>{pendientes.length}</span>}
        </button>
      </div>

      {vista === "inventario" ? (
        <React.Fragment>
          <div style={iv.toolbar}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {cats.map((c) => (
                <button key={c} className={"chip" + (cat === c ? " active" : "")} onClick={() => setCat(c)}>{c === "todas" ? "Todas" : c}</button>
              ))}
            </div>
            <div style={iv.segmented}>
              {[["todos", "Todos"], ["bajo", "Bajo mínimo"], ["ok", "OK"]].map(([k, l]) => (
                <button key={k} onClick={() => setEstado(k)} style={{ ...iv.segBtn, ...(estado === k ? iv.segOn : {}) }}>{l}</button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => setModal(true)}><Icon name="plus" size={17} /> Registrar movimiento</button>
            {esDueno && <button className="btn btn-ghost" onClick={() => setProdModal(true)}><Icon name="plus" size={17} /> Agregar producto</button>}
          </div>

          <div style={iv.cols} className="r-main">
            {/* tabla de materiales */}
            <div className="card r-tcard" style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={iv.table} className="r-table">
                  <thead><tr>
                    <th style={iv.th}>Material</th><th style={iv.th}>Categoría</th>
                    <th style={iv.th}>Código</th>
                    <th style={{ ...iv.th, textAlign: "right" }}>Stock</th><th style={{ ...iv.th, textAlign: "right" }}>Mínimo</th>
                    <th style={iv.th}>Unidad</th><th style={{ ...iv.th, textAlign: "right" }}>Rend.</th>
                    <th style={{ ...iv.th, textAlign: "right" }}>Precio</th>
                    <th style={iv.th} className="r-hide-narrow"></th>
                  </tr></thead>
                  <tbody>
                    {lista.map((m) => {
                      const bajo = m.stock < m.min;
                      const code = store.codigoDe(m.id);
                      return (
                        <tr key={m.id} style={{ borderBottom: "1px solid var(--ink-100)" }}>
                          <td style={iv.td}><span style={{ fontWeight: 600 }}>{m.nombre}</span></td>
                          <td style={{ ...iv.td, color: "var(--ink-500)", fontSize: 13 }}>{m.cat}</td>
                          {/* Código de barras */}
                          <td style={iv.td}>
                            {code ? (
                              <button onClick={() => setBarcodeMat(m)} style={iv.codeBtn} title="Ver código de barras">
                                <Icon name="barcode" size={16} color="var(--ink-700)" />
                                <span className="mono" style={{ fontSize: 12.5 }}>{code}</span>
                              </button>
                            ) : (
                              <button className="btn btn-soft btn-sm" onClick={() => { store.generarCodigo(m.id); flash("Código generado", "ok"); }}>
                                <Icon name="plus" size={14} /> Generar
                              </button>
                            )}
                          </td>
                          <td style={{ ...iv.td, textAlign: "right" }}>
                            <span className="tnum" style={{ fontWeight: 800, fontSize: 15, color: bajo ? "var(--red)" : "var(--ink-900)" }}>{m.stock}</span>
                          </td>
                          {/* Mínimo */}
                          <td style={{ ...iv.td, textAlign: "right" }} className="tnum">
                            {esDueno
                              ? <input type="number" value={m.min} onChange={(e) => setFieldDirecto(m.id, "min", +e.target.value)} style={iv.rendInput} className="tnum" />
                              : <SensCell mat={m} campo="min" sufijo="" store={store} onPedir={() => abrirSolicitud(m, "min")} />}
                          </td>
                          <td style={{ ...iv.td, fontSize: 13, color: "var(--ink-500)" }}>{m.unidad}</td>
                          {/* Rendimiento */}
                          <td style={{ ...iv.td, textAlign: "right", color: "var(--ink-500)" }} className="tnum">
                            {esDueno ? (
                              <span style={iv.rendCell}>
                                <input type="number" step="0.5" value={m.rend} onChange={(e) => setFieldDirecto(m.id, "rend", +e.target.value)} style={iv.rendInput} className="tnum" />
                                <span style={{ fontSize: 12, color: "var(--ink-400)" }}>m²</span>
                              </span>
                            ) : <SensCell mat={m} campo="rend" sufijo=" m²" store={store} onPedir={() => abrirSolicitud(m, "rend")} />}
                          </td>
                          {/* Precio */}
                          <td style={{ ...iv.td, textAlign: "right" }}>
                            {esDueno ? (
                              <span style={iv.rendCell}>
                                <span style={{ fontSize: 12, color: "var(--ink-400)" }}>RD$</span>
                                <input type="number" value={m.precio} onChange={(e) => setFieldDirecto(m.id, "precio", +e.target.value)} style={{ ...iv.rendInput, width: 66 }} className="tnum" />
                              </span>
                            ) : <SensCell mat={m} campo="precio" prefijo="RD$ " store={store} onPedir={() => abrirSolicitud(m, "precio")} />}
                          </td>
                          <td style={{ ...iv.td, textAlign: "right" }} className="r-hide-narrow">
                            <span style={{ display: "inline-flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                              {bajo ? <span className="badge badge-red"><span className="dot" />Bajo</span> : <span className="badge badge-green"><span className="dot" />OK</span>}
                              {m._updated && <span className="badge badge-blue fade-in" style={{ animation: "fadeIn .3s ease both" }}>Actualizado</span>}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* historial */}
            <aside className="card" style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
              <div style={iv.histHead}><Icon name="clock" size={16} color="var(--ink-500)" /> Historial de movimientos</div>
              {movs.map((mv) => (
                <div key={mv.id} style={iv.movRow}>
                  <span style={{ ...iv.movIcon, background: mv.tipo === "entrada" ? "var(--green-bg)" : mv.tipo === "salida" ? "var(--blue-50)" : "var(--amber-bg)" }}>
                    <Icon name={mv.tipo === "entrada" ? "arrowdown" : mv.tipo === "salida" ? "arrowup" : "swap"} size={14}
                      color={mv.tipo === "entrada" ? "var(--green)" : mv.tipo === "salida" ? "var(--blue-600)" : "var(--amber)"} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mv.mat}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-400)" }}>{mv.obra} · {mv.quien}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="tnum" style={{ fontWeight: 700, fontSize: 13.5, color: mv.cant > 0 ? "var(--green-ink)" : "var(--ink-700)" }}>{mv.cant > 0 ? "+" : ""}{mv.cant}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-400)" }}>{mv.fecha}</div>
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </React.Fragment>
      ) : (
        <SolicitudesView store={store} esDueno={esDueno} role={role}
          onAprobar={(id) => { store.aprobarSolicitud(id); flash("Cambio aprobado y aplicado", "ok"); }}
          onRechazar={(id) => setRejectId(id)} />
      )}

      {/* ===== modal registrar movimiento ===== */}
      {modal && (
        <div style={iv.overlay} onClick={() => setModal(false)}>
          <div style={iv.modal} onClick={(e) => e.stopPropagation()} className="fade-up">
            <div style={iv.modalHead}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Registrar movimiento</h3>
              <button className="btn btn-icon btn-quiet btn-sm" onClick={() => setModal(false)}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={iv.typeSel}>
                {[["entrada", "Entrada", "arrowdown"], ["salida", "Salida", "arrowup"], ["ajuste", "Ajuste", "swap"]].map(([k, l, ic]) => (
                  <button key={k} onClick={() => setMovTipo(k)} style={{ ...iv.typeBtn, ...(movTipo === k ? iv.typeOn : {}) }}>
                    <Icon name={ic} size={16} /> {l}
                  </button>
                ))}
              </div>

              {/* Búsqueda por código de barras */}
              <div className="field">
                <label>Buscar por código de barras</label>
                <div style={iv.scanRow}>
                  <Icon name="barcode" size={18} color="var(--ink-400)" />
                  <input className="input" style={{ border: "none", height: 40, paddingLeft: 8, flex: 1, boxShadow: "none" }}
                    placeholder="Escribe o escanea el código…" value={scanFeed}
                    onChange={(e) => buscarPorCodigo(e.target.value)} />
                  <button type="button" onClick={simularEscaneo} style={iv.scanBtn} title="Escanear con cámara">📷</button>
                </div>
                {scanFeed && (store.matPorCodigo(scanFeed.replace(/\s+/g, ""))
                  ? <span style={iv.scanOk}><Icon name="checkcircle" size={14} color="var(--green)" /> {store.matPorCodigo(scanFeed.replace(/\s+/g, "")).nombre}</span>
                  : (scanFeed.replace(/\s+/g, "").length >= 8 && <span style={iv.scanNo}><Icon name="alert" size={14} color="var(--amber)" /> Código no encontrado</span>))}
              </div>

              <div className="field"><label>Material</label>
                <select className="input" value={mov.matId} onChange={(e) => setMov({ ...mov, matId: e.target.value })}>
                  {mats.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
                {matSeleccionado && <span style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 5 }}>Stock actual: <strong className="tnum">{matSeleccionado.stock}</strong> {matSeleccionado.unidad}</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="r-form2">
                <div className="field"><label>Cantidad{movTipo === "ajuste" ? " (+/−)" : ""}</label><input className="input" type="number" placeholder="0" value={mov.cant} onChange={(e) => setMov({ ...mov, cant: e.target.value })} /></div>
                <div className="field"><label>{movTipo === "salida" ? "Obra / destino" : "Referencia"}</label><input className="input" placeholder={movTipo === "salida" ? "OB-2401" : "Compra, proveedor…"} value={mov.ref} onChange={(e) => setMov({ ...mov, ref: e.target.value })} /></div>
              </div>
              <div className="field"><label>Motivo / nota (opcional)</label><input className="input" placeholder="Detalle del movimiento" value={mov.nota} onChange={(e) => setMov({ ...mov, nota: e.target.value })} /></div>
            </div>
            <div style={iv.modalFoot}>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" disabled={!mov.cant} onClick={guardarMovimiento}><Icon name="check" size={16} /> Guardar movimiento</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== modal agregar producto ===== */}
      {prodModal && (
        <div style={iv.overlay} onClick={() => setProdModal(false)}>
          <div style={iv.modal} onClick={(e) => e.stopPropagation()} className="fade-up">
            <div style={iv.modalHead}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Agregar producto</h3>
              <button className="btn btn-icon btn-quiet btn-sm" onClick={() => setProdModal(false)}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field"><label>Nombre del producto</label>
                <input className="input" placeholder="Ej. Membrana acrílica gris" value={nuevo.nombre}
                  onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="r-form2">
                <div className="field"><label>Categoría</label>
                  <input className="input" list="cats-list" placeholder="Impermeabilizante…" value={nuevo.cat}
                    onChange={(e) => setNuevo({ ...nuevo, cat: e.target.value })} />
                  <datalist id="cats-list">{cats.filter((c) => c !== "todas").map((c) => <option key={c} value={c} />)}</datalist>
                </div>
                <div className="field"><label>Unidad</label>
                  <input className="input" placeholder="cubeta 5gal" value={nuevo.unidad}
                    onChange={(e) => setNuevo({ ...nuevo, unidad: e.target.value })} /></div>
              </div>
              <div className="field">
                <label>Rendimiento (m² por unidad)</label>
                <input className="input" type="number" step="0.5" placeholder="9" value={nuevo.rend}
                  onChange={(e) => setNuevo({ ...nuevo, rend: e.target.value })} />
                <span style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 5 }}>Cuántos m² cubre una unidad. Klika lo usa para calcular las cantidades en cotizaciones.</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="r-form3">
                <div className="field"><label>Stock</label>
                  <input className="input" type="number" placeholder="0" value={nuevo.stock}
                    onChange={(e) => setNuevo({ ...nuevo, stock: e.target.value })} /></div>
                <div className="field"><label>Mínimo</label>
                  <input className="input" type="number" placeholder="0" value={nuevo.min}
                    onChange={(e) => setNuevo({ ...nuevo, min: e.target.value })} /></div>
                <div className="field"><label>Precio (RD$)</label>
                  <input className="input" type="number" placeholder="0" value={nuevo.precio}
                    onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })} /></div>
              </div>
            </div>
            <div style={iv.modalFoot}>
              <button className="btn btn-ghost" onClick={() => setProdModal(false)}>Cancelar</button>
              <button className="btn btn-primary" disabled={!nuevo.nombre.trim()} onClick={guardarProducto}><Icon name="check" size={16} /> Guardar producto</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== modal código de barras ===== */}
      {barcodeMat && (
        <BarcodeModal mat={barcodeMat} store={store} onClose={() => setBarcodeMat(null)} onCopy={() => flash("Código copiado", "ok")} esDueno={esDueno} />
      )}

      {/* ===== modal solicitar cambio ===== */}
      {reqCtx && (
        <RequestModal ctx={reqCtx} setCtx={setReqCtx} campos={CAMPOS}
          onClose={() => setReqCtx(null)}
          onEnviar={() => {
            store.crearSolicitud({
              matId: reqCtx.mat.id, campo: reqCtx.campo, propuesto: +reqCtx.propuesto,
              motivo: reqCtx.motivo, solicitadoPor: nombreUsuario, rol,
            });
            setReqCtx(null);
            flash("Solicitud enviada al dueño", "ok");
          }} />
      )}

      {/* ===== modal rechazar solicitud ===== */}
      {rejectId && (
        <RejectModal onClose={() => setRejectId(null)}
          onRechazar={(motivo) => { store.rechazarSolicitud(rejectId, motivo); setRejectId(null); flash("Solicitud rechazada", "warn"); }} />
      )}

      {toast && (
        <div style={{ ...iv.toast, background: toast.tone === "warn" ? "var(--amber-ink)" : "var(--ink-900)" }} className="fade-up">
          <Icon name={toast.tone === "warn" ? "alert" : "checkcircle"} size={17} color="#fff" /> {toast.msg}
        </div>
      )}
    </div>
  );
}

// ---- Celda sensible (no-dueño): muestra valor + lápiz, o estado pendiente ----
function SensCell({ mat, campo, prefijo = "", sufijo = "", store, onPedir }) {
  const pend = store.pendienteDe(mat.id, campo);
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
      <button onClick={onPedir} style={iv.sensBtn} title="Solicitar cambio (requiere aprobación)">
        <span className="tnum" style={{ color: "var(--ink-700)" }}>{prefijo}{mat[campo]}{sufijo}</span>
        <Icon name="edit" size={13} color="var(--ink-300)" />
      </button>
      {pend && <span style={iv.pendPill} title={`Cambio propuesto: ${pend.propuesto}`}><Icon name="clock" size={11} color="var(--amber-ink)" /> pendiente</span>}
    </span>
  );
}

// ---- Modal de código de barras ----
function BarcodeModal({ mat, store, onClose, onCopy, esDueno }) {
  const code = store.codigoDe(mat.id);
  function copiar() {
    if (navigator.clipboard) navigator.clipboard.writeText(code).then(onCopy, onCopy);
    else { const t = document.createElement("textarea"); t.value = code; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); onCopy(); }
  }
  return (
    <div style={iv.overlay} onClick={onClose}>
      <div style={{ ...iv.modal, maxWidth: 430 }} onClick={(e) => e.stopPropagation()} className="fade-up">
        <div style={iv.modalHead}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Código de barras</h3>
          <button className="btn btn-icon btn-quiet btn-sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px" }}>{mat.cat}</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>{mat.nombre}</div>
          </div>
          <div style={iv.barcodeStage}>
            <BarcodeSVG code={code} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 2px" }}>
            <span style={{ fontSize: 12.5, color: "var(--ink-400)", fontWeight: 600 }}>Precio unitario</span>
            <span className="tnum" style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.5px" }}>{money0(mat.precio)}</span>
          </div>
        </div>
        <div style={iv.modalFoot}>
          <button className="btn btn-ghost" onClick={copiar}><Icon name="copy" size={16} /> Copiar código</button>
          <button className="btn btn-primary" onClick={() => imprimirEtiqueta(mat, code)}><Icon name="printer" size={16} /> Imprimir etiqueta</button>
        </div>
      </div>
    </div>
  );
}

// ---- Modal de solicitud de cambio ----
function RequestModal({ ctx, setCtx, campos, onClose, onEnviar }) {
  const meta = campos[ctx.campo];
  const valido = ctx.propuesto !== "" && +ctx.propuesto !== ctx.mat[ctx.campo];
  return (
    <div style={iv.overlay} onClick={onClose}>
      <div style={{ ...iv.modal, maxWidth: 440 }} onClick={(e) => e.stopPropagation()} className="fade-up">
        <div style={iv.modalHead}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Solicitar cambio</h3>
          <button className="btn btn-icon btn-quiet btn-sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={iv.approvalNote}>
            <span style={{ ...iv.movIcon, background: "var(--amber-bg)", width: 34, height: 34 }}><Icon name="shield" size={17} color="var(--amber-ink)" /></span>
            <div style={{ fontSize: 13.5, lineHeight: 1.45 }}>Este cambio requiere aprobación del dueño. ¿Deseas enviar la solicitud?</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-500)" }}><strong>{ctx.mat.nombre}</strong> · {meta.label}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "end", gap: 12 }}>
            <div className="field"><label>Valor actual</label>
              <div style={iv.valorActual} className="tnum">{meta.fmt(ctx.mat[ctx.campo], ctx.mat)}</div>
            </div>
            <div style={{ paddingBottom: 12 }}><Icon name="chevright" size={18} color="var(--ink-300)" /></div>
            <div className="field"><label>Valor propuesto</label>
              <input className="input" type="number" step={ctx.campo === "rend" ? "0.5" : "1"} value={ctx.propuesto} autoFocus
                onChange={(e) => setCtx({ ...ctx, propuesto: e.target.value })} /></div>
          </div>
          <div className="field"><label>Motivo (opcional)</label>
            <textarea className="input" rows={2} style={{ height: "auto", padding: "10px 14px", resize: "vertical", lineHeight: 1.4 }}
              placeholder="¿Por qué propones este cambio?" value={ctx.motivo}
              onChange={(e) => setCtx({ ...ctx, motivo: e.target.value })} /></div>
        </div>
        <div style={iv.modalFoot}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!valido} onClick={onEnviar}><Icon name="send" size={16} /> Enviar solicitud</button>
        </div>
      </div>
    </div>
  );
}

// ---- Modal de rechazo (motivo obligatorio) ----
function RejectModal({ onClose, onRechazar }) {
  const [motivo, setMotivo] = useStateInv("");
  return (
    <div style={iv.overlay} onClick={onClose}>
      <div style={{ ...iv.modal, maxWidth: 420 }} onClick={(e) => e.stopPropagation()} className="fade-up">
        <div style={iv.modalHead}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Rechazar solicitud</h3>
          <button className="btn btn-icon btn-quiet btn-sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13.5, color: "var(--ink-500)", lineHeight: 1.45 }}>El motivo le llegará como notificación a quien solicitó el cambio.</div>
          <div className="field"><label>Motivo del rechazo <span style={{ color: "var(--red)" }}>*</span></label>
            <textarea className="input" rows={3} style={{ height: "auto", padding: "10px 14px", resize: "vertical", lineHeight: 1.4 }}
              placeholder="Ej. El precio del proveedor todavía no cambió oficialmente." value={motivo} autoFocus
              onChange={(e) => setMotivo(e.target.value)} /></div>
        </div>
        <div style={iv.modalFoot}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" style={{ background: "var(--red)" }} disabled={!motivo.trim()} onClick={() => onRechazar(motivo.trim())}>
            <Icon name="x" size={16} /> Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Vista: Solicitudes de cambio ----
function SolicitudesView({ store, esDueno, onAprobar, onRechazar }) {
  const reqs = store.requests;
  const CAMPOS = store.CAMPOS_SENSIBLES;
  const pend = reqs.filter((r) => r.estado === "pendiente");
  const resueltas = reqs.filter((r) => r.estado !== "pendiente");
  const estadoBadge = { pendiente: ["badge-amber", "Pendiente"], aprobada: ["badge-green", "Aprobada"], rechazada: ["badge-red", "Rechazada"] };

  function Row({ r }) {
    const m = store.materiales.find((x) => x.id === r.matId);
    const meta = CAMPOS[r.campo];
    return (
      <tr style={{ borderBottom: "1px solid var(--ink-100)" }}>
        <td style={iv.td}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.matNombre}</div><div style={{ fontSize: 11.5, color: "var(--ink-400)" }} className="mono">{r.id}</div></td>
        <td style={{ ...iv.td, fontSize: 13 }}>{meta.label}</td>
        <td style={{ ...iv.td, textAlign: "right" }} className="tnum"><span style={{ color: "var(--ink-500)" }}>{meta.fmt(r.actual, m)}</span></td>
        <td style={{ ...iv.td, textAlign: "right" }} className="tnum"><span style={{ fontWeight: 700, color: "var(--blue-700)" }}>{meta.fmt(r.propuesto, m)}</span></td>
        <td style={{ ...iv.td, fontSize: 13 }}>{r.solicitadoPor}</td>
        <td style={{ ...iv.td, fontSize: 12.5, color: "var(--ink-400)" }}>{r.fecha}</td>
        <td style={{ ...iv.td, fontSize: 12.5, color: "var(--ink-500)", maxWidth: 220 }}>
          {r.motivo || <span style={{ color: "var(--ink-300)" }}>—</span>}
          {r.motivoRechazo && <div style={{ marginTop: 4, color: "var(--red-ink)", fontSize: 11.5 }}><strong>Rechazo:</strong> {r.motivoRechazo}</div>}
        </td>
        <td style={{ ...iv.td, textAlign: "right" }}>
          {r.estado === "pendiente" && esDueno ? (
            <span style={{ display: "inline-flex", gap: 7, justifyContent: "flex-end" }}>
              <button className="btn btn-sm btn-soft" style={{ color: "var(--green-ink)", background: "var(--green-bg)" }} onClick={() => onAprobar(r.id)}><Icon name="check" size={15} /> Aprobar</button>
              <button className="btn btn-sm btn-ghost" onClick={() => onRechazar(r.id)}><Icon name="x" size={15} /> Rechazar</button>
            </span>
          ) : (
            <span className={"badge " + estadoBadge[r.estado][0]}><span className="dot" />{estadoBadge[r.estado][1]}</span>
          )}
        </td>
      </tr>
    );
  }

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {!esDueno && (
        <div style={iv.solHint}><Icon name="shield" size={15} color="var(--ink-400)" /> Tus solicitudes de cambio. Solo el dueño puede aprobarlas o rechazarlas.</div>
      )}
      {reqs.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "var(--ink-400)" }}>
          <Icon name="inbox" size={34} color="var(--ink-300)" />
          <div style={{ marginTop: 10, fontWeight: 600, color: "var(--ink-700)" }}>No hay solicitudes de cambio</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Los cambios de precio, mínimo o rendimiento que requieran aprobación aparecerán aquí.</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={iv.table}>
            <thead><tr>
              <th style={iv.th}>Material</th><th style={iv.th}>Campo</th>
              <th style={{ ...iv.th, textAlign: "right" }}>Valor actual</th><th style={{ ...iv.th, textAlign: "right" }}>Valor propuesto</th>
              <th style={iv.th}>Solicitado por</th><th style={iv.th}>Fecha</th><th style={iv.th}>Motivo</th>
              <th style={{ ...iv.th, textAlign: "right" }}>{esDueno ? "Acciones" : "Estado"}</th>
            </tr></thead>
            <tbody>
              {pend.map((r) => <Row key={r.id} r={r} />)}
              {resueltas.length > 0 && (
                <tr><td colSpan={8} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px", background: "var(--surface-2)" }}>Historial</td></tr>
              )}
              {resueltas.map((r) => <Row key={r.id} r={r} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SumCard({ label, value, icon, color, alert }) {
  return (
    <div className="card" style={{ padding: "15px 16px", display: "flex", alignItems: "center", gap: 13 }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: color + "1A", display: "grid", placeItems: "center" }}>
        <Icon name={icon} size={21} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, color: alert && value > 0 ? "var(--red)" : "var(--ink-900)" }} className="tnum">{value}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 3, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

const iv = {
  page: { padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 1320, margin: "0 auto" },
  summary: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 },
  tabs: { display: "flex", gap: 4, borderBottom: "1px solid var(--ink-100)", marginBottom: -2 },
  tab: { display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", border: "none", background: "transparent", color: "var(--ink-500)", fontWeight: 700, fontSize: 14, borderBottom: "2.5px solid transparent", marginBottom: -1 },
  tabOn: { color: "var(--ink-900)", borderBottomColor: "var(--blue-600)" },
  tabCount: { display: "inline-grid", placeItems: "center", minWidth: 20, height: 20, padding: "0 6px", borderRadius: 99, background: "var(--red)", color: "#fff", fontSize: 11.5, fontWeight: 800 },
  toolbar: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  segmented: { display: "flex", gap: 3, padding: 3, background: "var(--surface)", border: "1px solid var(--ink-200)", borderRadius: 9 },
  segBtn: { height: 30, padding: "0 12px", borderRadius: 6, border: "none", background: "transparent", color: "var(--ink-500)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" },
  segOn: { background: "var(--ink-900)", color: "#fff" },
  cols: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, alignItems: "start" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".4px", padding: "12px 9px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)", whiteSpace: "nowrap" },
  td: { padding: "12px 9px", fontSize: 14, verticalAlign: "middle" },
  rendCell: { display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" },
  rendInput: { width: 46, height: 30, border: "1px solid var(--ink-200)", borderRadius: 7, textAlign: "right", padding: "0 6px", fontSize: 13, fontVariantNumeric: "tabular-nums", outline: "none", background: "var(--surface)" },
  codeBtn: { display: "inline-flex", alignItems: "center", gap: 7, height: 30, padding: "0 10px", borderRadius: 7, border: "1px solid var(--ink-200)", background: "var(--surface)", color: "var(--ink-700)", cursor: "pointer", whiteSpace: "nowrap" },
  sensBtn: { display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 8px", borderRadius: 7, border: "1px dashed var(--ink-200)", background: "transparent", fontSize: 13, fontVariantNumeric: "tabular-nums", cursor: "pointer" },
  pendPill: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, color: "var(--amber-ink)", background: "var(--amber-bg)", padding: "2px 7px", borderRadius: 99 },
  histHead: { display: "flex", alignItems: "center", gap: 8, padding: "14px 15px", borderBottom: "1px solid var(--ink-100)", fontWeight: 700, fontSize: 14 },
  movRow: { display: "flex", alignItems: "center", gap: 11, padding: "11px 15px", borderBottom: "1px solid var(--ink-100)" },
  movIcon: { width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 },

  scanRow: { display: "flex", alignItems: "center", gap: 6, padding: "0 8px 0 12px", height: 44, border: "1px solid var(--ink-200)", borderRadius: 7, background: "var(--surface)" },
  scanBtn: { width: 34, height: 34, borderRadius: 7, border: "none", background: "var(--blue-50)", fontSize: 17, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  scanOk: { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 7, fontSize: 12.5, fontWeight: 600, color: "var(--green-ink)" },
  scanNo: { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 7, fontSize: 12.5, fontWeight: 600, color: "var(--amber-ink)" },

  barcodeStage: { background: "#fff", border: "1px solid var(--ink-100)", borderRadius: 12, padding: "18px 14px", display: "grid", placeItems: "center", minHeight: 130 },
  approvalNote: { display: "flex", gap: 11, alignItems: "center", padding: "12px 13px", background: "var(--surface-2)", border: "1px solid var(--ink-100)", borderRadius: 11 },
  valorActual: { height: 44, display: "flex", alignItems: "center", padding: "0 14px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--ink-100)", fontSize: 14.5, color: "var(--ink-500)", fontWeight: 600 },
  solHint: { display: "flex", alignItems: "center", gap: 8, padding: "12px 15px", borderBottom: "1px solid var(--ink-100)", fontSize: 12.5, color: "var(--ink-500)", background: "var(--surface-2)" },

  overlay: { position: "fixed", inset: 0, background: "rgba(20,22,26,.45)", display: "grid", placeItems: "center", zIndex: 80, padding: 20 },
  modal: { width: "100%", maxWidth: 480, background: "var(--surface)", borderRadius: 18, boxShadow: "var(--sh-pop)", overflow: "hidden" },
  modalHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--ink-100)" },
  modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 18px", borderTop: "1px solid var(--ink-100)", background: "var(--surface-2)" },
  typeSel: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, padding: 5, background: "var(--bg)", borderRadius: 11 },
  typeBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 40, borderRadius: 7, border: "none", background: "transparent", fontWeight: 600, fontSize: 13, color: "var(--ink-500)" },
  typeOn: { background: "var(--surface)", color: "var(--ink-900)", boxShadow: "var(--sh-sm)" },
  toast: { position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 9, padding: "12px 18px", borderRadius: 12, color: "#fff", fontWeight: 600, fontSize: 14, boxShadow: "var(--sh-lg)", zIndex: 90 },
};

window.Inventario = Inventario;
