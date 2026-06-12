/* global React, Icon, KlikaData */
// ============================================================
//  Pantalla · Mapa de flota en tiempo real (Leaflet + OSM)
// ============================================================
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS  = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

const ROL_COLOR = { aplicador: "#1E7FC2", supervisor: "#1A6B35", secretaria: "#7B2C8B", dueno: "#CC2020" };
const ROL_LBL   = { aplicador: "Aplicador", supervisor: "Supervisor", secretaria: "Secretaria", dueno: "Dueño" };

function cargarLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(); return; }
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

function crearIcono(color) {
  const svg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
    <circle cx="16" cy="16" r="6" fill="#fff"/>
  </svg>`);
  return window.L.icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -40],
  });
}

function MapaFlota({ onClose }) {
  const mapRef     = useRefM(null);
  const leafletRef = useRefM(null);
  const markersRef = useRefM({});
  const [ubicaciones, setUbicaciones] = useStateM([]);
  const [cargando, setCargando]       = useStateM(true);
  const [error, setError]             = useStateM(null);

  // Inicializar mapa una sola vez
  useEffectM(() => {
    let intervalo;
    cargarLeaflet().then(() => {
      if (!mapRef.current || leafletRef.current) return;
      leafletRef.current = window.L.map(mapRef.current, { zoomControl: true }).setView([19.45, -70.69], 12);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(leafletRef.current);

      async function actualizar() {
        try {
          const data = await KlikaData.vehiculos.ubicaciones();
          setUbicaciones(data);
          setCargando(false);

          const mapa = leafletRef.current;
          const marcasActuales = new Set(data.map((u) => String(u.usuario_id)));

          // Eliminar marcadores de conductores que ya no están activos
          Object.keys(markersRef.current).forEach((uid) => {
            if (!marcasActuales.has(uid)) {
              mapa.removeLayer(markersRef.current[uid]);
              delete markersRef.current[uid];
            }
          });

          // Actualizar o crear marcadores
          data.forEach((u) => {
            const uid = String(u.usuario_id);
            const popup = `<strong>${u.nombre}</strong><br>${ROL_LBL[u.rol] || u.rol}${u.vehiculo ? `<br>🚐 ${u.vehiculo}` : ""}<br><small>Hace ${u.ultimo_ping}</small>`;
            if (markersRef.current[uid]) {
              markersRef.current[uid].setLatLng([u.latitud, u.longitud]).setPopupContent(popup);
            } else {
              markersRef.current[uid] = window.L.marker([u.latitud, u.longitud], { icon: crearIcono(ROL_COLOR[u.rol] || "#666") })
                .addTo(mapa).bindPopup(popup);
            }
          });

          // Centrar mapa si hay marcadores y es la primera carga
          if (data.length > 0 && cargando) {
            const bounds = window.L.latLngBounds(data.map((u) => [u.latitud, u.longitud]));
            mapa.fitBounds(bounds, { padding: [40, 40] });
          }
        } catch (e) {
          setError("No se pudo cargar las ubicaciones");
          setCargando(false);
        }
      }

      actualizar();
      intervalo = setInterval(actualizar, 30000);
    });

    return () => {
      if (intervalo) clearInterval(intervalo);
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; }
    };
  }, []);

  return (
    <div style={mf.wrap} className="fade-in">
      {/* Header */}
      <div style={mf.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="location" size={20} color="var(--blue-600)" />
          <span style={{ fontWeight: 700, fontSize: 16 }}>Mapa de flota</span>
          {!cargando && (
            <span style={mf.badge}>{ubicaciones.length} en ruta</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--ink-400)" }}>Actualiza cada 30s</span>
          <button className="btn btn-icon btn-quiet btn-sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
      </div>

      {/* Mapa */}
      <div style={{ position: "relative", flex: 1 }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        {cargando && (
          <div style={mf.overlay}>
            <span style={{ fontSize: 14, color: "var(--ink-500)" }}>Cargando mapa…</span>
          </div>
        )}
        {!cargando && ubicaciones.length === 0 && !error && (
          <div style={mf.overlay}>
            <Icon name="location" size={32} color="var(--ink-300)" />
            <span style={{ fontSize: 14, color: "var(--ink-400)", marginTop: 8 }}>Ningún conductor activo en este momento</span>
          </div>
        )}
        {error && (
          <div style={mf.overlay}>
            <span style={{ fontSize: 14, color: "var(--red-600)" }}>{error}</span>
          </div>
        )}
      </div>

      {/* Lista lateral */}
      {ubicaciones.length > 0 && (
        <div style={mf.lista}>
          {ubicaciones.map((u) => (
            <div key={u.usuario_id} style={mf.fila}
              onClick={() => { leafletRef.current?.setView([u.latitud, u.longitud], 16); markersRef.current[String(u.usuario_id)]?.openPopup(); }}>
              <span style={{ ...mf.dot, background: ROL_COLOR[u.rol] || "#666" }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{u.nombre}</div>
                <div style={{ fontSize: 11, color: "var(--ink-400)" }}>{u.vehiculo || ROL_LBL[u.rol]} · {u.ultimo_ping}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const mf = {
  wrap:   { position: "fixed", inset: 0, background: "var(--bg)", zIndex: 80, display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface)" },
  badge:  { background: "var(--blue-100)", color: "var(--blue-700)", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 600 },
  overlay:{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.85)", zIndex: 10 },
  lista:  { maxHeight: 200, overflowY: "auto", borderTop: "1px solid var(--ink-100)", background: "var(--surface)" },
  fila:   { display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid var(--ink-50)" },
  dot:    { width: 10, height: 10, borderRadius: 99, flexShrink: 0 },
};

window.MapaFlota = MapaFlota;
