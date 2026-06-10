/* global React, Icon, TechosLogo, StarMark, KlikaAPI */
// ============================================================
//  Pantalla 1 · Login
// ============================================================
const { useState: useStateLogin } = React;

function Login({ onEnter }) {
  const [metodo, setMetodo] = useStateLogin("tel"); // tel | correo
  const [verPass, setVerPass] = useStateLogin(false);
  const [user, setUser] = useStateLogin("");
  const [pass, setPass] = useStateLogin("");
  const [error, setError] = useStateLogin("");
  const [cargando, setCargando] = useStateLogin(false);

  async function entrar() {
    setError("");
    // Sin backend configurado o campos vacíos → modo demo (prototipo).
    if (!window.KlikaAPI || (!user && !pass)) { onEnter(null); return; }
    setCargando(true);
    try {
      const out = await KlikaAPI.login(user, pass);
      onEnter(out.usuario); // entra con el rol real del backend
    } catch (e) {
      if (e.status === 401 || e.status === 422) {
        setError("Teléfono/correo o contraseña incorrectos.");
      } else {
        // Backend no disponible → entra en modo demo para seguir viendo el prototipo.
        onEnter(null);
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={lg.wrap} className="r-login">
      {/* Panel izquierdo · marca */}
      <div style={lg.left} className="r-loginbrand">
        <div style={lg.leftTop}><TechosLogo scale={1} dark /></div>
        <div style={lg.leftMid}>
          <div style={{ opacity: .9, marginBottom: 26 }}><StarMark size={64} /></div>
          <h2 style={lg.lh}>Tu empresa, impermeable<br/>de punta a punta.</h2>
          <p style={lg.lp}>
            Klika reúne tus clientes, obras, cotizaciones, inventario y el clima
            en un solo lugar. Diseñado para el día a día de Techos Estrella.
          </p>
          <div style={lg.pills}>
            {["Obras y cuadrillas", "Cotización automática", "Planificador con clima", "Fotos de evidencia"].map((t) => (
              <span key={t} style={lg.pill}>{t}</span>
            ))}
          </div>
        </div>
        <div style={lg.leftFoot}>
          <span>Desde 1993 · Santiago, R.D.</span>
          <span>techosestrella.com</span>
        </div>
        <div style={lg.glow} />
      </div>

      {/* Panel derecho · formulario */}
      <div style={lg.right} className="r-loginform">
        <div style={lg.form}>
          <div style={{ marginBottom: 30 }}>
            <h1 style={lg.h1}>Entrar a Klika</h1>
            <p style={lg.psub}>Bienvenido. Inicia sesión para continuar.</p>
          </div>

          {/* Toggle teléfono / correo */}
          <div style={lg.toggle}>
            <button onClick={() => setMetodo("tel")}
              style={{ ...lg.toggleBtn, ...(metodo === "tel" ? lg.toggleOn : {}) }}>
              <Icon name="phone" size={16} /> Teléfono
            </button>
            <button onClick={() => setMetodo("correo")}
              style={{ ...lg.toggleBtn, ...(metodo === "correo" ? lg.toggleOn : {}) }}>
              <Icon name="mail" size={16} /> Correo
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 6 }}>
            <div className="field">
              <label>{metodo === "tel" ? "Número de teléfono" : "Correo electrónico"}</label>
              <input className="input" value={user} onChange={(e) => setUser(e.target.value)}
                placeholder={metodo === "tel" ? "809-000-0000" : "tu@correo.com"}
                inputMode={metodo === "tel" ? "tel" : "email"} />
            </div>

            <div className="field">
              <label>Contraseña</label>
              <div style={{ position: "relative" }}>
                <input className="input" type={verPass ? "text" : "password"} placeholder="••••••••"
                  value={pass} onChange={(e) => setPass(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && entrar()} style={{ paddingRight: 44 }} />
                <button onClick={() => setVerPass((v) => !v)} style={lg.eye} title="Mostrar/ocultar">
                  <Icon name={verPass ? "eyeoff" : "eye"} size={18} color="var(--ink-400)" />
                </button>
              </div>
            </div>

            {error && (
              <div style={lg.error}>
                <Icon name="alert" size={14} color="var(--red)" /> {error}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={lg.remember}>
                <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: "var(--blue-600)" }} />
                Recordarme
              </label>
              <a href="#" style={lg.link} onClick={(e) => e.preventDefault()}>¿Olvidaste tu contraseña?</a>
            </div>

            <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 4 }} onClick={entrar} disabled={cargando}>
              {cargando ? "Entrando…" : <>Entrar <Icon name="chevright" size={18} /></>}
            </button>
          </div>

          <div style={lg.hint}>
            <Icon name="sparkle" size={14} color="var(--blue-600)" />
            <span>Backend: <b>8091110001</b> / <b>Klika2024!</b> (dueño). Si el servidor no está corriendo, deja los campos vacíos y pulsa Entrar para el modo demo.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const lg = {
  wrap: { display: "grid", gridTemplateColumns: "1.05fr 1fr", height: "100vh", background: "var(--surface)" },
  left: { position: "relative", overflow: "hidden", background: "var(--ink-900)",
    display: "flex", flexDirection: "column", padding: "38px 48px", color: "#fff" },
  leftTop: {},
  leftMid: { margin: "auto 0", maxWidth: 460, position: "relative", zIndex: 2 },
  lh: { fontSize: 38, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 16px" },
  lp: { fontSize: 15.5, lineHeight: 1.6, color: "var(--ink-300)", margin: 0, maxWidth: 420 },
  pills: { display: "flex", flexWrap: "wrap", gap: 9, marginTop: 28 },
  pill: { fontSize: 12.5, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.12)", borderRadius: 99, padding: "7px 13px" },
  leftFoot: { display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--ink-400)", position: "relative", zIndex: 2 },
  glow: { position: "absolute", width: 620, height: 620, borderRadius: "50%", right: -240, top: -180,
    background: "radial-gradient(circle, rgba(30,127,194,.4), transparent 62%)", filter: "blur(20px)" },

  right: { display: "grid", placeItems: "center", padding: 30, background: "var(--bg)" },
  form: { width: "100%", maxWidth: 392, background: "var(--surface)", padding: "38px 36px",
    borderRadius: 20, border: "1px solid var(--ink-100)", boxShadow: "var(--sh-md)" },
  h1: { fontSize: 27, fontWeight: 800, letterSpacing: "-.5px", margin: 0, color: "var(--ink-900)" },
  psub: { fontSize: 14.5, color: "var(--ink-400)", margin: "7px 0 0" },
  toggle: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, padding: 5, background: "var(--bg)",
    borderRadius: 11, border: "1px solid var(--ink-100)", marginBottom: 20 },
  toggleBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 38,
    borderRadius: 7, border: "none", background: "transparent", fontWeight: 600, fontSize: 13.5, color: "var(--ink-500)" },
  toggleOn: { background: "var(--surface)", color: "var(--ink-900)", boxShadow: "var(--sh-sm)" },
  eye: { position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent",
    width: 34, height: 34, borderRadius: 7, display: "grid", placeItems: "center" },
  remember: { display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--ink-700)", fontWeight: 500 },
  link: { fontSize: 13.5, color: "var(--blue-600)", fontWeight: 600, textDecoration: "none" },
  hint: { display: "flex", alignItems: "flex-start", gap: 8, marginTop: 24, padding: "12px 13px",
    background: "var(--blue-50)", borderRadius: 10, fontSize: 12.5, color: "var(--blue-700)", lineHeight: 1.45 },
  error: { display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", borderRadius: 9,
    background: "var(--red-bg)", color: "var(--red-ink)", fontSize: 13, fontWeight: 600 },
};

window.Login = Login;
