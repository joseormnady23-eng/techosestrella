/* global React, ReactDOM, Login, Dashboard, Sidebar, Topbar, NAV_META, ROLES, OBRAS,
   ObrasList, ObraDetalle, Cotizacion, Planificador, Inventario, Cuadrillas, Clientes,
   Reportes, AplicadorMobile, KlikaPanel, PortalCliente, Vehiculos, Usuarios, Asistencias, Icon,
   Facturas, Gastos, ReportesDGII, SecuenciasNCF, RecursosHumanos */
// ============================================================
//  Klika · App principal (router por estado)
// ============================================================
const { useState, useEffect } = React;

const TITLES = {
  dashboard: ["Inicio", "Resumen del día"],
  obras: ["Obras", "Todas las obras y su estado"],
  obra: ["Detalle de obra", ""],
  cotizacion: ["Cotizaciones", "Motor de cálculo de materiales"],
  facturas: ["Facturas", "Facturación electrónica · NCF / e-CF"],
  gastos: ["Gastos", "Compras y comprobantes · reporte 606"],
  dgii: ["Reportes DGII", "Formatos 606 y 607"],
  ncf: ["Secuencias NCF", "Rangos autorizados por la DGII"],
  planificador: ["Planificador del mes", "Obras cruzadas con el clima"],
  inventario: ["Inventario", "Materiales y movimientos"],
  rrhh: ["Recursos Humanos", "Empleados, ausencias y vacaciones"],
  cuadrillas: ["Cuadrillas", "Equipos y asignaciones"],
  vehiculos: ["Vehículos", "Flota y asignación a cuadrillas"],
  asistencias: ["Asistencias", "Check-ins de cuadrillas · corrección"],
  clientes: ["Clientes", "CRM e historial de obras"],
  usuarios: ["Usuarios", "Cuentas y permisos · solo dueño"],
  reportes: ["Reportes", "Finanzas y desempeño"],
  config: ["Configuración", "Ajustes del sistema · solo dueño"],
};

function Placeholder({ title }) {
  return (
    <div style={{ padding: 40, maxWidth: 1320, margin: "0 auto" }}>
      <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink-400)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-700)" }}>{title}</div>
        <div style={{ marginTop: 6, fontSize: 14 }}>Pantalla en construcción — la armamos en el siguiente paso.</div>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState("login");      // login | app
  const [role, setRole] = useState("dueno");
  const [screen, setScreen] = useState("dashboard");
  const [obraId, setObraId] = useState(null);
  const [obraTab, setObraTab] = useState("resumen");
  const [klikaOpen, setKlikaOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  // navegación
  function nav(to, arg, tab) {
    if (to === "obra") { setObraId(arg); setObraTab(tab || "resumen"); setScreen("obra"); }
    else if (to === "cotizacion-obra") { setObraId(arg); setObraTab("cotizacion"); setScreen("obra"); }
    else { setScreen(to); }
    setNavOpen(false);
    document.querySelector("#scroll-area")?.scrollTo(0, 0);
  }

  // si el rol es aplicador, va directo a la vista móvil;
  // si cambia de rol y la pantalla actual no le corresponde, vuelve al inicio
  useEffect(() => {
    if (role === "aplicador") { setScreen("aplicador"); return; }
    if (screen === "aplicador") { setScreen("dashboard"); return; }
    const permitido = ["obra", ...ROLES[role].nav];
    if (!permitido.includes(screen)) setScreen("dashboard");
  }, [role]);

  if (view === "login") {
    return <Login onEnter={(usuario) => {
      // Si el login real devolvió un usuario, entra con su rol del backend.
      if (usuario && usuario.rol) setRole(usuario.rol);
      setView("app");
    }} />;
  }

  // ---- Vista aplicador (móvil, sin shell) ----
  if (role === "aplicador") {
    return (
      <div style={app.mobileStage} className="r-mobilestage">
        <AplicadorMobile onKlika={() => setKlikaOpen(true)} setRole={setRole} role={role} />
        {klikaOpen && <KlikaPanel onClose={() => setKlikaOpen(false)} mobile />}
      </div>
    );
  }

  const obra = OBRAS.find((o) => o.id === obraId);
  const [tTitle, tSub] = TITLES[screen] || ["", ""];

  let content;
  switch (screen) {
    case "dashboard":   content = <Dashboard onNav={nav} onKlika={() => setKlikaOpen(true)} role={role} />; break;
    case "obras":       content = <ObrasList onNav={nav} role={role} />; break;
    case "obra":        content = <ObraDetalle obra={obra} tab={obraTab} setTab={setObraTab} onNav={nav} role={role} onPortal={() => setPortalOpen(true)} />; break;
    case "cotizacion":  content = <Cotizacion onNav={nav} role={role} onPortal={() => setPortalOpen(true)} />; break;
    case "facturas":    content = <Facturas role={role} />; break;
    case "gastos":      content = <Gastos role={role} />; break;
    case "dgii":        content = <ReportesDGII role={role} />; break;
    case "ncf":         content = <SecuenciasNCF role={role} />; break;
    case "planificador":content = <Planificador onNav={nav} onKlika={() => setKlikaOpen(true)} role={role} />; break;
    case "inventario":  content = <Inventario role={role} />; break;
    case "rrhh":        content = <RecursosHumanos role={role} />; break;
    case "cuadrillas":  content = <Cuadrillas onNav={nav} role={role} />; break;
    case "vehiculos":   content = <Vehiculos role={role} />; break;
    case "asistencias": content = <Asistencias role={role} />; break;
    case "clientes":    content = <Clientes onNav={nav} role={role} />; break;
    case "usuarios":    content = <Usuarios role={role} />; break;
    case "reportes":    content = <Reportes role={role} />; break;
    case "config":      content = <Configuracion />; break;
    default:            content = <Placeholder title={NAV_META[screen]?.label || "Pantalla"} />;
  }

  // título dinámico para detalle de obra
  const headTitle = screen === "obra" && obra ? obra.titulo : tTitle;
  const headSub = screen === "obra" && obra ? `${obra.id} · ${obra.clienteNom}` : tSub;

  const actions = null;

  return (
    <div style={app.shell}>
      <Sidebar role={role} screen={screen} onNav={nav} onKlika={() => setKlikaOpen(true)} open={navOpen} />
      <div className={"r-scrim" + (navOpen ? " open" : "")} onClick={() => setNavOpen(false)} />
      <div style={app.main}>
        <Topbar role={role} setRole={setRole} title={headTitle} sub={headSub}
          onKlika={() => setKlikaOpen(true)} actions={actions} onMenu={() => setNavOpen(true)} />
        <div id="scroll-area" style={app.scroll}>
          <div key={screen + obraId}>{content}</div>
        </div>
      </div>

      {klikaOpen && <KlikaPanel onClose={() => setKlikaOpen(false)} onNav={nav} />}
      {portalOpen && <PortalCliente onClose={() => setPortalOpen(false)} />}
    </div>
  );
}

const app = {
  shell: { display: "flex", height: "100vh", overflow: "hidden" },
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  scroll: { flex: 1, overflowY: "auto" },
  mobileStage: { minHeight: "100vh", background: "var(--ink-900)", display: "grid", placeItems: "center", padding: "24px 0" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
