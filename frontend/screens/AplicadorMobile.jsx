/* global React, Icon, OBRAS, useKlikaStore, useRHStore, SolicitarAusencia, KlikaAPI, KlikaData,
   MisObrasScreen, ObraDetalleMobile, CheckinScreen, MaterialesScreen, FotoScreen, PerfilScreen, PRONOSTICO */
// ============================================================
//  Marco de teléfono reutilizable
// ============================================================
const { useState: useStateAp, useEffect: useEffectAp } = React;

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
//  Pantalla 10 · Vista del aplicador (móvil) — orchestrador
// ============================================================
function AplicadorMobile({ onKlika, setRole }) {
  const store = useKlikaStore();
  const rh = useRHStore();

  // Usuario autenticado
  const yoUser = window.KlikaAPI?.usuario();
  const yo = rh.empleado(yoUser?.id) ?? rh.empleado("U-4") ?? rh.empleados[0];
  const yoNombre = yoUser?.nombre ?? yo?.nombre ?? "Aplicador";

  // Datos cargados del backend
  const [obrasData, setObrasData] = useStateAp(null);
  const [pronoData, setPronoData] = useStateAp(null);

  // Navegación: tab base + pantalla push encima
  const [tab, setTabRaw] = useStateAp("obras"); // obras | foto | perfil
  const [screen, setScreen] = useStateAp(null);  // null | obraDetalle | checkin | materiales | fotoScreen
  const [obraAbierta, setObraAbierta] = useStateAp(null);

  // Estado runtime
  const [online, setOnline] = useStateAp(navigator.onLine !== false);
  const [checkins, setCheckins] = useStateAp({});    // obraId → { entrada, salida }
  const [asistIds, setAsistIds] = useStateAp({});    // obraId → asistenciaId backend
  const [fotosRecientes, setFotosRecientes] = useStateAp([]);
  const [ausOpen, setAusOpen] = useStateAp(false);
  const [scanOpen, setScanOpen] = useStateAp(false);

  // ---- Carga inicial ----
  useEffectAp(() => {
    if (!window.KlikaData || !KlikaData.conectado()) return;

    KlikaData.obras.lista({ per_page: 20 }).then((res) => {
      const arr = (res.data ?? res)
        .filter((o) => ["proceso", "aprobada", "en_proceso"].includes(o.estado))
        .map((o) => ({
          id: o.codigo ?? String(o.id), _id: o.id,
          clienteNom: o.cliente?.nombre ?? "Cliente",
          titulo: o.titulo ?? "",
          cuadrilla: o.cuadrilla_id ?? null,
          estado: o.estado === "en_proceso" ? "proceso" : (o.estado ?? "proceso"),
          direccion: o.direccion ?? "",
          total: Number(o.total ?? 0),
          mapa: o.ubicacion_visible !== false,
          secciones: o.secciones?.length ? o.secciones : [{ m2: o.m2_total ?? 120, manos: 2 }],
        }));
      if (arr.length) {
        setObrasData(arr);
        // Cargar clima de la primera obra para el pronóstico
        KlikaData.obras.clima(arr[0]._id).then((cr) => {
          const dias = (cr.data ?? cr).dias ?? cr;
          if (Array.isArray(dias) && dias.length) {
            const DIAS_NAMES = ["Hoy", "Mié", "Jue", "Vie", "Sáb", "Dom", "Lun"];
            setPronoData(dias.slice(0, 7).map((d, i) => {
              const prob = Number(d.prob_lluvia ?? d.precipitacion ?? 0);
              const cond = d.bloqueado ? "bad" : d.apto === false ? "warn" : prob >= 80 ? "bad" : prob >= 40 ? "warn" : "ok";
              return { dia: DIAS_NAMES[i] ?? `D${i + 1}`, icon: cond === "bad" ? "rain" : cond === "warn" ? "cloud" : "sun", prob, cond };
            }));
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const misObras = obrasData ?? OBRAS.filter((o) => o.cuadrilla === "CU-1" && ["proceso", "aprobada"].includes(o.estado));

  // Construir arrays para MisObrasScreen
  const hoyObras = misObras.slice(0, 1).map((o) => ({ obra: o, cond: "ok" }));
  const DIAS_SEM = ["Mié 4", "Jue 5", "Vie 6", "Sáb 7", "Dom 8", "Lun 9"];
  const semanaObras = misObras.slice(1, 7).map((o, i) => ({ obra: o, dia: DIAS_SEM[i] ?? "—", cond: "ok" }));

  // ---- Helpers de navegación ----
  function setTab(t) { setTabRaw(t); setScreen(null); if (t !== "obras") setObraAbierta(null); }

  function abrirObra(obra) { setObraAbierta(obra); setScreen("obraDetalle"); }

  function confirmarCheckin(hora) {
    if (!obraAbierta) return;
    setCheckins((c) => ({ ...c, [obraAbierta.id]: { entrada: hora, salida: null } }));
    if (window.KlikaData && KlikaData.conectado()) {
      KlikaData.asistencias.checkin({ obra_id: obraAbierta._id ?? obraAbierta.id })
        .then((r) => { if (r?.id) setAsistIds((m) => ({ ...m, [obraAbierta.id]: r.id })); })
        .catch(() => {});
    }
    setScreen("obraDetalle");
  }

  function hacerCheckout() {
    if (!obraAbierta) return;
    const h = new Date().toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", hour12: true });
    setCheckins((c) => ({ ...c, [obraAbierta.id]: { ...c[obraAbierta.id], salida: h } }));
    if (window.KlikaData && KlikaData.conectado()) {
      const aId = asistIds[obraAbierta.id];
      if (aId) KlikaData.asistencias.checkout({ asistencia_id: aId }).catch(() => {});
    }
  }

  function subirFoto(data) {
    setFotosRecientes((f) => [data, ...f].slice(0, 8));
  }

  // Datos del perfil
  const dispVac = yo ? rh.vacacionesDisponibles(yo) : 0;
  const derecho = yo ? rh.derechoVacaciones(yo) : 30;
  const tomadas = yo ? rh.vacacionesTomadas(yo) : 0;
  const misAus = (yo ? rh.ausenciasDe(yo.id) : rh.ausenciasDe("U-4")).sort((a, b) => b.ini.localeCompare(a.ini));

  const checkinActual = obraAbierta ? (checkins[obraAbierta.id] ?? null) : null;
  const historial = checkinActual ? [
    { tipo: "entrada", hora: checkinActual.entrada },
    ...(checkinActual.salida ? [{ tipo: "salida", hora: checkinActual.salida }] : []),
  ] : [];

  return (
    <PhoneFrame>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

        {/* === PANTALLAS BASE (por tab) === */}
        {tab === "obras" && (
          <MisObrasScreen
            nombre={yoNombre.split(" ")[0]}
            hoyObras={hoyObras}
            semanaObras={semanaObras}
            onOpenObra={abrirObra}
            online={online}
            onToggleOnline={() => setOnline((v) => !v)}
            onKlika={onKlika}
            onLogout={() => setRole("dueno")}
            pronostico={pronoData ?? PRONOSTICO}
          />
        )}
        {tab === "foto" && (
          <FotoScreen
            obra={null}
            obras={misObras}
            online={online}
            recientes={fotosRecientes}
            onBack={null}
            onSubir={subirFoto}
            onPickObra={(id) => setObraAbierta(misObras.find((o) => o.id === id))}
          />
        )}
        {tab === "perfil" && (
          <PerfilScreen
            nombre={yoNombre}
            cargo={yo?.cargo ?? "Aplicador"}
            color={yo?.color ?? "var(--blue-600)"}
            dispVac={dispVac}
            derecho={derecho}
            tomadas={tomadas}
            misAus={misAus}
            rh={rh}
            online={online}
            onToggleOnline={() => setOnline((v) => !v)}
            onSolicitar={() => setAusOpen(true)}
            onLogout={() => setRole("dueno")}
          />
        )}

        {/* === BARRA DE TABS (visible solo cuando no hay push screen) === */}
        {!screen && (
          <div style={ap.tabBar}>
            {[
              { key: "obras", icon: "location", label: "Mis obras" },
              { key: "foto",  icon: "camera",   label: "Fotos" },
              { key: "perfil", icon: "user",    label: "Perfil" },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ ...ap.tabBtn, color: tab === t.key ? "var(--blue-600)" : "var(--ink-400)" }}>
                <Icon name={t.icon} size={22} color={tab === t.key ? "var(--blue-600)" : "var(--ink-400)"} />
                <span style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* === PUSH SCREENS (absolutos, cubren todo) === */}
        {screen === "obraDetalle" && obraAbierta && (
          <ObraDetalleMobile
            obra={obraAbierta}
            checkin={checkinActual}
            historial={historial}
            online={online}
            onBack={() => setScreen(null)}
            onCheckin={() => setScreen("checkin")}
            onCheckout={hacerCheckout}
            onFoto={() => setScreen("fotoScreen")}
            onMateriales={() => setScreen("materiales")}
          />
        )}
        {screen === "checkin" && obraAbierta && (
          <CheckinScreen
            obra={obraAbierta}
            online={online}
            onBack={() => setScreen("obraDetalle")}
            onConfirm={confirmarCheckin}
          />
        )}
        {screen === "materiales" && obraAbierta && (
          <MaterialesScreen
            obra={obraAbierta}
            store={store}
            onBack={() => setScreen("obraDetalle")}
            onScan={() => setScanOpen(true)}
          />
        )}
        {screen === "fotoScreen" && (
          <FotoScreen
            obra={obraAbierta}
            obras={null}
            online={online}
            recientes={fotosRecientes}
            onBack={() => setScreen(obraAbierta ? "obraDetalle" : null)}
            onSubir={subirFoto}
            onPickObra={null}
          />
        )}
      </div>

      {scanOpen && <ScannerOverlay store={store} onClose={() => setScanOpen(false)} />}
      {ausOpen && (
        <SolicitarAusencia store={rh} empleadoFijo={yo?.id ?? "U-4"}
          onClose={() => setAusOpen(false)} onSubmit={() => setAusOpen(false)} />
      )}
    </PhoneFrame>
  );
}

// ============================================================
//  Overlay de escáner de código de barras (móvil)
// ============================================================
function ScannerOverlay({ store, onClose }) {
  const [fase, setFase] = useStateAp("buscando");
  const [mat, setMat] = useStateAp(null);
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);

  React.useEffect(() => {
    let cancel = false;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          if (cancel) { stream.getTracks().forEach((t) => t.stop()); return; }
          streamRef.current = stream;
          if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
        }).catch(() => {});
    }
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
  tabBar: { display: "flex", borderTop: "1px solid var(--ink-100)", background: "var(--surface)", flexShrink: 0 },
  tabBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: "10px 0 12px", border: "none", background: "transparent", cursor: "pointer", transition: "color .15s" },
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
