/* global React, Icon, OBRAS, money0 */
// ============================================================
//  Vista aplicador · Pantallas (móvil 390px, manos en obra)
//  Helpers + 6 pantallas, exportadas a window para AplicadorMobile
// ============================================================
const { useState: useS, useEffect: useE, useRef: useR } = React;

// ---- Pronóstico 7 días (desde mar 2 jun) ----
const PRONOSTICO = [
  { dia: "Hoy", icon: "sun", prob: 10, cond: "ok" },
  { dia: "Mié", icon: "sun", prob: 5, cond: "ok" },
  { dia: "Jue", icon: "cloud", prob: 35, cond: "warn" },
  { dia: "Vie", icon: "rain", prob: 80, cond: "bad" },
  { dia: "Sáb", icon: "cloud", prob: 45, cond: "warn" },
  { dia: "Dom", icon: "sun", prob: 15, cond: "ok" },
  { dia: "Lun", icon: "sun", prob: 10, cond: "ok" },
];
const CLIMA_AP = {
  ok: { cls: "badge-green", label: "Buen día", color: "var(--green)" },
  warn: { cls: "badge-amber", label: "Ojo, nubes", color: "var(--amber)" },
  bad: { cls: "badge-red", label: "Lluvia fuerte", color: "var(--red)" },
};

// ---- Materiales que lleva una obra (según m² de la cotización) ----
function obraMateriales(obra, store) {
  const m2 = obra.secciones.reduce((s, x) => s + x.m2, 0);
  const manos = Math.max(...obra.secciones.map((x) => x.manos));
  const receta = [
    { id: "M-02", capas: 1 },
    { id: "M-01", capas: manos },
    { id: "M-04", capas: 1 },
    { id: "M-06", fijo: Math.ceil(m2 / 35) },
  ];
  return receta.map((r) => {
    const mat = store.materiales.find((x) => x.id === r.id) || {};
    const need = r.fijo != null ? r.fijo : Math.max(1, Math.ceil((m2 * r.capas) / (mat.rend || 1)));
    const stock = mat.stock || 0;
    const estado = stock === 0 ? "sin" : (stock < need || stock < (mat.min || 0)) ? "bajo" : "ok";
    return { nombre: mat.nombre, need, unidad: mat.unidad, estado };
  });
}
const MAT_ESTADO = {
  ok: { cls: "badge-green", label: "Disponible" },
  bajo: { cls: "badge-amber", label: "Bajo stock" },
  sin: { cls: "badge-red", label: "Sin stock" },
};

// ---- Placeholder de mapa (rayado + pin) ----
function MapaMini({ height = 150, label }) {
  return (
    <div style={{ ...apScr.mapa, height }}>
      <div style={apScr.mapaGrid} />
      <span style={apScr.mapaPin}><Icon name="location" size={26} color="#fff" /></span>
      {label && <div style={apScr.mapaLbl}>{label}</div>}
    </div>
  );
}

// ---- Anillo de progreso ----
function RingProgress({ value, max, size = 132, stroke = 13, color = "#fff", track = "rgba(255,255,255,.22)", children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.3,.8,.3,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>{children}</div>
    </div>
  );
}

function Saludo({ nombre }) {
  return (
    <div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,.78)" }}>Hola,</div>
      <div style={{ fontSize: 23, fontWeight: 800, color: "#fff", letterSpacing: "-.3px" }}>{nombre}</div>
      <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.6)", marginTop: 3, textTransform: "capitalize" }}>martes 2 de junio</div>
    </div>
  );
}

// ============================================================
//  PANTALLA 1 · Mis obras
// ============================================================
function MisObrasScreen({ nombre, hoyObras, semanaObras, onOpenObra, online, onToggleOnline, onKlika, onLogout }) {
  return (
    <div style={apScr.scroll}>
      <div style={apScr.headerDark}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Saludo nombre={nombre} />
          <div style={{ display: "flex", gap: 9 }}>
            <button onClick={onKlika} style={apScr.headBtn}><Icon name="sparkle" size={21} color="#fff" /></button>
            <button onClick={onLogout} style={apScr.headBtn} title="Salir"><Icon name="logout" size={20} color="#fff" /></button>
          </div>
        </div>
        <Pronostico online={online} onToggleOnline={onToggleOnline} />
      </div>

      <div style={apScr.body}>
        <SectionLabel icon="location" text="Hoy" />
        {hoyObras.length === 0 ? (
          <div style={apScr.vacio}>
            <span style={apScr.vacioIcon}><Icon name="sun" size={30} color="var(--amber)" /></span>
            <div style={{ fontWeight: 800, fontSize: 16.5 }}>No tienes obras hoy</div>
            <div style={{ fontSize: 14, color: "var(--ink-500)", marginTop: 4, lineHeight: 1.45 }}>Descansa o pásate por el almacén. Te avisamos cuando te asignen una.</div>
          </div>
        ) : hoyObras.map(({ obra, cond }) => (
          <ObraBig key={obra.id} obra={obra} cond={cond} hoy onOpen={() => onOpenObra(obra)} />
        ))}

        <SectionLabel icon="calendar" text="Esta semana" mt={26} />
        {semanaObras.map(({ obra, dia, cond }) => (
          <ObraSemana key={obra.id} obra={obra} dia={dia} cond={cond} onOpen={() => onOpenObra(obra)} />
        ))}
      </div>
    </div>
  );
}

function Pronostico({ online, onToggleOnline }) {
  return (
    <div style={apScr.pronoWrap}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,.85)", textTransform: "uppercase", letterSpacing: ".6px" }}>Clima · próximos 7 días</span>
        <button onClick={onToggleOnline} style={{ ...apScr.netPill, background: online ? "rgba(63,174,74,.22)" : "rgba(242,163,58,.25)" }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: online ? "var(--green)" : "var(--amber)" }} />
          {online ? "En línea" : "Sin conexión"}
        </button>
      </div>
      <div style={apScr.pronoRow}>
        {PRONOSTICO.map((d, i) => {
          const c = CLIMA_AP[d.cond];
          return (
            <div key={i} style={{ ...apScr.pronoDay, background: i === 0 ? "rgba(255,255,255,.14)" : "transparent" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? "#fff" : "rgba(255,255,255,.62)" }}>{d.dia}</span>
              <Icon name={d.icon} size={23} color={c.color === "var(--green)" ? "#7BD487" : c.color === "var(--amber)" ? "#FFC877" : "#FF8A7E"} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,.75)" }} className="tnum">{d.prob}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionLabel({ icon, text, mt = 4 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: `${mt}px 0 13px` }}>
      <Icon name={icon} size={18} color="var(--ink-400)" />
      <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink-700)" }}>{text}</span>
    </div>
  );
}

function ObraBig({ obra, cond, hoy, onOpen }) {
  const c = CLIMA_AP[cond];
  const est = obra.estado === "proceso" ? { cls: "badge-amber", label: "En proceso" } : { cls: "badge-blue", label: "Por iniciar" };
  return (
    <button onClick={onOpen} style={apScr.obraBig}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span className={"badge " + est.cls} style={{ height: 28, fontSize: 13 }}><span className="dot" />{est.label}</span>
        <span className={"badge " + c.cls} style={{ height: 28, fontSize: 13 }}><Icon name="sun" size={14} /> {c.label}</span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 20, marginTop: 13, lineHeight: 1.2, letterSpacing: "-.3px" }}>{obra.clienteNom.split("·")[0].trim()}</div>
      <div style={{ fontSize: 15, color: "var(--ink-500)", marginTop: 4, lineHeight: 1.35 }}>{obra.titulo}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 13, fontSize: 14.5, color: "var(--ink-500)" }}>
        <Icon name="location" size={17} color="var(--blue-600)" /> {obra.direccion.split(",")[0]}
      </div>
      <div style={apScr.obraBigFoot}>
        <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--blue-700)" }}>Abrir obra</span>
        <Icon name="chevright" size={20} color="var(--blue-600)" />
      </div>
    </button>
  );
}

function ObraSemana({ obra, dia, cond, onOpen }) {
  const c = CLIMA_AP[cond];
  return (
    <button onClick={onOpen} style={apScr.obraSem}>
      <div style={apScr.diaChip}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase" }}>{dia.split(" ")[0]}</span>
        <span style={{ fontSize: 21, fontWeight: 800, lineHeight: 1 }} className="tnum">{dia.split(" ")[1]}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{obra.clienteNom.split("·")[0].trim()}</div>
        <div style={{ fontSize: 13.5, color: "var(--ink-500)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{obra.titulo}</div>
        <span className={"badge " + c.cls} style={{ height: 23, marginTop: 8, fontSize: 12 }}><Icon name={cond === "bad" ? "rain" : "sun"} size={13} /> {c.label}</span>
      </div>
      <Icon name="chevright" size={20} color="var(--ink-300)" />
    </button>
  );
}

// ============================================================
//  PANTALLA 2 · Detalle de obra
// ============================================================
function ObraDetalleMobile({ obra, checkin, historial, online, onBack, onCheckin, onCheckout, onFoto, onMateriales }) {
  const hizoCheck = !!checkin && !checkin.salida;
  const yaSalio = !!checkin && !!checkin.salida;
  const estMeta = obra.estado === "proceso" ? { cls: "badge-amber", label: "En proceso" } : obra.estado === "pausada" ? { cls: "badge-purple", label: "Pausada" } : { cls: "badge-blue", label: "Por iniciar" };
  const verUbic = obra.mapa; // ubicacion_visible

  function comoLlegar() {
    window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(obra.direccion), "_blank");
  }

  return (
    <div style={apScr.pushScreen} className="fade-in">
      <div style={apScr.detHeader}>
        <button onClick={onBack} style={apScr.backBtn}><Icon name="chevleft" size={24} color="#fff" /></button>
        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,.7)", fontWeight: 600 }} className="mono">{obra.id}</span>
        <span style={{ width: 44 }} />
      </div>
      <div style={apScr.scroll}>
        <div style={{ padding: "18px 18px 8px", background: "var(--ink-900)" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.18, letterSpacing: "-.4px" }}>{obra.clienteNom.split("·")[0].trim()}</div>
          <div style={{ fontSize: 15.5, color: "rgba(255,255,255,.72)", marginTop: 5, lineHeight: 1.35 }}>{obra.titulo}</div>
          <span className={"badge " + estMeta.cls} style={{ height: 30, marginTop: 14, fontSize: 13.5, padding: "0 14px" }}><span className="dot" />{estMeta.label}</span>
        </div>

        <div style={apScr.body}>
          {/* dirección */}
          <div style={apScr.dirCard}>
            <Icon name="location" size={20} color="var(--blue-600)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px" }}>Dirección</div>
              <div style={{ fontSize: 15.5, marginTop: 3, lineHeight: 1.4 }}>{obra.direccion}</div>
            </div>
          </div>
          {verUbic ? (
            <button onClick={comoLlegar} style={{ ...apScr.action, background: "var(--purple)", marginTop: 10 }}>
              <Icon name="location" size={26} color="#fff" /> Cómo llegar
            </button>
          ) : (
            <div style={apScr.ubicOculta}><Icon name="eyeoff" size={16} color="var(--ink-400)" /> Ubicación en mapa no disponible para esta obra</div>
          )}

          {/* acciones grandes */}
          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {!hizoCheck && !yaSalio && (
              <button onClick={onCheckin} style={{ ...apScr.action, background: "var(--green)" }}>
                <Icon name="location" size={27} color="#fff" /> Marcar entrada (check-in)
              </button>
            )}
            {hizoCheck && (
              <button onClick={onCheckout} style={{ ...apScr.action, background: "var(--red)" }}>
                <Icon name="clock" size={27} color="#fff" /> Marcar salida (check-out)
              </button>
            )}
            {yaSalio && (
              <div style={apScr.jornadaOk}><Icon name="checkcircle" size={22} color="var(--green)" /> Jornada completa · entrada {checkin.entrada} · salida {checkin.salida}</div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button onClick={onFoto} style={{ ...apScr.action, background: "var(--blue-600)", flexDirection: "column", height: 96, gap: 8 }}>
                <Icon name="camera" size={30} color="#fff" /><span style={{ fontSize: 16 }}>Subir foto</span>
              </button>
              <button onClick={onMateriales} style={{ ...apScr.action, background: "var(--ink-700)", flexDirection: "column", height: 96, gap: 8 }}>
                <Icon name="inventory" size={30} color="#fff" /><span style={{ fontSize: 16 }}>Materiales</span>
              </button>
            </div>
          </div>

          {/* historial del día */}
          <SectionLabel icon="clock" text="Hoy en esta obra" mt={26} />
          {historial.length === 0 ? (
            <div style={{ fontSize: 14.5, color: "var(--ink-400)", padding: "2px 2px 4px" }}>Aún no has marcado entrada hoy.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {historial.map((h, i) => (
                <div key={i} style={apScr.histRow}>
                  <span style={{ ...apScr.histDot, background: h.tipo === "entrada" ? "var(--green)" : "var(--red)" }}>
                    <Icon name={h.tipo === "entrada" ? "location" : "clock"} size={16} color="#fff" />
                  </span>
                  <span style={{ fontSize: 15.5, fontWeight: 600, flex: 1 }}>{h.tipo === "entrada" ? "Entrada" : "Salida"}</span>
                  <span className="tnum" style={{ fontSize: 16, fontWeight: 800 }}>{h.hora}</span>
                </div>
              ))}
            </div>
          )}
          {!online && <div style={{ ...apScr.offNote, marginTop: 14 }}><Icon name="alert" size={15} color="var(--amber-ink)" /> Tus marcas se guardan en el teléfono y suben cuando vuelva el internet.</div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  PANTALLA 6 · Check-in (GPS)
// ============================================================
function CheckinScreen({ obra, online, onBack, onConfirm }) {
  const [fase, setFase] = useS("buscando"); // buscando | listo | hecho
  const [hora, setHora] = useS("");
  useE(() => {
    const t = setTimeout(() => setFase("listo"), 2300);
    return () => clearTimeout(t);
  }, []);
  function confirmar() {
    const now = new Date();
    const h = now.toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", hour12: true });
    setHora(h);
    setFase("hecho");
    onConfirm(h);
  }
  return (
    <div style={apScr.pushScreen} className="fade-in">
      <div style={apScr.detHeader}>
        <button onClick={onBack} style={apScr.backBtn}><Icon name="chevleft" size={24} color="#fff" /></button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Check-in</span>
        <span style={{ width: 44 }} />
      </div>
      <div style={{ ...apScr.scroll, background: "var(--bg)" }}>
        <div style={{ padding: 18 }}>
          {fase !== "hecho" ? (
            <>
              <MapaMini height={220} label={obra.direccion.split(",")[0]} />
              <div style={{ textAlign: "center", marginTop: 22 }}>
                <div style={{ fontSize: 19, fontWeight: 800 }}>{obra.clienteNom.split("·")[0].trim()}</div>
                <div style={{ fontSize: 14.5, color: "var(--ink-500)", marginTop: 4 }}>{obra.titulo}</div>
              </div>
              {fase === "buscando" ? (
                <div style={apScr.gpsBox}>
                  <span style={apScr.spinner} />
                  <span style={{ fontSize: 15.5, fontWeight: 600, color: "var(--ink-500)" }}>Obteniendo tu ubicación…</span>
                </div>
              ) : (
                <div style={apScr.gpsOk}>
                  <Icon name="checkcircle" size={20} color="var(--green)" /> Ubicación detectada — estás en la obra
                </div>
              )}
              <button disabled={fase !== "listo"} onClick={confirmar} style={{ ...apScr.action, background: fase === "listo" ? "var(--green)" : "var(--ink-300)", marginTop: 18, width: "100%" }}>
                <Icon name="location" size={26} color="#fff" /> Confirmar check-in aquí
              </button>
            </>
          ) : (
            <div style={apScr.exito} className="fade-up">
              <span style={apScr.exitoIcon}><Icon name="check" size={56} color="#fff" stroke={2.4} /></span>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 18 }}>¡Listo!</div>
              <div style={{ fontSize: 17, color: "var(--ink-500)", marginTop: 8, lineHeight: 1.4 }}>Check-in registrado a las <strong className="tnum" style={{ color: "var(--ink-900)" }}>{hora}</strong></div>
              {!online && <div style={{ ...apScr.offNote, marginTop: 18 }}><Icon name="alert" size={15} color="var(--amber-ink)" /> Guardado en el teléfono — subirá solo cuando regrese el internet.</div>}
              <button onClick={onBack} style={{ ...apScr.action, background: "var(--ink-900)", marginTop: 24, width: "100%" }}>Volver a la obra</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  PANTALLA 4 · Materiales de la obra (solo lectura)
// ============================================================
function MaterialesScreen({ obra, store, onBack, onScan }) {
  const mats = obraMateriales(obra, store);
  return (
    <div style={apScr.pushScreen} className="fade-in">
      <div style={apScr.detHeader}>
        <button onClick={onBack} style={apScr.backBtn}><Icon name="chevleft" size={24} color="#fff" /></button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Materiales</span>
        <button onClick={onScan} style={apScr.backBtn} title="Escanear"><Icon name="barcode" size={22} color="#fff" /></button>
      </div>
      <div style={{ ...apScr.scroll, background: "var(--bg)" }}>
        <div style={apScr.body}>
          <div style={{ fontSize: 14.5, color: "var(--ink-500)", marginBottom: 4, lineHeight: 1.4 }}>Lo que lleva <strong style={{ color: "var(--ink-900)" }}>{obra.clienteNom.split("·")[0].trim()}</strong> según la cotización aprobada.</div>
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {mats.map((m, i) => {
              const e = MAT_ESTADO[m.estado];
              return (
                <div key={i} style={apScr.matCard}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{m.nombre}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 7 }}>
                      <span className="tnum" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.5px" }}>{m.need}</span>
                      <span style={{ fontSize: 14, color: "var(--ink-500)", fontWeight: 600 }}>{m.unidad}</span>
                    </div>
                  </div>
                  <span className={"badge " + e.cls} style={{ height: 28, fontSize: 13, padding: "0 13px" }}><span className="dot" />{e.label}</span>
                </div>
              );
            })}
          </div>
          <div style={apScr.aviso}><Icon name="shield" size={17} color="var(--ink-400)" style={{ flexShrink: 0 }} /><span>Para reportar faltantes, habla con el supervisor. Aquí solo consultas, no se modifica el inventario.</span></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  PANTALLA 3 · Subir foto
// ============================================================
const FOTO_TIPOS = [
  { id: "antes", label: "Antes", color: "var(--blue-600)", icon: "camera" },
  { id: "durante", label: "Durante", color: "var(--star-orange)", icon: "swap" },
  { id: "despues", label: "Después", color: "var(--green)", icon: "checkcircle" },
  { id: "problema", label: "Problema", color: "var(--red)", icon: "alert" },
];
function FotoScreen({ obra, obras, online, recientes, onBack, onSubir, onPickObra }) {
  const [tipo, setTipo] = useS("antes");
  const [desc, setDesc] = useS("");
  const [preview, setPreview] = useS(null);
  const [hecho, setHecho] = useS(null); // "subida" | "cola"
  const fileRef = useR(null);

  function pickFile(e) {
    const f = e.target.files && e.target.files[0];
    if (f) setPreview(URL.createObjectURL(f));
  }
  function subir() {
    const t = FOTO_TIPOS.find((x) => x.id === tipo);
    const estado = online ? "subida" : "cola";
    onSubir({ tipo: t.label, color: t.color, desc, url: preview, estado, obra: obra ? obra.id : "—" });
    setHecho(estado);
    setTimeout(() => { setHecho(null); setPreview(null); setDesc(""); }, 2200);
  }

  return (
    <div style={apScr.pushScreen} className="fade-in">
      <div style={apScr.detHeader}>
        {onBack ? <button onClick={onBack} style={apScr.backBtn}><Icon name="chevleft" size={24} color="#fff" /></button> : <span style={{ width: 44 }} />}
        <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Subir foto</span>
        <span style={{ width: 44 }} />
      </div>
      <div style={{ ...apScr.scroll, background: "var(--bg)" }}>
        <div style={apScr.body}>
          {/* selector de obra cuando viene de la pestaña */}
          {!obra && obras && (
            <div className="field" style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14 }}>¿De cuál obra?</label>
              <select className="input" style={{ height: 52, fontSize: 16 }} onChange={(e) => onPickObra(e.target.value)} defaultValue="">
                <option value="" disabled>Elige una obra…</option>
                {obras.map((o) => <option key={o.id} value={o.id}>{o.clienteNom.split("·")[0].trim()}</option>)}
              </select>
            </div>
          )}

          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink-700)", marginBottom: 12 }}>¿Qué tipo de foto?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {FOTO_TIPOS.map((t) => {
              const on = tipo === t.id;
              return (
                <button key={t.id} onClick={() => setTipo(t.id)} style={{ ...apScr.tipoBtn, borderColor: on ? t.color : "var(--ink-200)", background: on ? t.color : "var(--surface)" }}>
                  <span style={{ ...apScr.tipoIcon, background: on ? "rgba(255,255,255,.22)" : t.color + "1A" }}><Icon name={t.icon} size={24} color={on ? "#fff" : t.color} /></span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: on ? "#fff" : "var(--ink-800)" }}>{t.label}</span>
                </button>
              );
            })}
          </div>

          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickFile} style={{ display: "none" }} />
          {preview ? (
            <div style={{ marginTop: 16, position: "relative" }}>
              <img src={preview} alt="vista previa" style={apScr.previewImg} />
              <button onClick={() => fileRef.current && fileRef.current.click()} style={apScr.cambiarFoto}>Cambiar</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current && fileRef.current.click()} style={{ ...apScr.tomarFoto, marginTop: 16 }}>
              <Icon name="camera" size={32} color="var(--blue-600)" />
              <div style={{ fontSize: 17, fontWeight: 800, marginTop: 8 }}>Tomar foto / Galería</div>
              <div style={{ fontSize: 13.5, color: "var(--ink-400)", marginTop: 3 }}>Toca para abrir la cámara</div>
            </button>
          )}

          <div className="field" style={{ marginTop: 16 }}>
            <label style={{ fontSize: 14 }}>Nota (opcional)</label>
            <input className="input" style={{ height: 52, fontSize: 16 }} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ej. filtración en la esquina norte" />
          </div>

          <button disabled={!preview} onClick={subir} style={{ ...apScr.action, background: preview ? "var(--green)" : "var(--ink-300)", marginTop: 18, width: "100%" }}>
            <Icon name="download" size={24} color="#fff" style={{ transform: "rotate(180deg)" }} /> {online ? "Subir foto" : "Guardar y subir luego"}
          </button>

          {hecho && (
            <div style={{ ...(hecho === "subida" ? apScr.toastOk : apScr.toastCola) }} className="fade-up">
              <Icon name={hecho === "subida" ? "checkcircle" : "clock"} size={20} color={hecho === "subida" ? "var(--green)" : "var(--amber-ink)"} />
              {hecho === "subida" ? "Foto subida correctamente" : "Sin internet — se subirá cuando regrese la conexión"}
            </div>
          )}

          {recientes.length > 0 && (
            <>
              <SectionLabel icon="camera" text="Fotos recientes" mt={26} />
              <div style={{ display: "grid", gap: 10 }}>
                {recientes.map((f, i) => (
                  <div key={i} style={apScr.fotoRow}>
                    {f.url ? <img src={f.url} alt="" style={apScr.fotoThumb} /> : <span style={{ ...apScr.fotoThumb, background: "var(--ink-100)" }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 99, background: f.color }} />
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{f.tipo}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-400)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.desc || "Sin nota"} · {f.obra}</div>
                    </div>
                    <span className={"badge " + (f.estado === "subida" ? "badge-green" : "badge-amber")} style={{ height: 25, fontSize: 12 }}>
                      {f.estado === "subida" ? "Subida" : "En cola"}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  PANTALLA 5 · Mi perfil + Vacaciones
// ============================================================
function PerfilScreen({ nombre, cargo, color, dispVac, derecho, tomadas, misAus, rh, online, onToggleOnline, onSolicitar, onLogout }) {
  return (
    <div style={apScr.scroll}>
      <div style={{ ...apScr.headerDark, paddingBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ ...apScr.avatar, background: color }}>{nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
            <div>
              <div style={{ fontSize: 21, fontWeight: 800, color: "#fff", letterSpacing: "-.3px" }}>{nombre}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{cargo} · Cuadrilla A</div>
            </div>
          </div>
          <button onClick={onLogout} style={apScr.headBtn}><Icon name="logout" size={20} color="#fff" /></button>
        </div>
      </div>

      <div style={apScr.body}>
        {/* anillo de vacaciones */}
        <div style={apScr.vacHero}>
          <RingProgress value={dispVac} max={derecho}>
            <div className="tnum" style={{ fontSize: 40, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{dispVac}</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.85)", fontWeight: 600, marginTop: 2 }}>días</div>
          </RingProgress>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>Vacaciones disponibles</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,.82)", marginTop: 5, lineHeight: 1.5 }}>{tomadas} tomados de {derecho} este año.</div>
            <button onClick={onSolicitar} style={apScr.vacBtn}><Icon name="plus" size={19} color="var(--ink-900)" /> Solicitar ausencia</button>
          </div>
        </div>

        {/* conexión */}
        <button onClick={onToggleOnline} style={apScr.netRow}>
          <span style={{ ...apScr.netIcon, background: online ? "var(--green-bg)" : "var(--amber-bg)" }}>
            <Icon name={online ? "check" : "alert"} size={20} color={online ? "var(--green)" : "var(--amber-ink)"} />
          </span>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 15.5, fontWeight: 700 }}>{online ? "Conectado" : "Sin conexión"}</div>
            <div style={{ fontSize: 13, color: "var(--ink-400)", marginTop: 1 }}>Toca para simular {online ? "perder" : "recuperar"} el internet</div>
          </div>
          <span style={{ ...apScr.toggle, background: online ? "var(--green)" : "var(--ink-200)" }}><span style={{ ...apScr.knob, transform: online ? "translateX(22px)" : "none" }} /></span>
        </button>

        <SectionLabel icon="calendar" text="Mis solicitudes" mt={24} />
        {misAus.length === 0 ? (
          <div style={{ fontSize: 14.5, color: "var(--ink-400)", padding: "2px" }}>Aún no has solicitado ausencias.</div>
        ) : (
          <div style={{ display: "grid", gap: 11 }}>
            {misAus.map((a) => {
              const t = rh.TIPO_AUSENCIA[a.tipo];
              const est = rh.AUSENCIA_ESTADO[a.estado];
              const habiles = rh.diasHabiles(a.ini, a.fin);
              const emoji = a.estado === "aprobada" ? "✅" : a.estado === "pendiente" ? "⏳" : "❌";
              return (
                <div key={a.id} style={apScr.ausCard}>
                  <span style={{ ...apScr.ausIcon, background: t.color + "1A" }}><Icon name={t.icon} size={19} color={t.color} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700 }}>{t.label} · <span className="tnum" style={{ color: "var(--ink-500)", fontWeight: 600 }}>{habiles} {habiles === 1 ? "día" : "días"}</span></div>
                    <div style={{ fontSize: 13, color: "var(--ink-400)", marginTop: 2 }}>{rh.fmtFecha(a.ini)} — {rh.fmtFecha(a.fin)}</div>
                    {a.motivoRechazo && <div style={{ fontSize: 12.5, color: "var(--red-ink)", marginTop: 3, lineHeight: 1.35 }}>Motivo: {a.motivoRechazo}</div>}
                  </div>
                  <span className={"badge " + est.cls} style={{ height: 26, fontSize: 12.5 }}>{emoji} {est.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- estilos de pantallas ----
const apScr = {
  scroll: { height: "100%", overflowY: "auto", background: "var(--bg)", WebkitOverflowScrolling: "touch" },
  body: { padding: "18px 16px 28px" },
  headerDark: { background: "linear-gradient(165deg,#1f2329,#14161a)", padding: "16px 18px 18px" },
  headBtn: { width: 44, height: 44, borderRadius: 13, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.08)", display: "grid", placeItems: "center" },
  avatar: { width: 52, height: 52, borderRadius: 15, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 18, flexShrink: 0 },

  pronoWrap: { marginTop: 18, background: "rgba(255,255,255,.06)", borderRadius: 16, padding: "13px 13px 11px" },
  netPill: { display: "inline-flex", alignItems: "center", gap: 6, height: 26, padding: "0 11px", borderRadius: 99, border: "none", color: "#fff", fontSize: 12.5, fontWeight: 700 },
  pronoRow: { display: "flex", justifyContent: "space-between", gap: 2 },
  pronoDay: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "8px 0", borderRadius: 11 },

  vacio: { background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 18, padding: "26px 20px", textAlign: "center" },
  vacioIcon: { width: 58, height: 58, borderRadius: 16, background: "var(--amber-bg)", display: "inline-grid", placeItems: "center", marginBottom: 12 },

  obraBig: { display: "block", width: "100%", textAlign: "left", background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 20, padding: 18, boxShadow: "var(--sh-sm)", cursor: "pointer", marginBottom: 12 },
  obraBigFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--ink-100)" },
  obraSem: { display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 16, padding: 13, cursor: "pointer", marginBottom: 11 },
  diaChip: { width: 56, height: 56, borderRadius: 14, background: "var(--bg)", border: "1px solid var(--ink-100)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, flexShrink: 0 },

  pushScreen: { position: "absolute", inset: 0, background: "var(--bg)", zIndex: 40, display: "flex", flexDirection: "column" },
  detHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--ink-900)", flexShrink: 0 },
  backBtn: { width: 44, height: 44, borderRadius: 13, border: "none", background: "rgba(255,255,255,.1)", display: "grid", placeItems: "center", cursor: "pointer" },

  dirCard: { display: "flex", gap: 12, padding: 15, background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 14 },
  ubicOculta: { display: "flex", alignItems: "center", gap: 9, marginTop: 10, padding: "13px 14px", background: "var(--ink-100)", borderRadius: 12, fontSize: 14, color: "var(--ink-500)", fontWeight: 600 },
  action: { display: "flex", alignItems: "center", justifyContent: "center", gap: 11, minHeight: 66, width: "100%", border: "none", borderRadius: 16, color: "#fff", fontSize: 18, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 22px rgba(20,22,26,.18)" },
  jornadaOk: { display: "flex", alignItems: "center", gap: 10, padding: "16px 16px", background: "var(--green-bg)", borderRadius: 16, fontSize: 15, fontWeight: 700, color: "var(--green-ink)", lineHeight: 1.35 },
  histRow: { display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 14 },
  histDot: { width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 },
  offNote: { display: "flex", alignItems: "center", gap: 9, padding: "12px 14px", background: "var(--amber-bg)", borderRadius: 12, fontSize: 13.5, color: "var(--amber-ink)", fontWeight: 600, lineHeight: 1.4 },

  mapa: { position: "relative", borderRadius: 18, overflow: "hidden", background: "linear-gradient(135deg,#dde6ec,#cfdbe3)", border: "1px solid var(--ink-200)" },
  mapaGrid: { position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 22px,rgba(120,140,155,.22) 22px,rgba(120,140,155,.22) 23px),repeating-linear-gradient(90deg,transparent,transparent 22px,rgba(120,140,155,.22) 22px,rgba(120,140,155,.22) 23px)" },
  mapaPin: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-100%)", width: 46, height: 46, borderRadius: "50% 50% 50% 0", background: "var(--red)", display: "grid", placeItems: "center", boxShadow: "0 6px 16px rgba(224,57,43,.45)", rotate: "45deg" },
  mapaLbl: { position: "absolute", left: 12, bottom: 12, background: "rgba(255,255,255,.92)", borderRadius: 9, padding: "7px 11px", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 },

  gpsBox: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 18, padding: "16px", background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 14 },
  spinner: { width: 22, height: 22, borderRadius: "50%", border: "3px solid var(--ink-200)", borderTopColor: "var(--blue-600)", animation: "spin .8s linear infinite", display: "inline-block" },
  gpsOk: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18, padding: "16px", background: "var(--green-bg)", borderRadius: 14, fontSize: 15, fontWeight: 700, color: "var(--green-ink)" },
  exito: { textAlign: "center", padding: "30px 6px 10px" },
  exitoIcon: { width: 100, height: 100, borderRadius: "50%", background: "var(--green)", display: "inline-grid", placeItems: "center", boxShadow: "0 14px 34px rgba(63,174,74,.4)" },

  matCard: { display: "flex", alignItems: "center", gap: 12, padding: 16, background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 16 },
  aviso: { display: "flex", gap: 10, alignItems: "flex-start", marginTop: 18, padding: "14px 15px", background: "var(--ink-100)", borderRadius: 13, fontSize: 13.5, color: "var(--ink-500)", lineHeight: 1.45 },

  tipoBtn: { display: "flex", alignItems: "center", gap: 11, padding: "14px 13px", border: "2px solid", borderRadius: 15, cursor: "pointer", minHeight: 64 },
  tipoIcon: { width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", flexShrink: 0 },
  tomarFoto: { width: "100%", padding: "28px 16px", background: "var(--surface)", border: "2px dashed var(--ink-200)", borderRadius: 18, cursor: "pointer", textAlign: "center" },
  previewImg: { width: "100%", height: 220, objectFit: "cover", borderRadius: 16, display: "block" },
  cambiarFoto: { position: "absolute", top: 12, right: 12, height: 38, padding: "0 16px", borderRadius: 10, border: "none", background: "rgba(20,22,26,.7)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  toastOk: { display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "15px 16px", background: "var(--green-bg)", borderRadius: 14, fontSize: 15, fontWeight: 700, color: "var(--green-ink)" },
  toastCola: { display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "15px 16px", background: "var(--amber-bg)", borderRadius: 14, fontSize: 14.5, fontWeight: 700, color: "var(--amber-ink)", lineHeight: 1.4 },
  fotoRow: { display: "flex", alignItems: "center", gap: 12, padding: 11, background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 14 },
  fotoThumb: { width: 50, height: 50, borderRadius: 11, objectFit: "cover", flexShrink: 0 },

  vacHero: { background: "linear-gradient(145deg,var(--star-orange),#d9791e)", borderRadius: 20, padding: 18, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 12px 28px rgba(217,122,30,.3)" },
  vacBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48, padding: "0 16px", marginTop: 13, borderRadius: 12, border: "none", background: "#fff", color: "var(--ink-900)", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%" },
  netRow: { display: "flex", alignItems: "center", gap: 13, width: "100%", marginTop: 16, padding: 14, background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 16, cursor: "pointer" },
  netIcon: { width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", flexShrink: 0 },
  toggle: { width: 48, height: 28, borderRadius: 99, position: "relative", flexShrink: 0, transition: "background .2s", display: "inline-block" },
  knob: { position: "absolute", top: 3, left: 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "transform .2s", boxShadow: "0 1px 3px rgba(0,0,0,.25)" },
  ausCard: { display: "flex", alignItems: "center", gap: 12, padding: 13, background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 14 },
  ausIcon: { width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", flexShrink: 0 },
};

Object.assign(window, {
  PRONOSTICO, CLIMA_AP, obraMateriales, MapaMini, RingProgress,
  MisObrasScreen, ObraDetalleMobile, CheckinScreen, MaterialesScreen, FotoScreen, PerfilScreen, apScr,
});
