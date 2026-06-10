// ============================================================
//  Klika · Cliente API (conexión con el backend Laravel)
// ============================================================
// Uso: window.KlikaAPI.login(usuario, password) → { token, usuario }
// El token se guarda en localStorage y se adjunta a cada petición.
// La base se puede cambiar en consola: KlikaAPI.setBase('http://127.0.0.1:8000/api')
(function () {
  const LS_BASE = "klika_api_base";
  const LS_TOKEN = "klika_token";
  const LS_USER = "klika_usuario";

  const DEFAULT_BASE = "http://127.0.0.1:8000/api";

  function base() {
    return localStorage.getItem(LS_BASE) || DEFAULT_BASE;
  }
  function token() {
    return localStorage.getItem(LS_TOKEN);
  }

  async function request(method, path, body) {
    const headers = { Accept: "application/json" };
    if (body && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
    if (token()) headers["Authorization"] = "Bearer " + token();

    const res = await fetch(base() + path, {
      method,
      headers,
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    });

    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const err = new Error((data && data.message) || ("HTTP " + res.status));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  const KlikaAPI = {
    setBase(url) { localStorage.setItem(LS_BASE, url); },
    getBase: base,
    token,
    usuario() {
      try { return JSON.parse(localStorage.getItem(LS_USER) || "null"); } catch { return null; }
    },
    autenticado() { return !!token(); },

    async login(usuario, password, device) {
      const out = await request("POST", "/auth/login", { login: usuario, password, device: device || "klika-web" });
      localStorage.setItem(LS_TOKEN, out.token);
      localStorage.setItem(LS_USER, JSON.stringify(out.usuario));
      return out;
    },

    async me() { return request("GET", "/auth/me"); },

    async logout() {
      try { await request("POST", "/auth/logout"); } catch { /* ignora */ }
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
    },

    // Helpers genéricos para las pantallas.
    get(path) { return request("GET", path); },
    post(path, body) { return request("POST", path, body); },
    put(path, body) { return request("PUT", path, body); },
    patch(path, body) { return request("PATCH", path, body); },
    del(path) { return request("DELETE", path); },

    // ¿Está el backend arriba?
    async ping() {
      try { await fetch(base().replace(/\/api$/, "") + "/up"); return true; } catch { return false; }
    },
  };

  window.KlikaAPI = KlikaAPI;
})();
