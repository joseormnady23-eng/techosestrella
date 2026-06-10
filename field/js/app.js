// ============================================================
//  Klika Campo · App (vanilla JS) — router + pantallas
// ============================================================
/* global KlikaCampo */
(function () {
  const API = window.KlikaCampo;
  const app = document.getElementById("app");

  const state = { screen: "hoy", obraId: null, obra: null };

  // ---- helpers ----
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const hoyISO = () => new Date().toISOString().slice(0, 10);
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }
  const ESTADO_LBL = { cotizada: "Cotizada", aprobada: "Aprobada", en_proceso: "En proceso", pausada: "Pausada", terminada: "Terminada", cancelada: "Cancelada" };
  const ESTADO_CLS = { en_proceso: "b-green", aprobada: "b-blue", pausada: "b-amber", terminada: "b-gray", cotizada: "b-gray", cancelada: "b-red" };
  const CLIMA_CLS = { apto: "b-green", precaucion: "b-amber", bloqueado: "b-red" };
  const CLIMA_IC = { apto: "☀️", precaucion: "⛅", bloqueado: "🌧️" };
  const DIA_LETRA = ["D", "L", "M", "M", "J", "V", "S"];

  function setOnline() {
    document.body.classList.toggle("offline", !API.online());
    actualizarBadgeSync();
  }
  async function actualizarBadgeSync() {
    const n = API.pendientes() + (await API.pendientesFotos().catch(() => 0));
    const b = document.getElementById("sync-badge");
    if (b) b.textContent = n > 0 ? `${n} sin enviar` : "Todo sincronizado";
  }

  // ============================================================
  //  Render principal
  // ============================================================
  function render() {
    if (!API.autenticado()) return renderLogin();
    const tabs = [
      ["hoy", "🏠", "Hoy"], ["obras", "🧱", "Obras"], ["vacaciones", "🌴", "Vacaciones"], ["perfil", "👤", "Perfil"],
    ];
    app.innerHTML = `
      <div id="offline-banner">📴 Sin conexión — se guardará y enviará al reconectar</div>
      <div id="screen"></div>
      <nav class="nav">${tabs.map(([k, ic, l]) =>
        `<button data-tab="${k}" class="${["hoy","obras","vacaciones","perfil"].includes(state.screen) && state.screen===k ? "on":""}"><span class="ic">${ic}</span>${l}</button>`).join("")}</nav>`;
    app.querySelectorAll("[data-tab]").forEach((b) => b.onclick = () => go(b.dataset.tab));
    setOnline();
    routeScreen();
  }

  function routeScreen() {
    const scr = document.getElementById("screen");
    if (!scr) return;
    if (state.screen === "hoy") return screenHoy(scr);
    if (state.screen === "obras") return screenObras(scr, false);
    if (state.screen === "obra") return screenObra(scr);
    if (state.screen === "foto") return screenFoto(scr);
    if (state.screen === "materiales") return screenMateriales(scr);
    if (state.screen === "vacaciones") return screenVacaciones(scr);
    if (state.screen === "perfil") return screenPerfil(scr);
  }

  function go(screen, obraId) {
    state.screen = screen;
    if (obraId !== undefined) state.obraId = obraId;
    render();
  }

  const loading = (scr) => { scr.innerHTML = `<div class="spin"></div>`; };

  // ============================================================
  //  Login
  // ============================================================
  function renderLogin() {
    app.innerHTML = `
      <div class="login">
        <div style="margin-bottom:28px">
          <h1>Klika Campo</h1>
          <div class="muted" style="color:#B5B5B5">Techos Estrella · aplicadores</div>
        </div>
        <div id="login-err"></div>
        <div class="field"><label style="color:#fff">Teléfono</label>
          <input id="l-user" class="input" inputmode="tel" placeholder="809-000-0000"></div>
        <div class="field"><label style="color:#fff">Contraseña</label>
          <input id="l-pass" class="input" type="password" placeholder="••••••••"></div>
        <button id="l-btn" class="btn btn-primary" style="margin-top:8px">Entrar</button>
        <div class="muted center" style="color:#8A8A8A;margin-top:18px;font-size:13px">8091110004 / Klika2024!</div>
      </div>`;
    const btn = document.getElementById("l-btn");
    async function entrar() {
      const u = document.getElementById("l-user").value.trim();
      const p = document.getElementById("l-pass").value;
      document.getElementById("login-err").innerHTML = "";
      btn.disabled = true; btn.textContent = "Entrando…";
      try {
        const out = await API.login(u, p);
        if (out.usuario.rol !== "aplicador") {
          await API.logout();
          throw Object.assign(new Error("Esta app es solo para aplicadores."), { status: 403 });
        }
        render();
      } catch (e) {
        document.getElementById("login-err").innerHTML = `<div class="err">${esc(e.message || "No se pudo entrar")}</div>`;
        btn.disabled = false; btn.textContent = "Entrar";
      }
    }
    btn.onclick = entrar;
    document.getElementById("l-pass").onkeydown = (e) => { if (e.key === "Enter") entrar(); };
  }

  // ============================================================
  //  Hoy (mis obras + clima)
  // ============================================================
  async function screenHoy(scr) {
    const u = API.user() || {};
    const nombre = (u.nombre || "").split(" ")[0] || "aplicador";
    scr.innerHTML = `
      <div class="hdr"><h1>Hola, ${esc(nombre)} 👋</h1>
        <div class="sub">${new Date().toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" })}</div></div>
      <div class="content" id="c"><div class="spin"></div></div>`;
    const c = scr.querySelector("#c");
    try {
      const obras = await API.obras();
      const activas = obras.filter((o) => ["en_proceso", "aprobada"].includes(o.estado));
      let html = "";
      // Clima 7 días de la primera obra con coordenadas
      const conGps = obras.find((o) => o.latitud && o.longitud);
      if (conGps) {
        try {
          const dias = await API.clima(conGps.id);
          if (dias && dias.length) {
            html += `<div class="section-lbl">Clima · próximos días</div><div class="card"><div class="clima">` +
              dias.slice(0, 7).map((d) => {
                const dt = new Date(d.fecha + "T00:00:00");
                return `<div class="d ${CLIMA_CLS[d.estado] || "b-gray"}"><div class="dn">${DIA_LETRA[dt.getDay()]}</div><div class="dd">${dt.getDate()}</div><div class="pp">${CLIMA_IC[d.estado] || ""}${d.prob_lluvia}%</div></div>`;
              }).join("") + `</div></div>`;
          }
        } catch {}
      }
      html += `<div class="section-lbl">Mis obras activas</div>`;
      if (activas.length === 0) {
        html += `<div class="empty">No tienes obras activas hoy. ¡Buen descanso! 🙌</div>`;
      } else {
        html += activas.map(obraCardHtml).join("");
      }
      c.innerHTML = html;
      c.querySelectorAll("[data-obra]").forEach((b) => b.onclick = () => go("obra", Number(b.dataset.obra)));
    } catch (e) {
      c.innerHTML = errorBox(e);
    }
  }

  function obraCardHtml(o) {
    return `<button class="card obra-card" data-obra="${o.id}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div class="titulo">${esc(o.titulo)}</div>
        <span class="badge ${ESTADO_CLS[o.estado] || "b-gray"}">${ESTADO_LBL[o.estado] || o.estado}</span>
      </div>
      <div class="meta">${esc(o.codigo)} · ${esc(o.cliente?.nombre || "")}</div>
    </button>`;
  }

  // ============================================================
  //  Todas mis obras
  // ============================================================
  async function screenObras(scr) {
    scr.innerHTML = `<div class="hdr hdr-row"><h1>Mis obras</h1></div><div class="content" id="c"><div class="spin"></div></div>`;
    const c = scr.querySelector("#c");
    try {
      const obras = await API.obras();
      c.innerHTML = obras.length ? obras.map(obraCardHtml).join("") : `<div class="empty">No tienes obras asignadas.</div>`;
      c.querySelectorAll("[data-obra]").forEach((b) => b.onclick = () => go("obra", Number(b.dataset.obra)));
    } catch (e) { c.innerHTML = errorBox(e); }
  }

  // ============================================================
  //  Detalle de obra
  // ============================================================
  async function screenObra(scr) {
    scr.innerHTML = `<div class="hdr"><button class="badge b-gray" id="back" style="border:none">← Volver</button></div><div class="content" id="c"><div class="spin"></div></div>`;
    scr.querySelector("#back").onclick = () => go("hoy");
    const c = scr.querySelector("#c");
    try {
      const o = await API.obra(state.obraId);
      state.obra = o;
      const fecha = hoyISO();
      const miAsist = (o.asistencias || []).find((a) => a.fecha === fecha && a.usuario_id === (API.user() || {}).id);
      const hizoCheckin = miAsist && miAsist.hora_entrada;
      const hizoCheckout = miAsist && miAsist.hora_salida;

      let dir = "";
      if (o.ubicacion_visible) {
        const maps = o.maps_url || (o.latitud ? `https://www.google.com/maps?q=${o.latitud},${o.longitud}` : null);
        dir = `<div class="card"><div class="muted" style="font-size:14px">Dirección</div>
          <div style="font-weight:700;margin:4px 0 12px">${esc(o.direccion_obra || "—")}</div>
          ${maps ? `<a class="btn btn-ghost" href="${maps}" target="_blank" rel="noopener">📍 Cómo llegar</a>` : ""}</div>`;
      } else {
        dir = `<div class="card"><div class="muted">📍 ${esc(o.direccion_obra || "Dirección no visible")}</div></div>`;
      }

      c.innerHTML = `
        <h2 style="margin:4px 0 2px;font-size:24px;font-weight:900">${esc(o.titulo)}</h2>
        <div class="meta muted" style="margin-bottom:8px">${esc(o.codigo)} · ${esc(o.cliente?.nombre || "")}</div>
        <span class="badge ${ESTADO_CLS[o.estado] || "b-gray"}" style="font-size:15px">${ESTADO_LBL[o.estado] || o.estado}</span>
        ${dir}
        <div class="btn-row">
          ${!hizoCheckin ? `<button class="btn btn-green full" id="b-checkin">📍 Check-in</button>`
            : !hizoCheckout ? `<button class="btn btn-red full" id="b-checkout">⏱️ Check-out</button>`
            : `<div class="card center full" style="grid-column:1/-1;background:var(--green-bg);color:#2a7d33;font-weight:800">✅ Jornada completa hoy</div>`}
          <button class="btn btn-primary" id="b-foto">📷 Subir foto</button>
          <button class="btn btn-gray" id="b-mat">📦 Materiales</button>
        </div>
        <div class="section-lbl">Mi jornada de hoy</div>
        <div class="card">
          ${miAsist ? `Entrada: <b>${miAsist.hora_entrada ? new Date(miAsist.hora_entrada).toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"}) : "—"}</b>
            &nbsp;·&nbsp; Salida: <b>${miAsist.hora_salida ? new Date(miAsist.hora_salida).toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"}) : "—"}</b>`
            : `<span class="muted">Aún no has marcado entrada hoy.</span>`}
        </div>`;

      const bIn = c.querySelector("#b-checkin");
      if (bIn) bIn.onclick = () => hacerCheckin(o);
      const bOut = c.querySelector("#b-checkout");
      if (bOut) bOut.onclick = () => hacerCheckout(o);
      c.querySelector("#b-foto").onclick = () => go("foto");
      c.querySelector("#b-mat").onclick = () => go("materiales");
    } catch (e) { c.innerHTML = errorBox(e); }
  }

  function gps() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({});
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => resolve({}), { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }
  async function hacerCheckin(o) {
    toast("Obteniendo ubicación…");
    const { lat, lng } = await gps();
    try {
      const r = await API.checkin(o.id, lat, lng);
      toast(r.encolado ? "✅ Check-in guardado (se enviará al reconectar)" : "✅ Check-in registrado");
      go("obra", o.id);
    } catch (e) { toast("⚠️ " + (e.message || "No se pudo")); }
    actualizarBadgeSync();
  }
  async function hacerCheckout(o) {
    try {
      const r = await API.checkout(o.id);
      toast(r.encolado ? "✅ Check-out guardado offline" : "✅ Check-out registrado");
      go("obra", o.id);
    } catch (e) { toast("⚠️ " + (e.message || "No se pudo")); }
    actualizarBadgeSync();
  }

  // ============================================================
  //  Subir foto
  // ============================================================
  function screenFoto(scr) {
    const tipos = [["antes", "📷 Antes", "b-blue"], ["durante", "🔄 Durante", "b-amber"], ["despues", "✅ Después", "b-green"], ["problema", "⚠️ Problema", "b-red"]];
    let tipoSel = "durante", file = null;
    scr.innerHTML = `<div class="hdr"><button class="badge b-gray" id="back" style="border:none">← Volver</button></div>
      <div class="content">
        <h2 style="font-size:22px;font-weight:900;margin:4px 0 14px">Subir foto</h2>
        <div class="section-lbl">Tipo de foto</div>
        <div class="tipo-grid" id="tipos">${tipos.map(([k, l]) => `<button class="tipo-btn ${k===tipoSel?"on":""}" data-t="${k}">${l}</button>`).join("")}</div>
        <div class="section-lbl">Foto</div>
        <input id="file" type="file" accept="image/*" capture="environment" style="display:none">
        <button class="btn btn-ghost" id="pick">📸 Tomar / elegir foto</button>
        <div id="preview" style="margin-top:14px"></div>
        <div class="field" style="margin-top:14px"><label>Descripción (opcional)</label>
          <input id="desc" class="input" placeholder="Ej. filtración esquina norte"></div>
        <button class="btn btn-primary" id="subir" disabled style="margin-top:6px">Subir foto</button>
      </div>`;
    scr.querySelector("#back").onclick = () => go("obra", state.obraId);
    scr.querySelectorAll("[data-t]").forEach((b) => b.onclick = () => {
      tipoSel = b.dataset.t;
      scr.querySelectorAll("[data-t]").forEach((x) => x.classList.toggle("on", x === b));
    });
    const fileInput = scr.querySelector("#file");
    scr.querySelector("#pick").onclick = () => fileInput.click();
    fileInput.onchange = () => {
      file = fileInput.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      scr.querySelector("#preview").innerHTML = `<img src="${url}" style="width:100%;border-radius:14px">`;
      scr.querySelector("#subir").disabled = false;
    };
    scr.querySelector("#subir").onclick = async () => {
      if (!file) return;
      const btn = scr.querySelector("#subir");
      btn.disabled = true; btn.textContent = "Subiendo…";
      try {
        const r = await API.subirFoto(state.obraId, tipoSel, scr.querySelector("#desc").value, file);
        toast(r.encolado ? "✅ Foto guardada (se subirá al reconectar)" : "✅ Foto subida");
        go("obra", state.obraId);
      } catch (e) { toast("⚠️ " + (e.message || "No se pudo subir")); btn.disabled = false; btn.textContent = "Subir foto"; }
      actualizarBadgeSync();
    };
  }

  // ============================================================
  //  Materiales de la obra (solo lectura)
  // ============================================================
  async function screenMateriales(scr) {
    scr.innerHTML = `<div class="hdr"><button class="badge b-gray" id="back" style="border:none">← Volver</button></div><div class="content" id="c"><div class="spin"></div></div>`;
    scr.querySelector("#back").onclick = () => go("obra", state.obraId);
    const c = scr.querySelector("#c");
    try {
      const o = state.obra || await API.obra(state.obraId);
      // Materiales según la última cotización aprobada de la obra.
      const cot = (o.cotizaciones || []).filter((q) => q.estado === "aprobada").slice(-1)[0] || (o.cotizaciones || []).slice(-1)[0];
      const items = (cot && cot.items) ? cot.items.filter((i) => i.material_id) : [];
      let html = `<h2 style="font-size:22px;font-weight:900;margin:4px 0 12px">Materiales de la obra</h2>`;
      if (items.length === 0) {
        html += `<div class="empty">No hay materiales en una cotización aprobada todavía.</div>`;
      } else {
        html += items.map((i) => `<div class="card"><div style="font-weight:700;font-size:17px">${esc(i.descripcion)}</div>
          <div class="meta muted">${Number(i.cantidad)} ${esc(i.unidad)}</div></div>`).join("");
      }
      html += `<div class="card muted" style="font-size:14px">ℹ️ Solo lectura. Para reportar faltantes, habla con el supervisor.</div>`;
      c.innerHTML = html;
    } catch (e) { c.innerHTML = errorBox(e); }
  }

  // ============================================================
  //  Mis vacaciones
  // ============================================================
  async function screenVacaciones(scr) {
    scr.innerHTML = `<div class="hdr"><h1>Mis vacaciones</h1></div><div class="content" id="c"><div class="spin"></div></div>`;
    const c = scr.querySelector("#c");
    try {
      const [resumen, ausencias] = await Promise.all([
        API.miVacacionesResumen().catch(() => ({ dias_disponibles: 0, dias_derecho: 0, dias_tomados: 0 })),
        API.misAusencias().catch(() => []),
      ]);
      const estCls = { aprobado: "b-green", pendiente: "b-amber", rechazado: "b-red" };
      const estIc = { aprobado: "✅", pendiente: "⏳", rechazado: "❌" };
      c.innerHTML = `
        <div class="card center">
          <div class="muted">Días disponibles</div>
          <div class="big-num" style="color:var(--blue);margin:8px 0">${resumen.dias_disponibles}</div>
          <div class="muted" style="font-size:14px">de ${resumen.dias_derecho} · ${resumen.dias_tomados} tomados</div>
        </div>
        <button class="btn btn-primary" id="solicitar">＋ Solicitar ausencia</button>
        <div id="form"></div>
        <div class="section-lbl">Mis solicitudes</div>
        <div id="hist">${ausencias.length ? ausencias.map((a) => `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
            <div><div style="font-weight:700;text-transform:capitalize">${esc(a.tipo)}</div>
              <div class="meta muted">${a.fecha_inicio} → ${a.fecha_fin} · ${a.dias_habiles} días</div></div>
            <span class="badge ${estCls[a.estado] || "b-gray"}">${estIc[a.estado] || ""} ${esc(a.estado)}</span></div>`).join("")
          : `<div class="empty">Sin solicitudes todavía.</div>`}</div>`;
      c.querySelector("#solicitar").onclick = () => mostrarFormAusencia(c.querySelector("#form"));
    } catch (e) { c.innerHTML = errorBox(e); }
  }

  function mostrarFormAusencia(cont) {
    if (cont.dataset.open) { cont.innerHTML = ""; delete cont.dataset.open; return; }
    cont.dataset.open = "1";
    const tipos = ["vacaciones", "permiso", "enfermedad", "personal", "otro"];
    cont.innerHTML = `<div class="card">
      <div class="field"><label>Tipo</label><select id="a-tipo" class="input">${tipos.map((t) => `<option value="${t}">${t}</option>`).join("")}</select></div>
      <div class="field"><label>Desde</label><input id="a-ini" class="input" type="date" value="${hoyISO()}"></div>
      <div class="field"><label>Hasta</label><input id="a-fin" class="input" type="date" value="${hoyISO()}"></div>
      <div class="field"><label>Motivo (opcional)</label><input id="a-mot" class="input"></div>
      <button class="btn btn-primary" id="a-enviar">Enviar solicitud</button></div>`;
    cont.querySelector("#a-enviar").onclick = async () => {
      const payload = {
        tipo: cont.querySelector("#a-tipo").value,
        fecha_inicio: cont.querySelector("#a-ini").value,
        fecha_fin: cont.querySelector("#a-fin").value,
        motivo: cont.querySelector("#a-mot").value || null,
      };
      if (payload.fecha_fin < payload.fecha_inicio) return toast("⚠️ La fecha fin no puede ser antes del inicio");
      const btn = cont.querySelector("#a-enviar"); btn.disabled = true; btn.textContent = "Enviando…";
      try {
        const r = await API.solicitarAusencia(payload);
        toast(r.encolado ? "✅ Solicitud guardada offline" : "✅ Solicitud enviada");
        go("vacaciones");
      } catch (e) { toast("⚠️ " + (e.message || "No se pudo")); btn.disabled = false; btn.textContent = "Enviar solicitud"; }
      actualizarBadgeSync();
    };
  }

  // ============================================================
  //  Perfil
  // ============================================================
  function screenPerfil(scr) {
    const u = API.user() || {};
    scr.innerHTML = `<div class="hdr"><h1>Mi perfil</h1></div>
      <div class="content">
        <div class="card center">
          <div style="width:72px;height:72px;border-radius:20px;background:var(--blue);color:#fff;font-size:28px;font-weight:900;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">${esc((u.nombre||"A")[0])}</div>
          <div style="font-size:20px;font-weight:800">${esc(u.nombre || "")}</div>
          <div class="muted">${esc(u.telefono || "")} · aplicador</div>
        </div>
        <div class="card">
          <div style="font-weight:700;margin-bottom:8px">Sincronización</div>
          <div id="sync-badge" class="muted" style="margin-bottom:12px">…</div>
          <button class="btn btn-ghost" id="sync">🔄 Sincronizar ahora</button>
        </div>
        <div class="card">
          <div class="field"><label>Servidor (API)</label><input id="api-base" class="input" value="${esc(API.getBase())}"></div>
          <button class="btn btn-gray" id="guardar-api">Guardar servidor</button>
        </div>
        <button class="btn btn-red" id="logout" style="margin-top:6px">Cerrar sesión</button>
      </div>`;
    actualizarBadgeSync();
    scr.querySelector("#sync").onclick = async () => {
      toast("Sincronizando…");
      const n = await API.sincronizar().catch(() => 0);
      toast(n > 0 ? `✅ ${n} acciones enviadas` : "Nada pendiente");
      actualizarBadgeSync();
    };
    scr.querySelector("#guardar-api").onclick = () => { API.setBase(scr.querySelector("#api-base").value.trim()); toast("Servidor guardado"); };
    scr.querySelector("#logout").onclick = async () => { await API.logout(); render(); };
  }

  function errorBox(e) {
    return `<div class="empty">⚠️ ${esc(e.message || "No se pudieron cargar los datos")}<br><span style="font-size:14px">Revisa tu conexión o el servidor en Perfil.</span></div>`;
  }

  // ---- Conexión / sincronización automática ----
  window.addEventListener("online", () => { setOnline(); API.sincronizar().then((n) => { if (n) toast(`✅ ${n} acciones sincronizadas`); actualizarBadgeSync(); }); });
  window.addEventListener("offline", setOnline);

  // ---- Service worker ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }

  render();
})();
