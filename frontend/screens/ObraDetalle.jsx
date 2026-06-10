/* global React, Icon, CLIENTES, CUADRILLAS, ESTADOS, COND_META, QuoteEngine, money0, KlikaData */
// ============================================================
//  Pantalla 4 · Detalle de obra
// ============================================================
const { useState: useStateOD, useEffect: useEffectOD } = React;

const FOTOS_MOCK = [
  { id: 1, fase: "Antes", color: "#9aa3ad", visible: true, nota: "Filtraciones esquina norte" },
  { id: 2, fase: "Antes", color: "#8a93a0", visible: true, nota: "Pozas de agua estancada" },
  { id: 3, fase: "Durante", color: "#7fa9c9", visible: true, nota: "Aplicación de primer" },
  { id: 4, fase: "Durante", color: "#6f9bbd", visible: false, nota: "Detalle de malla en grietas" },
  { id: 5, fase: "Problema", color: "#d39a8c", visible: false, nota: "Grieta estructural hallada" },
  { id: 6, fase: "Después", color: "#8fc095", visible: true, nota: "1ra mano de membrana" },
];

function ObraDetalle({ obra: obraProp, obraId, tab, setTab, onNav, role, onPortal }) {
  const [obra, setObra] = useStateOD(obraProp || null);
  const [mapaVisible, setMapaVisible] = useStateOD(obraProp?.mapa ?? true);
  const [fotos, setFotos] = useStateOD(FOTOS_MOCK);
  const [filtroFase, setFiltroFase] = useStateOD("Todas");
  const [garAnios, setGarAnios] = useStateOD(7);
  const [estado, setEstado] = useStateOD(obraProp?.estado || "cotizada");
  const [secciones, setSecciones] = useStateOD(() => (obraProp?.secciones || []).map((s) => ({ ...s, factor: s.factor ?? (window.FACTOR_COND?.[s.cond] ?? 1) })));
  const [mapaLog, setMapaLog] = useStateOD(null);
  const [guardandoEstado, setGuardandoEstado] = useStateOD(false);
  const [guardandoGarantia, setGuardandoGarantia] = useStateOD(false);

  const backendId = obra?._id ?? (typeof obraId === "number" ? obraId : null);

  useEffectOD(() => {
    if (!window.KlikaData || !KlikaData.conectado()) return;
    const id = (obraProp?._id) ?? (typeof obraId === "number" ? obraId : null);
    if (!id) return;
    KlikaData.obras.ver(id).then((raw) => {
      const data = raw.data ?? raw;
      const mapped = KlikaData.map.obra(data);
      setObra({ ...mapped, direccion: data.direccion ?? obraProp?.direccion ?? "", secciones: data.secciones ?? obraProp?.secciones ?? [] });
      setEstado(mapped.estado);
      const secs = (data.secciones || []).map((s) => ({ ...s, factor: s.factor ?? (window.FACTOR_COND?.[s.condicion ?? s.cond] ?? 1), cond: s.condicion ?? s.cond ?? "bueno" }));
      if (secs.length) setSecciones(secs);
      setMapaVisible(data.ubicacion_visible ?? true);
    }).catch(() => {});

    KlikaData.obras.fotos(id).then((res) => {
      const arr = res.data ?? res;
      if (arr?.length) setFotos(arr.map((f) => ({ id: f.id, fase: f.fase ?? "Antes", color: "#7fa9c9", visible: f.visible ?? true, nota: f.descripcion ?? "" })));
    }).catch(() => {});

    KlikaData.obras.garantia(id).then((res) => {
      const g = res.data ?? res;
      if (g?.anios) setGarAnios(g.anios);
    }).catch(() => {});
  }, [obraId]);

  async function cambiarEstado(nuevoEstado) {
    setEstado(nuevoEstado);
    if (!window.KlikaData || !KlikaData.conectado() || !backendId) return;
    setGuardandoEstado(true);
    try { await KlikaData.obras.actualizar(backendId, { estado: nuevoEstado }); }
    catch (e) { console.error("cambiarEstado", e); } finally { setGuardandoEstado(false); }
  }

  async function guardarGarantia(anios) {
    setGarAnios(anios);
    if (!window.KlikaData || !KlikaData.conectado() || !backendId) return;
    setGuardandoGarantia(true);
    try { await KlikaData.obras.guardarGarantia(backendId, { anios }); }
    catch (e) { console.error("guardarGarantia", e); } finally { setGuardandoGarantia(false); }
  }

  async function toggleMapa() {
    const next = !mapaVisible;
    setMapaVisible(next);
    setMapaLog({ quien: window.ROLES?.[role]?.nombre || "Usuario", accion: next ? "activó" : "ocultó" });
    if (window.KlikaData && KlikaData.conectado() && backendId) {
      KlikaData.obras.ubicacionVisible(backendId, next).catch(() => {});
    }
  }

  if (!obra) return <div style={{ padding: 40, color: "var(--ink-400)" }}>Cargando obra…</div>;

  const cliente = CLIENTES.find((c) => c.id === obra.cliente || c._id == obra.cliente);
  const cu = CUADRILLAS.find((c) => c.id === obra.cuadrilla || c._id == obra.cuadrilla);
  const esDueno = role === "dueno";
  const totalM2 = secciones.reduce((a, s) => a + (+s.m2 || 0), 0);
  function setSeccion(i, key, val) {
    setSecciones((arr) => arr.map((s, idx) => idx === i ? { ...s, [key]: val, ...(key === "cond" ? { factor: window.FACTOR_COND?.[val] ?? s.factor } : {}) } : s));
  }
  function addSeccion() { setSecciones((arr) => [...arr, { nombre: "Nueva sección", m2: 0, cond: "bueno", manos: 2, factor: window.FACTOR_COND?.bueno ?? 1 }]); }
  function delSeccion(i) { setSecciones((arr) => arr.filter((_, idx) => idx !== i)); }
  // toggleMapa is defined above in the hooks section

  const tabs = [
    { k: "resumen", label: "Resumen" },
    { k: "cotizacion", label: "Cotización" },
    { k: "programacion", label: "Programación y avance" },
    { k: "fotos", label: "Fotos de evidencia" },
    { k: "garantia", label: "Garantía" },
  ];

  const fasesFiltro = ["Todas", "Antes", "Durante", "Después", "Problema"];
  const faseColor = { Antes: "badge-gray", Durante: "badge-blue", Después: "badge-green", Problema: "badge-red" };
  const fotosVis = fotos.filter((f) => filtroFase === "Todas" || f.fase === filtroFase);

  return (
    <div style={od.page} className="r-page">
      {/* migas + acciones */}
      <div style={od.topRow}>
        <button className="btn btn-quiet btn-sm" onClick={() => onNav("obras")}><Icon name="chevleft" size={16} /> Obras</button>
        <span style={{ color: "var(--ink-200)" }}>/</span>
        <span className="mono" style={{ fontSize: 13, color: "var(--ink-400)" }}>{obra.id}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 9 }}>
          <button className="btn btn-ghost btn-sm"><Icon name="edit" size={15} /> Editar</button>
          <button className="btn btn-ghost btn-sm" onClick={onPortal}><Icon name="eye" size={15} /> Ver como cliente</button>
          <button className="btn btn-primary btn-sm"><Icon name="send" size={15} /> Enviar al cliente</button>
        </div>
      </div>

      {/* tabs */}
      <div style={od.tabs}>
        {tabs.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ ...od.tab, ...(tab === t.k ? od.tabOn : {}) }}>
            {t.label}
            {t.k === "fotos" && <span style={od.tabCount}>{fotos.length}</span>}
          </button>
        ))}
      </div>

      <div style={od.body} className="r-main">
        {/* ----- columna principal ----- */}
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {tab === "resumen" && (
            <>
              {/* Secciones del techo */}
              <section className="card r-tcard" style={od.card}>
                <div style={od.cardHead}>
                  <span style={od.cardTitle}><Icon name="ruler" size={17} color="var(--ink-500)" /> Secciones del techo</span>
                  <span style={{ fontSize: 13, color: "var(--ink-400)" }}>Total: <strong className="tnum" style={{ color: "var(--ink-800)" }}>{totalM2} m²</strong></span>
                </div>
                <table style={od.table} className="r-table">
                  <thead><tr>
                    <th style={od.th}>Sección</th><th style={{ ...od.th, textAlign: "right" }}>Área m²</th>
                    <th style={{ ...od.th, textAlign: "center" }}>Manos</th><th style={od.th}>Condición</th>
                    <th style={{ ...od.th, textAlign: "center" }}>Factor desperdicio</th>
                    {esDueno && <th style={od.th}></th>}
                  </tr></thead>
                  <tbody>
                    {secciones.map((s, i) => (
                      <tr key={i} style={{ borderBottom: i < secciones.length - 1 ? "1px solid var(--ink-100)" : "none" }}>
                        <td style={od.td}>
                          {esDueno ? <input value={s.nombre} onChange={(e) => setSeccion(i, "nombre", e.target.value)} style={od.secInput} />
                            : <span style={{ fontWeight: 600 }}>{s.nombre}</span>}
                        </td>
                        <td style={{ ...od.td, textAlign: "right" }} className="tnum">
                          {esDueno ? <input type="number" value={s.m2} onChange={(e) => setSeccion(i, "m2", +e.target.value)} style={{ ...od.secInput, width: 70, textAlign: "right" }} />
                            : `${s.m2} m²`}
                        </td>
                        <td style={{ ...od.td, textAlign: "center" }} className="tnum">
                          {esDueno ? <input type="number" value={s.manos} onChange={(e) => setSeccion(i, "manos", +e.target.value)} style={{ ...od.secInput, width: 52, textAlign: "center" }} />
                            : s.manos}
                        </td>
                        <td style={od.td}>
                          {esDueno ? (
                            <select value={s.cond} onChange={(e) => setSeccion(i, "cond", e.target.value)} style={od.secSelect}>
                              {Object.keys(COND_META).map((k) => <option key={k} value={k}>{COND_META[k].label}</option>)}
                            </select>
                          ) : <span className={"badge " + COND_META[s.cond].cls}><span className="dot" />{COND_META[s.cond].label}</span>}
                        </td>
                        <td style={{ ...od.td, textAlign: "center" }}>
                          {esDueno ? <input type="number" step="0.05" value={s.factor} onChange={(e) => setSeccion(i, "factor", +e.target.value)} style={{ ...od.secInput, width: 64, textAlign: "center" }} />
                            : <span className="tnum">{s.factor}</span>}
                        </td>
                        {esDueno && <td style={{ ...od.td, textAlign: "right" }}>
                          <button onClick={() => delSeccion(i)} style={od.delBtn} title="Eliminar sección"><Icon name="trash" size={15} color="var(--ink-300)" /></button>
                        </td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {esDueno && <button className="btn btn-quiet btn-sm" style={{ margin: "10px 14px" }} onClick={addSeccion}><Icon name="plus" size={15} /> Agregar sección</button>}
              </section>

              {/* Dirección + mapa */}
              <section className="card" style={od.card}>
                <div style={od.cardHead}>
                  <span style={od.cardTitle}><Icon name="location" size={17} color="var(--ink-500)" /> Ubicación</span>
                  <label style={od.toggleLabel}>
                    <span style={{ fontSize: 12.5, color: "var(--ink-500)" }}>Visible para aplicadores</span>
                    <Toggle on={mapaVisible} onChange={toggleMapa} />
                  </label>
                </div>
                <div style={{ padding: 16 }}>
                  {mapaLog && (
                    <div style={od.mapaLog}>
                      <Icon name={mapaVisible ? "eye" : "eyeoff"} size={14} color="var(--ink-400)" />
                      {mapaLog.quien} {mapaLog.accion} la ubicación · ahora
                    </div>
                  )}
                  <div style={{ fontSize: 14, marginBottom: 12 }}>{obra.direccion}</div>
                  <div style={od.mapBox}>
                    <div style={od.mapGrid} />
                    <div style={od.mapPin}><Icon name="location" size={26} color="#fff" /></div>
                    <button className="btn btn-ghost btn-sm" style={od.mapBtn}><Icon name="location" size={15} /> Cómo llegar</button>
                    {!mapaVisible && <div style={od.mapHidden}><Icon name="eyeoff" size={20} color="var(--ink-400)" /> Oculto para aplicadores</div>}
                  </div>
                </div>
              </section>
            </>
          )}

          {tab === "cotizacion" && <QuoteEngine obra={obra} role={role} onPortal={onPortal} />}

          {tab === "programacion" && (
            <section className="card" style={od.card}>
              <div style={od.cardHead}><span style={od.cardTitle}><Icon name="calendar" size={17} color="var(--ink-500)" /> Días programados y avance</span></div>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>Avance general</span><span className="tnum" style={{ fontWeight: 700 }}>{obra.avance}%</span>
                    </div>
                    <div style={{ height: 10, background: "var(--ink-100)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: obra.avance + "%", background: "linear-gradient(90deg,var(--blue-500),var(--blue-700))", borderRadius: 99 }} />
                    </div>
                  </div>
                </div>
                <div style={od.timeline}>
                  {[
                    { d: obra.inicio, t: "Inicio de obra · preparación de superficie", done: obra.avance > 0 },
                    { d: "27 may", t: "Aplicación de primer (imprimante)", done: obra.avance >= 40 },
                    { d: "29 may", t: "1ra mano de membrana acrílica", done: obra.avance >= 60 },
                    { d: "31 may", t: "2da mano + refuerzo en grietas", done: obra.avance >= 85 },
                    { d: obra.fin, t: "Inspección final y entrega", done: obra.avance === 100 },
                  ].map((step, i) => (
                    <div key={i} style={od.tlRow}>
                      <div style={{ ...od.tlDot, background: step.done ? "var(--green)" : "var(--surface)", borderColor: step.done ? "var(--green)" : "var(--ink-200)" }}>
                        {step.done && <Icon name="check" size={12} color="#fff" />}
                      </div>
                      <div style={{ flex: 1, paddingBottom: 16 }}>
                        <div style={{ fontSize: 13.5, fontWeight: step.done ? 600 : 500, color: step.done ? "var(--ink-900)" : "var(--ink-400)" }}>{step.t}</div>
                        <div className="tnum" style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 2 }}>{step.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {tab === "fotos" && (
            <section className="card" style={od.card}>
              <div style={od.cardHead}>
                <span style={od.cardTitle}><Icon name="camera" size={17} color="var(--ink-500)" /> Galería de evidencia</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {fasesFiltro.map((f) => (
                    <button key={f} className={"chip" + (filtroFase === f ? " active" : "")} style={{ height: 30, fontSize: 12 }} onClick={() => setFiltroFase(f)}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={od.gallery}>
                {fotosVis.map((f) => (
                  <div key={f.id} style={od.photo}>
                    <div style={{ ...od.photoImg, background: `repeating-linear-gradient(45deg, ${f.color}, ${f.color} 11px, ${f.color}dd 11px, ${f.color}dd 22px)` }}>
                      <span className={"badge " + faseColor[f.fase]} style={{ position: "absolute", top: 9, left: 9 }}>{f.fase}</span>
                      <span style={od.photoLens}><Icon name="camera" size={26} color="rgba(255,255,255,.85)" /></span>
                    </div>
                    <div style={od.photoFoot}>
                      <div style={{ fontSize: 12.5, color: "var(--ink-600)", lineHeight: 1.35, flex: 1 }}>{f.nota}</div>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }} title="Visible para el cliente">
                        <Icon name={f.visible ? "eye" : "eyeoff"} size={15} color={f.visible ? "var(--green)" : "var(--ink-300)"} />
                        <Toggle small on={f.visible} onChange={() => setFotos((arr) => arr.map((x) => x.id === f.id ? { ...x, visible: !x.visible } : x))} />
                      </label>
                    </div>
                  </div>
                ))}
                <button style={od.photoAdd}><Icon name="plus" size={22} color="var(--ink-300)" /><span style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 6 }}>Subir foto</span></button>
              </div>
              <div style={od.galleryNote}><Icon name="eye" size={14} color="var(--green)" /> El interruptor de cada foto controla si el cliente la ve en su portal.</div>
            </section>
          )}

          {tab === "garantia" && (
            <section className="card" style={od.card}>
              <div style={od.cardHead}><span style={od.cardTitle}><Icon name="shield" size={17} color="var(--ink-500)" /> Garantía</span></div>
              <div style={{ padding: 20 }}>
                <div style={od.warranty}>
                  <div style={od.warrantyIcon}><Icon name="shield" size={30} color="var(--green)" /></div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Garantía de {garAnios} {garAnios === 1 ? "año" : "años"}</div>
                    <div style={{ fontSize: 13.5, color: "var(--ink-500)", marginTop: 3 }}>Sistema acrílico elastomérico · contra filtraciones</div>
                  </div>
                  <span className="badge badge-green" style={{ marginLeft: "auto", height: 28 }}><span className="dot" />Activa</span>
                </div>
                {esDueno && (
                  <div style={od.garEdit}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>Plazo de garantía</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 2 }}>Solo el dueño puede ajustar el plazo</div>
                    </div>
                    <div style={od.stepper}>
                      <button style={od.stepBtn} onClick={() => guardarGarantia(Math.max(1, garAnios - 1))} aria-label="Restar año"><Icon name="minus" size={16} /></button>
                      <div style={od.stepVal}>
                        <input type="number" min={1} max={25} value={garAnios}
                          onChange={(e) => guardarGarantia(Math.max(1, Math.min(25, +e.target.value || 1)))}
                          className="tnum" style={od.stepInput} />
                        <span style={{ fontSize: 12.5, color: "var(--ink-400)", fontWeight: 600 }}>{garAnios === 1 ? "año" : "años"}</span>
                      </div>
                      <button style={od.stepBtn} onClick={() => guardarGarantia(Math.min(25, garAnios + 1))} aria-label="Sumar año"><Icon name="plus" size={16} /></button>
                    </div>
                  </div>
                )}
                <div style={od.warrantyGrid}>
                  <Field label="Inicio" value="—" hint="al terminar la obra" />
                  <Field label="Vence" value={String(2026 + garAnios)} hint={`${garAnios} ${garAnios === 1 ? "año" : "años"} de cobertura`} />
                  <Field label="Cobertura" value="Filtraciones" hint="materiales + mano de obra" />
                  <Field label="Certificado" value="Pendiente" hint="se emite al cerrar" />
                </div>
                <div style={od.garFoot}>
                  <button className="btn btn-primary" onClick={() => alert("Generando expediente de garantía (PDF): certificado, cotización, fotos de evidencia y datos del cliente.")}>
                    <Icon name="download" size={16} /> Descargar expediente
                  </button>
                  <span style={{ fontSize: 12.5, color: "var(--ink-400)" }}>Incluye certificado, cotización, fotos de evidencia y datos del cliente.</span>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ----- columna lateral ----- */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <section className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span className={"badge " + ESTADOS[estado].cls}><span className="dot" />{ESTADOS[estado].label}</span>
              {esDueno && <span style={{ fontWeight: 800, fontSize: 16 }}>{money0(obra.total)}</span>}
            </div>
            {esDueno && (
              <div style={{ marginTop: 12 }}>
                <div style={od.sideLabel}>Cambiar estado</div>
                <select value={estado} onChange={(e) => cambiarEstado(e.target.value)} className="input" style={{ height: 40 }} disabled={guardandoEstado}>
                  {["cotizada", "aprobada", "proceso", "pausada", "terminada", "cancelada"].map((k) => (
                    <option key={k} value={k}>{ESTADOS[k].label}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ height: 1, background: "var(--ink-100)", margin: "14px 0" }} />
            <div style={od.sideLabel}>Cliente</div>
            <button style={od.clienteBtn} onClick={() => onNav("clientes")}>
              <span style={od.clienteAv}>{cliente?.contacto?.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
              <span style={{ textAlign: "left", flex: 1 }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: 14 }}>{cliente?.contacto}</span>
                <span style={{ display: "block", fontSize: 12.5, color: "var(--ink-400)" }}>{cliente?.nombre}</span>
              </span>
              <Icon name="chevright" size={15} color="var(--ink-300)" />
            </button>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <a className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }} href="#" onClick={(e)=>e.preventDefault()}><Icon name="phone" size={15} /> Llamar</a>
              <a className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }} href="#" onClick={(e)=>e.preventDefault()}><Icon name="whatsapp" size={15} /> WhatsApp</a>
            </div>
          </section>

          <section className="card" style={{ padding: 16 }}>
            <div style={od.sideLabel}>Cuadrilla asignada</div>
            {cu ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: cu.color }} />
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{cu.nombre}</span>
                </div>
                {cu.miembros.map((m) => (
                  <div key={m} style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 0" }}>
                    <span style={od.memberAv}>{m.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                    <span style={{ fontSize: 13.5 }}>{m}</span>
                  </div>
                ))}
              </>
            ) : (
              <div>
                <div style={{ fontSize: 13.5, color: "var(--ink-400)", marginBottom: 10 }}>Sin cuadrilla asignada.</div>
                <button className="btn btn-soft btn-sm" style={{ width: "100%", justifyContent: "center" }}><Icon name="plus" size={15} /> Asignar cuadrilla</button>
              </div>
            )}
          </section>

          <section className="card" style={{ padding: 16 }}>
            <div style={od.sideLabel}>Fechas</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "4px 0" }}><span style={{ color: "var(--ink-400)" }}>Inicio</span><span className="tnum" style={{ fontWeight: 600 }}>{obra.inicio}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "4px 0" }}><span style={{ color: "var(--ink-400)" }}>Fin estimado</span><span className="tnum" style={{ fontWeight: 600 }}>{obra.fin}</span></div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Toggle({ on, onChange, small }) {
  const w = small ? 34 : 42, h = small ? 20 : 24, k = small ? 14 : 18;
  return (
    <button onClick={onChange} style={{ width: w, height: h, borderRadius: 99, border: "none", padding: 3, cursor: "pointer",
      background: on ? "var(--blue-600)" : "var(--ink-200)", transition: "background .16s", flexShrink: 0 }}>
      <span style={{ display: "block", width: k, height: k, borderRadius: 99, background: "#fff",
        transform: on ? `translateX(${w - k - 6}px)` : "none", transition: "transform .16s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
    </button>
  );
}

function Field({ label, value, hint }) {
  return (
    <div style={{ padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, border: "1px solid var(--ink-100)" }}>
      <div style={{ fontSize: 11.5, color: "var(--ink-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{value}</div>
      {hint && <div style={{ fontSize: 11.5, color: "var(--ink-400)", marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

const od = {
  page: { padding: "18px 28px 40px", maxWidth: 1320, margin: "0 auto" },
  topRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" },
  tabs: { display: "flex", gap: 4, borderBottom: "1px solid var(--ink-100)", marginBottom: 18, overflowX: "auto" },
  tab: { position: "relative", display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", border: "none",
    background: "transparent", fontSize: 14, fontWeight: 600, color: "var(--ink-400)", borderBottom: "2.5px solid transparent",
    marginBottom: -1, whiteSpace: "nowrap" },
  tabOn: { color: "var(--ink-900)", borderColor: "var(--blue-600)" },
  tabCount: { fontSize: 11, fontWeight: 700, background: "var(--ink-100)", color: "var(--ink-500)", borderRadius: 99, padding: "1px 7px" },
  body: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, alignItems: "start" },
  card: { padding: 0, overflow: "hidden" },
  cardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--ink-100)" },
  cardTitle: { display: "flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: 14.5 },
  toggleLabel: { display: "flex", alignItems: "center", gap: 9 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase",
    letterSpacing: ".4px", padding: "11px 16px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)" },
  td: { padding: "12px 16px", fontSize: 14 },

  mapBox: { position: "relative", height: 200, borderRadius: 12, overflow: "hidden", background: "#dde6ec", border: "1px solid var(--ink-100)" },
  mapGrid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(30,127,194,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(30,127,194,.10) 1px,transparent 1px)", backgroundSize: "26px 26px" },
  mapPin: { position: "absolute", top: "42%", left: "50%", transform: "translate(-50%,-50%)", width: 44, height: 44, borderRadius: "50% 50% 50% 0", background: "var(--red)", transform: "translate(-50%,-50%) rotate(-45deg)", display: "grid", placeItems: "center", boxShadow: "0 6px 16px rgba(224,57,43,.4)" },
  mapBtn: { position: "absolute", bottom: 12, right: 12, background: "#fff" },
  mapHidden: { position: "absolute", inset: 0, background: "rgba(245,246,248,.92)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "var(--ink-500)" },

  timeline: { paddingLeft: 4 },
  tlRow: { display: "flex", gap: 14 },
  tlDot: { width: 22, height: 22, borderRadius: "50%", border: "2px solid", display: "grid", placeItems: "center", flexShrink: 0, position: "relative", zIndex: 2 },

  gallery: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14, padding: 16 },
  photo: { borderRadius: 12, overflow: "hidden", border: "1px solid var(--ink-100)", background: "var(--surface)" },
  photoImg: { position: "relative", height: 130, display: "grid", placeItems: "center" },
  photoLens: { opacity: .7 },
  photoFoot: { display: "flex", alignItems: "center", gap: 8, padding: "10px 11px" },
  photoAdd: { border: "2px dashed var(--ink-200)", borderRadius: 12, background: "var(--surface-2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 130, cursor: "pointer" },
  galleryNote: { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-400)", padding: "0 16px 16px" },

  warranty: { display: "flex", alignItems: "center", gap: 14, padding: 16, background: "var(--green-bg)", borderRadius: 12, marginBottom: 16 },
  warrantyIcon: { width: 54, height: 54, borderRadius: 13, background: "#fff", display: "grid", placeItems: "center" },
  warrantyGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  garFoot: { display: "flex", alignItems: "center", gap: 14, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--ink-100)", flexWrap: "wrap" },
  secInput: { width: "100%", maxWidth: 200, border: "1px solid var(--ink-200)", borderRadius: 7, height: 32, padding: "0 9px", fontSize: 13.5, fontWeight: 500, outline: "none", background: "var(--surface)", fontVariantNumeric: "tabular-nums" },
  secSelect: { border: "1px solid var(--ink-200)", borderRadius: 7, height: 32, padding: "0 8px", fontSize: 13, outline: "none", background: "var(--surface)" },
  delBtn: { border: "none", background: "transparent", width: 30, height: 30, borderRadius: 7, display: "grid", placeItems: "center", cursor: "pointer" },
  mapaLog: { display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--ink-500)", background: "var(--surface-2)", border: "1px solid var(--ink-100)", borderRadius: 9, padding: "8px 11px", marginBottom: 12 },
  garEdit: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "12px 16px", border: "1px solid var(--ink-100)", borderRadius: 12, marginBottom: 16 },
  stepper: { display: "flex", alignItems: "center", gap: 4, border: "1px solid var(--ink-200)", borderRadius: 10, padding: 4, background: "var(--surface)" },
  stepBtn: { width: 34, height: 34, borderRadius: 8, border: "none", background: "var(--surface-2)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--ink-700)" },
  stepVal: { display: "flex", alignItems: "baseline", gap: 5, padding: "0 6px", minWidth: 78, justifyContent: "center" },
  stepInput: { width: 40, border: "none", outline: "none", textAlign: "right", fontSize: 20, fontWeight: 800, color: "var(--ink-900)", background: "transparent", fontVariantNumeric: "tabular-nums", MozAppearance: "textfield" },

  sideLabel: { fontSize: 11.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 9 },
  clienteBtn: { display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "9px 10px", borderRadius: 10, border: "1px solid var(--ink-100)", background: "var(--surface-2)" },
  clienteAv: { width: 38, height: 38, borderRadius: 9, background: "var(--purple)", color: "#fff", fontWeight: 700, fontSize: 13, display: "grid", placeItems: "center", flexShrink: 0 },
  memberAv: { width: 26, height: 26, borderRadius: 7, background: "var(--ink-100)", color: "var(--ink-600)", fontWeight: 700, fontSize: 10.5, display: "grid", placeItems: "center", flexShrink: 0 },
};

Object.assign(window, { ObraDetalle, Toggle });
