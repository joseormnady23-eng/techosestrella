/* global React, Icon, KlikaMark, ROLES, NAV_META, useKlikaStore */
// ============================================================
//  Shell · barra lateral + topbar + selector de rol
// ============================================================
const { useState, useEffect: useEffectShell } = React;

// Captura el evento de instalación PWA globalmente
let _pwaPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  _pwaPrompt = e;
  // Notifica a los componentes montados
  window.dispatchEvent(new Event('pwa-installable'));
});
window.addEventListener('appinstalled', () => {
  _pwaPrompt = null;
  window.dispatchEvent(new Event('pwa-installed'));
});

function Sidebar({ role, screen, onNav, onKlika, open }) {
  const nav = ROLES[role].nav.filter((k) => k !== "klika");
  const store = useRHStore();
  const pendRrhh = store.pendientes().length;
  return (
    <aside style={sh.side} className={"r-sidebar" + (open ? " open" : "")}>
      <div style={sh.brand}><KlikaMark light /></div>

      <nav style={sh.nav}>
        {nav.map((k) => {
          const active = screen === k;
          const grupo = NAV_META[k].grupo;
          const badge = k === "rrhh" && pendRrhh > 0 ? pendRrhh : null;
          return (
            <React.Fragment key={k}>
              {grupo && <div style={sh.navGroup}>{grupo}</div>}
              <button onClick={() => onNav(k)} className={"k-navitem" + (active ? " active" : "")}>
                <Icon name={NAV_META[k].icon} size={20} />
                <span>{NAV_META[k].label}</span>
                {badge && <span style={sh.navBadge}>{badge}</span>}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", padding: "0 14px 14px" }}>
        <button onClick={onKlika} style={sh.klikaCard}>
          <div style={sh.klikaIcon}><Icon name="sparkle" size={18} color="#fff" /></div>
          <div style={{ textAlign: "left", lineHeight: 1.25 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#fff" }}>Pregúntale a Klika</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-300)" }}>Cotiza, reprograma, consulta</div>
          </div>
        </button>
      </div>
    </aside>
  );
}

function Topbar({ role, setRole, title, sub, onKlika, actions, onMenu }) {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(!!_pwaPrompt);

  useEffectShell(() => {
    const onInstallable = () => setCanInstall(true);
    const onInstalled   = () => setCanInstall(false);
    window.addEventListener('pwa-installable', onInstallable);
    window.addEventListener('pwa-installed',   onInstalled);
    return () => {
      window.removeEventListener('pwa-installable', onInstallable);
      window.removeEventListener('pwa-installed',   onInstalled);
    };
  }, []);

  async function instalarApp() {
    if (!_pwaPrompt) return;
    _pwaPrompt.prompt();
    const { outcome } = await _pwaPrompt.userChoice;
    if (outcome === 'accepted') { _pwaPrompt = null; setCanInstall(false); }
  }
  const store = useKlikaStore();
  const notifs = store.notifsDe(role);
  const noLeidas = store.noLeidasDe(role);
  const r = ROLES[role];
  function toggleNotifs() {
    setNotifOpen((v) => {
      const nv = !v;
      if (nv && noLeidas > 0) setTimeout(() => store.marcarLeidas(role), 1200);
      return nv;
    });
  }
  const notifTone = { ok: ["var(--green)", "checkcircle"], rechazo: ["var(--red)", "alert"], info: ["var(--blue-600)", "bell"] };
  return (
    <header style={sh.top} className="r-topbar">
      <button className="btn btn-icon btn-ghost r-hamburger" onClick={onMenu} title="Menú" style={{ flexShrink: 0 }}>
        <Icon name="menu" size={20} />
      </button>
      <div style={{ minWidth: 0 }}>
        <h1 style={sh.title} className="r-toptitle">{title}</h1>
        {sub && <div style={sh.sub}>{sub}</div>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
        <div style={sh.searchBox} className="r-topsearch">
          <Icon name="search" size={17} color="var(--ink-400)" />
          <input placeholder="Buscar obra, cliente, código…" style={sh.searchInput} />
          <kbd style={sh.kbd}>⌘K</kbd>
        </div>

        {actions}

        {canInstall && (
          <button onClick={instalarApp} className="btn btn-soft r-install-btn"
            title="Instalar como app en este dispositivo"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700,
              padding: "0 12px", height: 36, borderRadius: 10, whiteSpace: "nowrap",
              background: "var(--blue-50)", color: "var(--blue-600)", border: "1.5px solid var(--blue-100)" }}>
            <Icon name="download" size={16} color="var(--blue-600)" />
            <span className="r-install-label">Instalar app</span>
          </button>
        )}

        <div style={{ position: "relative" }}>
          <button className="btn btn-icon btn-ghost" title="Notificaciones" style={{ position: "relative" }} onClick={toggleNotifs}>
            <Icon name="bell" size={19} />
            {noLeidas > 0 && <span style={sh.dot} />}
          </button>
          {notifOpen && (
            <>
              <div onClick={() => setNotifOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
              <div style={sh.notifMenu} className="fade-up">
                <div style={sh.notifHead}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>Notificaciones</span>
                  {noLeidas > 0 && <span style={sh.notifCount}>{noLeidas} nueva{noLeidas > 1 ? "s" : ""}</span>}
                </div>
                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: "30px 18px", textAlign: "center", color: "var(--ink-400)", fontSize: 13 }}>No tienes notificaciones</div>
                  ) : notifs.map((n) => {
                    const [col, ic] = notifTone[n.tipo] || notifTone.info;
                    return (
                      <div key={n.id} style={{ ...sh.notifItem, background: n.leida ? "transparent" : "var(--blue-50)" }}>
                        <span style={{ ...sh.notifIcon, background: col + "1A" }}><Icon name={ic} size={16} color={col} /></span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink-900)" }}>{n.titulo}</div>
                          <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginTop: 2, lineHeight: 1.4 }}>{n.detalle}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 3 }}>{n.fecha}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <button onClick={onKlika} className="btn btn-icon btn-soft" title="Asistente Klika">
          <Icon name="sparkle" size={19} />
        </button>

        {/* Selector de rol (demo) */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setOpen((o) => !o)} style={sh.roleBtn}>
            <span style={sh.avatar}>{r.inicial}</span>
            <span style={{ textAlign: "left", lineHeight: 1.15 }} className="r-roletext">
              <span style={{ display: "block", fontWeight: 700, fontSize: 13 }}>{r.nombre}</span>
              <span style={{ display: "block", fontSize: 11.5, color: "var(--ink-400)" }}>{r.label}</span>
            </span>
            <Icon name="chevdown" size={15} color="var(--ink-400)" />
          </button>
          {open && (
            <>
              <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
              <div style={sh.roleMenu} className="fade-up">
                <div style={sh.roleMenuHead}>Cambiar de rol (demo)</div>
                {Object.entries(ROLES).map(([k, v]) => (
                  <button key={k} onClick={() => { setRole(k); setOpen(false); }}
                    style={{ ...sh.roleOpt, ...(k === role ? { background: "var(--blue-50)" } : {}) }}>
                    <span style={{ ...sh.avatar, background: "var(--ink-100)", color: "var(--ink-700)" }}>{v.inicial}</span>
                    <span style={{ textAlign: "left" }}>
                      <span style={{ display: "block", fontWeight: 600, fontSize: 13.5 }}>{v.label}</span>
                      <span style={{ display: "block", fontSize: 12, color: "var(--ink-400)" }}>{v.nombre}</span>
                    </span>
                    {k === role && <Icon name="check" size={16} color="var(--blue-600)" style={{ marginLeft: "auto" }} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const sh = {
  side: { width: "var(--side-w)", background: "var(--ink-900)", display: "flex", flexDirection: "column",
    flexShrink: 0, position: "relative", zIndex: 5 },
  brand: { padding: "20px 18px 18px", borderBottom: "1px solid rgba(255,255,255,.07)" },
  nav: { display: "flex", flexDirection: "column", gap: 3, padding: "14px 14px", flex: 1, minHeight: 0, overflowY: "auto" },
  navGroup: { fontSize: 10.5, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".7px", padding: "14px 12px 6px", marginTop: 4, borderTop: "1px solid rgba(255,255,255,.07)" },
  navItem: { position: "relative", display: "flex", alignItems: "center", gap: 12, height: 42, padding: "0 12px",
    borderRadius: 9, border: "none", background: "transparent", color: "var(--ink-300)", fontSize: 14, fontWeight: 600,
    textAlign: "left", transition: "background .12s, color .12s", width: "100%" },
  navItemActive: { background: "rgba(30,127,194,.16)", color: "#fff" },
  navBar: { position: "absolute", left: -14, top: 9, bottom: 9, width: 3.5, borderRadius: 4, background: "var(--blue-500)" },
  navBadge: { marginLeft: "auto", minWidth: 20, height: 20, padding: "0 6px", display: "inline-grid", placeItems: "center", borderRadius: 99, background: "var(--star-purple)", color: "#fff", fontSize: 11.5, fontWeight: 800 },
  klikaCard: { display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "12px",
    borderRadius: 12, border: "1px solid rgba(255,255,255,.1)",
    background: "linear-gradient(135deg, rgba(30,127,194,.22), rgba(123,79,160,.18))", cursor: "pointer" },
  klikaIcon: { width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0,
    background: "linear-gradient(135deg,var(--star-blue),var(--star-purple))" },

  top: { height: "var(--top-h)", background: "var(--surface)", borderBottom: "1px solid var(--ink-100)",
    display: "flex", alignItems: "center", gap: 18, padding: "0 26px", flexShrink: 0, position: "sticky", top: 0, zIndex: 20 },
  title: { margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", color: "var(--ink-900)", whiteSpace: "nowrap" },
  sub: { fontSize: 12.5, color: "var(--ink-400)", marginTop: 1 },
  searchBox: { display: "flex", alignItems: "center", gap: 9, height: 40, padding: "0 12px", width: 280,
    background: "var(--bg)", border: "1px solid var(--ink-100)", borderRadius: 9 },
  searchInput: { border: "none", background: "transparent", outline: "none", fontSize: 13.5, flex: 1, color: "var(--ink-900)" },
  kbd: { fontSize: 11, fontWeight: 600, color: "var(--ink-400)", background: "var(--surface)", border: "1px solid var(--ink-200)",
    borderRadius: 5, padding: "2px 6px" },
  dot: { position: "absolute", top: 8, right: 9, width: 8, height: 8, borderRadius: 99, background: "var(--red)", border: "2px solid #fff" },
  notifMenu: { position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: 13, boxShadow: "var(--sh-lg)", overflow: "hidden", zIndex: 50 },
  notifHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 15px", borderBottom: "1px solid var(--ink-100)" },
  notifCount: { fontSize: 11, fontWeight: 700, color: "var(--blue-700)", background: "var(--blue-50)", padding: "3px 8px", borderRadius: 99 },
  notifItem: { display: "flex", gap: 11, alignItems: "flex-start", padding: "12px 15px", borderBottom: "1px solid var(--ink-100)" },
  notifIcon: { width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0 },
  roleBtn: { display: "flex", alignItems: "center", gap: 9, height: 44, padding: "0 8px 0 6px", borderRadius: 10,
    border: "1px solid var(--ink-100)", background: "var(--surface)" },
  avatar: { width: 32, height: 32, borderRadius: 8, background: "var(--blue-600)", color: "#fff", fontWeight: 800,
    fontSize: 12.5, display: "grid", placeItems: "center", flexShrink: 0 },
  roleMenu: { position: "absolute", right: 0, top: "calc(100% + 8px)", width: 248, background: "var(--surface)",
    border: "1px solid var(--ink-100)", borderRadius: 13, boxShadow: "var(--sh-lg)", padding: 7, zIndex: 50 },
  roleMenuHead: { fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".6px", padding: "7px 9px 5px" },
  roleOpt: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 9px", borderRadius: 9,
    border: "none", background: "transparent", textAlign: "left" },
};

Object.assign(window, { Sidebar, Topbar });
