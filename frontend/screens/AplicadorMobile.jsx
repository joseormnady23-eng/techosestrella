/* global React, Icon, OBRAS, CUADRILLAS, ROLES, useKlikaStore, money0, useRHStore, SolicitarAusencia */
// ============================================================
//  Marco de teléfono reutilizable
// ============================================================
const { useState: useStateAp } = React;

function PhoneFrame({ children, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {label && <div style={{ color: "var(--ink-300)", fontSize: 13, fontWeight: 600 }}>{label}</div>}
      <div style={pf.frame} className="r-phoneframe">
        <div style={pf.notch} className="r-phonenotch" />
        <div style={pf.screen} className="r-phonescreen">
          <div style={pf.statusbar}>
            <span style={{ fontWeight: 700 }}>9:41</span>
            <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span style={pf.sbIcon} /><span style={pf.sbIcon} /><span style={{ ...pf.sbIcon, width: 22, borderRadius: 3 }} />
            </span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  Pantalla 10 · Vista del aplicador (móvil)
// ============================================================
function AplicadorMobile({ onKlika, setRole, role }) {
  const store = useKlikaStore();
  const rh = useRHStore();
  const yo = rh.empleado("U-4"); // Wilkin Suero
  const [checkedIn, setCheckedIn] = useStateAp(false);
  const [scanOpen, setScanOpen] = useStateAp(false);
  const [ausOpen, setAusOpen] = useStateAp(false);
  const misObras = OBRAS.filter((o) => o.cuadrilla === "CU-1" && ["proceso", "aprobada"].includes(o.estado));
  const misAus = rh.ausenciasDe("U-4").sort((a, b) => b.ini.localeCompare(a.ini));
  const dispVac = rh.vacacionesDisponibles(yo);

  return (
    <PhoneFrame>
      <div style={ap.wrap}>
        {/* header */}
        <div style={ap.header}>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)" }}>Hola,</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#fff" }}>Wilkin Suero</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onKlika} style={ap.headBtn}><Icon name="sparkle" size={20} color="#fff" /></button>
            <button onClick={() => setRole("dueno")} style={ap.headBtn} title="Salir de vista aplicador"><Icon name="logout" size={19} color="#fff" /></button>
          </div>
        </div>

        <div style={{ padding: "0 16px 24px", marginTop: -28 }}>
          {/* check-in grande */}
          <button onClick={() => setCheckedIn((v) => !v)} style={{ ...ap.checkin, background: checkedIn ? "var(--green)" : "var(--blue-600)" }}>
            <span style={ap.checkinIcon}><Icon name={checkedIn ? "checkcircle" : "location"} size={34} color="#fff" /></span>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: "#fff" }}>{checkedIn ? "Asistencia marcada" : "Marcar asistencia"}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", marginTop: 2 }}>{checkedIn ? "09:41 a.m. · Villa Olga ✓" : "Check-in con tu ubicación (GPS)"}</div>
            </div>
          </button>

          {/* escanear código de barras (almacén) */}
          <button onClick={() => setScanOpen(true)} style={ap.scanBig}>
            <span style={ap.scanBigIcon}><Icon name="barcode" size={30} color="#fff" /></span>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Escanear material</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", marginTop: 2 }}>Lee el código de barras con la cámara</div>
            </div>
            <Icon name="camera" size={24} color="rgba(255,255,255,.9)" />
          </button>

          {/* acciones grandes */}
          <div style={ap.bigGrid}>
            <button style={ap.bigBtn}><span style={{ ...ap.bigIcon, background: "var(--blue-50)" }}><Icon name="camera" size={28} color="var(--blue-600)" /></span><span style={ap.bigLbl}>Subir fotos</span></button>
            <button style={ap.bigBtn}><span style={{ ...ap.bigIcon, background: "var(--purple-bg)" }}><Icon name="location" size={28} color="var(--purple)" /></span><span style={ap.bigLbl}>Cómo llegar</span></button>
          </div>

          {/* mis obras de hoy */}
          <div style={ap.sectionTitle}>Mis obras de hoy</div>
          {misObras.map((o) => (
            <div key={o.id} style={ap.obraCard}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-400)", fontWeight: 600 }}>{o.id}</span>
                <span className="badge badge-amber" style={{ height: 22 }}><span className="dot" />En proceso</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>{o.clienteNom.split("·")[0]}</div>
              <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>{o.titulo}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, fontSize: 13, color: "var(--ink-500)" }}>
                <Icon name="location" size={15} color="var(--blue-600)" /> {o.direccion.split(",")[0]}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-soft" style={{ flex: 1, justifyContent: "center", height: 46, fontSize: 14.5 }}><Icon name="camera" size={18} /> Fotos</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", height: 46, fontSize: 14.5 }}><Icon name="location" size={18} /> Ir</button>
              </div>
            </div>
          ))}

          {/* mis vacaciones */}
          <div style={ap.sectionTitle}>Mis vacaciones</div>
          <div style={ap.vacHero}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
              <div>
                <div className="tnum" style={{ fontSize: 44, fontWeight: 800, lineHeight: 1, color: "#fff" }}>{dispVac}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)", marginTop: 4, fontWeight: 600 }}>días disponibles</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 12.5, color: "rgba(255,255,255,.72)", textAlign: "right", lineHeight: 1.5 }}>
                {rh.vacacionesTomadas(yo)} tomados<br />de {rh.derechoVacaciones(yo)} al año
              </div>
            </div>
            <button onClick={() => setAusOpen(true)} style={ap.vacBtn}><Icon name="plus" size={18} color="var(--ink-900)" /> Solicitar ausencia</button>
          </div>

          <div style={{ ...ap.sectionTitle, marginTop: 18 }}>Mis solicitudes</div>
          {misAus.length === 0 ? (
            <div style={{ fontSize: 13.5, color: "var(--ink-400)", padding: "4px 2px" }}>Aún no has solicitado ausencias.</div>
          ) : misAus.map((a) => {
            const t = rh.TIPO_AUSENCIA[a.tipo];
            const est = rh.AUSENCIA_ESTADO[a.estado];
            const habiles = rh.diasHabiles(a.ini, a.fin);
            return (
              <div key={a.id} style={ap.ausCard}>
                <span style={{ ...ap.ausIcon, background: t.color + "1A" }}><Icon name={t.icon} size={18} color={t.color} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.label} · <span className="tnum" style={{ color: "var(--ink-500)", fontWeight: 600 }}>{habiles} {habiles === 1 ? "día" : "días"}</span></div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 2 }}>{rh.fmtFecha(a.ini)} — {rh.fmtFecha(a.fin)}</div>
                  {a.motivoRechazo && <div style={{ fontSize: 11.5, color: "var(--red-ink)", marginTop: 3, lineHeight: 1.35 }}>Rechazo: {a.motivoRechazo}</div>}
                </div>
                <span className={"badge " + est.cls}><span className="dot" />{est.label}</span>
              </div>
            );
          })}

          <div style={ap.note}>
            <Icon name="shield" size={15} color="var(--ink-400)" />
            <span>Solo ves las obras asignadas a tu cuadrilla. Las finanzas no se muestran.</span>
          </div>
        </div>
      </div>
      {scanOpen && <ScannerOverlay store={store} onClose={() => setScanOpen(false)} />}
      {ausOpen && (
        <SolicitarAusencia store={rh} empleadoFijo="U-4" onClose={() => setAusOpen(false)} onSubmit={() => setAusOpen(false)} />
      )}
    </PhoneFrame>
  );
}

// ============================================================
//  Overlay de escáner de código de barras (móvil)
// ============================================================
function ScannerOverlay({ store, onClose }) {
  const [fase, setFase] = useStateAp("buscando"); // buscando | encontrado
  const [mat, setMat] = useStateAp(null);
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);

  React.useEffect(() => {
    let cancel = false;
    // intenta usar la cámara real; si no, sigue con el visor simulado
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          if (cancel) { stream.getTracks().forEach((t) => t.stop()); return; }
          streamRef.current = stream;
          if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
        }).catch(() => {});
    }
    // simula la detección de un código tras un momento
    const t = setTimeout(() => {
      if (cancel) return;
      const conCodigo = store.materiales.filter((m) => store.codigoDe(m.id));
      const elegido = conCodigo[Math.floor(Math.random() * conCodigo.length)] || store.materiales[0];
      setMat(elegido);
      setFase("encontrado");
    }, 2200);
    return () => {
      cancel = true; clearTimeout(t);
      if (streamRef.current) streamRef.current.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  const code = mat ? store.codigoDe(mat.id) : null;
  const bajo = mat && mat.stock < mat.min;

  return (
    <div style={sc.overlay}>
      <video ref={videoRef} muted playsInline style={sc.video} />
      <div style={sc.top}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Escanear material</span>
        <button onClick={onClose} style={sc.closeBtn}><Icon name="x" size={20} color="#fff" /></button>
      </div>

      {fase === "buscando" ? (
        <div style={sc.center}>
          <div style={sc.frame}>
            <span style={{ ...sc.corner, top: -2, left: -2, borderWidth: "4px 0 0 4px" }} />
            <span style={{ ...sc.corner, top: -2, right: -2, borderWidth: "4px 4px 0 0" }} />
            <span style={{ ...sc.corner, bottom: -2, left: -2, borderWidth: "0 0 4px 4px" }} />
            <span style={{ ...sc.corner, bottom: -2, right: -2, borderWidth: "0 4px 4px 0" }} />
            <div style={sc.scanline} />
          </div>
          <div style={sc.hint}><Icon name="barcode" size={17} color="rgba(255,255,255,.85)" /> Apunta al código de barras…</div>
        </div>
      ) : (
        <div style={sc.resultWrap} className="fade-up">
          <div style={sc.resultCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green-ink)", fontWeight: 700, fontSize: 13 }}>
              <Icon name="checkcircle" size={18} color="var(--green)" /> Código leído
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 10, lineHeight: 1.25 }}>{mat.nombre}</div>
            <div className="mono" style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 4 }}>{code}</div>
            <div style={sc.statRow}>
              <div style={sc.stat}><div style={{ fontSize: 11, color: "var(--ink-400)", fontWeight: 600 }}>En stock</div><div className="tnum" style={{ fontSize: 22, fontWeight: 800, color: bajo ? "var(--red)" : "var(--ink-900)" }}>{mat.stock}</div></div>
              <div style={sc.stat}><div style={{ fontSize: 11, color: "var(--ink-400)", fontWeight: 600 }}>Mínimo</div><div className="tnum" style={{ fontSize: 22, fontWeight: 800, color: "var(--ink-500)" }}>{mat.min}</div></div>
              <div style={sc.stat}><div style={{ fontSize: 11, color: "var(--ink-400)", fontWeight: 600 }}>Unidad</div><div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 5 }}>{mat.unidad}</div></div>
            </div>
            {bajo && <div style={sc.lowWarn}><Icon name="alert" size={15} color="var(--red)" /> Por debajo del mínimo — conviene reponer</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", height: 48 }} onClick={() => { setFase("buscando"); setMat(null); setTimeout(onClose, 0); }}>Cerrar</button>
              <button className="btn btn-primary" style={{ flex: 1.4, justifyContent: "center", height: 48 }} onClick={() => { setFase("buscando"); setMat(null); }}>
                <Icon name="scan" size={18} /> Escanear otro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const pf = {
  frame: { width: 390, height: 800, background: "#000", borderRadius: 46, padding: 11, boxShadow: "0 40px 90px rgba(0,0,0,.5)", position: "relative" },
  notch: { position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", width: 120, height: 30, background: "#000", borderRadius: 99, zIndex: 10 },
  screen: { width: "100%", height: "100%", background: "var(--bg)", borderRadius: 36, overflow: "hidden", display: "flex", flexDirection: "column" },
  statusbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 26px 8px", fontSize: 14, color: "var(--ink-900)", flexShrink: 0, background: "transparent" },
  sbIcon: { width: 16, height: 11, borderRadius: 2, background: "var(--ink-700)", display: "inline-block" },
};

const ap = {
  wrap: { minHeight: "100%", background: "var(--bg)" },
  header: { background: "linear-gradient(160deg,var(--ink-900),#23252b)", padding: "16px 18px 44px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  headBtn: { width: 40, height: 40, borderRadius: 11, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.08)", display: "grid", placeItems: "center" },
  checkin: { display: "flex", alignItems: "center", gap: 14, width: "100%", padding: 18, borderRadius: 18, border: "none", boxShadow: "0 12px 30px rgba(30,127,194,.3)", cursor: "pointer" },
  checkinIcon: { width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  scanBig: { display: "flex", alignItems: "center", gap: 14, width: "100%", padding: 16, marginTop: 12, borderRadius: 18, border: "none", background: "linear-gradient(135deg,var(--ink-900),#2f3a44)", boxShadow: "0 12px 30px rgba(26,26,26,.28)", cursor: "pointer" },
  scanBigIcon: { width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,.14)", display: "grid", placeItems: "center", flexShrink: 0 },
  bigGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 },
  bigBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "18px 12px", background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 16, cursor: "pointer" },
  bigIcon: { width: 58, height: 58, borderRadius: 15, display: "grid", placeItems: "center" },
  bigLbl: { fontSize: 14.5, fontWeight: 700 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".5px", margin: "24px 0 12px" },
  obraCard: { background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 16, padding: 16, marginBottom: 12 },
  note: { display: "flex", gap: 9, alignItems: "flex-start", marginTop: 18, padding: "12px 13px", background: "var(--ink-100)", borderRadius: 12, fontSize: 12.5, color: "var(--ink-500)", lineHeight: 1.45 },
  vacHero: { background: "linear-gradient(140deg,var(--star-orange),#d97a1e)", borderRadius: 18, padding: 18, display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 12px 28px rgba(217,122,30,.32)" },
  vacBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 12, border: "none", background: "#fff", color: "var(--ink-900)", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  ausCard: { display: "flex", alignItems: "center", gap: 12, padding: 13, background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 14, marginBottom: 10 },
  ausIcon: { width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 },
};

const sc = {
  overlay: { position: "absolute", inset: 0, background: "#0b0d10", zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden" },
  video: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: .55 },
  top: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", color: "#fff", background: "linear-gradient(180deg,rgba(0,0,0,.55),transparent)" },
  closeBtn: { width: 38, height: 38, borderRadius: 11, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.1)", display: "grid", placeItems: "center" },
  center: { position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, padding: 24 },
  frame: { position: "relative", width: 248, height: 168, borderRadius: 12 },
  corner: { position: "absolute", width: 30, height: 30, borderStyle: "solid", borderColor: "#fff", borderRadius: 3 },
  scanline: { position: "absolute", left: 6, right: 6, height: 3, borderRadius: 99, background: "linear-gradient(90deg,transparent,#3FAE4A,transparent)", boxShadow: "0 0 14px 2px rgba(63,174,74,.7)", animation: "scanmove 2s ease-in-out infinite" },
  hint: { display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.9)", fontSize: 14, fontWeight: 600 },
  resultWrap: { position: "relative", marginTop: "auto", padding: 14 },
  resultCard: { background: "var(--surface)", borderRadius: 20, padding: 18 },
  statRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16, padding: "14px 0", borderTop: "1px solid var(--ink-100)", borderBottom: "1px solid var(--ink-100)" },
  stat: {},
  lowWarn: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "10px 12px", background: "var(--red-bg)", color: "var(--red-ink)", borderRadius: 10, fontSize: 12.5, fontWeight: 600 },
};

Object.assign(window, { PhoneFrame, AplicadorMobile });
