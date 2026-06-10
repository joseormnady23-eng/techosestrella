// ============================================================
//  Klika Campo · Cliente API + cola offline
// ============================================================
// Token en localStorage. Las acciones que se hacen sin conexión (check-in,
// check-out, solicitar ausencia) se encolan en localStorage; las fotos se
// guardan en IndexedDB. Todo se sincroniza al volver la conexión.
(function () {
  const LS_BASE = "klika_campo_api";
  const LS_TOKEN = "klika_campo_token";
  const LS_USER = "klika_campo_user";
  const LS_QUEUE = "klika_campo_queue";
  const DEFAULT_BASE = "http://127.0.0.1:8000/api";

  const base = () => localStorage.getItem(LS_BASE) || DEFAULT_BASE;
  const token = () => localStorage.getItem(LS_TOKEN);

  async function request(method, path, body, isForm) {
    const headers = { Accept: "application/json" };
    if (body && !isForm) headers["Content-Type"] = "application/json";
    if (token()) headers["Authorization"] = "Bearer " + token();

    const res = await fetch(base() + path, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) {
      const err = new Error((data && data.message) || ("HTTP " + res.status));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  // ---- Cola de acciones JSON (localStorage) ----
  function getQueue() {
    try { return JSON.parse(localStorage.getItem(LS_QUEUE) || "[]"); } catch { return []; }
  }
  function setQueue(q) { localStorage.setItem(LS_QUEUE, JSON.stringify(q)); }
  function enqueue(action) {
    const q = getQueue();
    q.push({ ...action, _ts: Date.now() });
    setQueue(q);
  }

  // ---- Cola de fotos (IndexedDB, soporta blobs grandes) ----
  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("klika_campo", 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("fotos")) db.createObjectStore("fotos", { keyPath: "id", autoIncrement: true });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function fotoEnqueue(obraId, tipo, descripcion, blob) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("fotos", "readwrite");
      tx.objectStore("fotos").add({ obraId, tipo, descripcion, blob, _ts: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  async function fotoAll() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const out = [];
      const cur = db.transaction("fotos").objectStore("fotos").openCursor();
      cur.onsuccess = () => { const c = cur.result; if (c) { out.push(c.value); c.continue(); } else resolve(out); };
      cur.onerror = () => reject(cur.error);
    });
  }
  async function fotoDelete(id) {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction("fotos", "readwrite");
      tx.objectStore("fotos").delete(id);
      tx.oncomplete = () => resolve();
    });
  }

  const KlikaCampo = {
    online: () => navigator.onLine,
    setBase: (u) => localStorage.setItem(LS_BASE, u),
    getBase: base,
    token,
    user() { try { return JSON.parse(localStorage.getItem(LS_USER) || "null"); } catch { return null; } },
    autenticado: () => !!token(),

    async login(login, password) {
      const out = await request("POST", "/auth/login", { login, password, device: "klika-campo" });
      localStorage.setItem(LS_TOKEN, out.token);
      localStorage.setItem(LS_USER, JSON.stringify(out.usuario));
      return out;
    },
    async logout() {
      try { await request("POST", "/auth/logout"); } catch {}
      localStorage.removeItem(LS_TOKEN); localStorage.removeItem(LS_USER);
    },

    // Lecturas
    obras: () => request("GET", "/obras"),
    obra: (id) => request("GET", "/obras/" + id),
    clima: (id) => request("GET", "/clima/obras/" + id),
    fotos: (id) => request("GET", "/obras/" + id + "/fotos"),
    materiales: () => request("GET", "/materiales"),
    misAusencias: () => request("GET", "/ausencias"),
    miVacacionesResumen: () => request("GET", "/mi/vacaciones-resumen"),

    // Acciones con soporte offline
    async checkin(obraId, lat, lng) {
      const payload = { obra_id: obraId, latitud: lat, longitud: lng };
      if (!navigator.onLine) { enqueue({ tipo: "checkin", payload }); return { encolado: true }; }
      try { return await request("POST", "/asistencias/checkin", payload); }
      catch (e) { if (e.status === undefined) { enqueue({ tipo: "checkin", payload }); return { encolado: true }; } throw e; }
    },
    async checkout(obraId) {
      const payload = { obra_id: obraId };
      if (!navigator.onLine) { enqueue({ tipo: "checkout", payload }); return { encolado: true }; }
      try { return await request("POST", "/asistencias/checkout", payload); }
      catch (e) { if (e.status === undefined) { enqueue({ tipo: "checkout", payload }); return { encolado: true }; } throw e; }
    },
    async solicitarAusencia(payload) {
      if (!navigator.onLine) { enqueue({ tipo: "ausencia", payload }); return { encolado: true }; }
      try { return await request("POST", "/ausencias", payload); }
      catch (e) { if (e.status === undefined) { enqueue({ tipo: "ausencia", payload }); return { encolado: true }; } throw e; }
    },
    async subirFoto(obraId, tipo, descripcion, file) {
      if (!navigator.onLine) { await fotoEnqueue(obraId, tipo, descripcion, file); return { encolado: true }; }
      try {
        const fd = new FormData();
        fd.append("foto", file); fd.append("tipo", tipo);
        if (descripcion) fd.append("descripcion", descripcion);
        return await request("POST", "/obras/" + obraId + "/fotos", fd, true);
      } catch (e) {
        if (e.status === undefined) { await fotoEnqueue(obraId, tipo, descripcion, file); return { encolado: true }; }
        throw e;
      }
    },

    // Sincronización
    pendientes() { return getQueue().length; },
    async pendientesFotos() { return (await fotoAll()).length; },
    async sincronizar() {
      let ok = 0;
      // Acciones JSON
      const q = getQueue();
      const resto = [];
      for (const a of q) {
        try {
          if (a.tipo === "checkin") await request("POST", "/asistencias/checkin", a.payload);
          else if (a.tipo === "checkout") await request("POST", "/asistencias/checkout", a.payload);
          else if (a.tipo === "ausencia") await request("POST", "/ausencias", a.payload);
          ok++;
        } catch (e) { if (e.status === undefined) resto.push(a); /* error de red: reintentar luego */ }
      }
      setQueue(resto);
      // Fotos
      const fotos = await fotoAll();
      for (const f of fotos) {
        try {
          const fd = new FormData();
          fd.append("foto", f.blob, "foto.jpg"); fd.append("tipo", f.tipo);
          if (f.descripcion) fd.append("descripcion", f.descripcion);
          await request("POST", "/obras/" + f.obraId + "/fotos", fd, true);
          await fotoDelete(f.id); ok++;
        } catch (e) { if (e.status !== undefined) await fotoDelete(f.id); /* rechazo del server: descartar */ }
      }
      return ok;
    },
  };

  window.KlikaCampo = KlikaCampo;
})();
