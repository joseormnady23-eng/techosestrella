/* global React, MATERIALES, money0 */
// ============================================================
//  Store reactivo de Klika
//  Estado compartido entre Inventario, Dashboard, vista móvil y topbar:
//   · materiales (editables / con badge "Actualizado")
//   · códigos de barra (EAN-13)
//   · solicitudes de cambio sensible (precio / mínimo / rendimiento)
//   · notificaciones por rol
// ============================================================

// ---- EAN-13: calcula el dígito verificador a partir de 12 dígitos ----
function ean13(base12) {
  const s = String(base12).padStart(12, "0").slice(0, 12);
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += (+s[i]) * (i % 2 === 0 ? 1 : 3);
  const check = (10 - (sum % 10)) % 10;
  return s + check;
}
function nuevoCodigo(seed) {
  // prefijo 770 (rango interno) + número de serie
  return ean13(770230000001 + seed * 53);
}

// ---- Metadatos de los campos sensibles ----
const CAMPOS_SENSIBLES = {
  precio: { label: "Precio unitario", fmt: (v) => money0(v) },
  min:    { label: "Stock mínimo",    fmt: (v, m) => `${v} ${m ? m.unidad : ""}`.trim() },
  rend:   { label: "Rendimiento",     fmt: (v) => `${v} m²` },
};

const KlikaStore = (function () {
  const listeners = new Set();
  function emit() { listeners.forEach((fn) => fn()); }

  // Semilla de materiales (copia editable)
  const materiales = MATERIALES.map((m) => ({ ...m }));

  // Semilla de códigos: casi todos tienen, M-04 y M-08 quedan sin código
  const barcodes = {};
  materiales.forEach((m, i) => {
    if (m.id !== "M-04" && m.id !== "M-08") barcodes[m.id] = nuevoCodigo(i + 1);
  });

  // Solicitudes de cambio de ejemplo (pendientes) para mostrar el flujo
  const requests = [
    { id: "SC-204", matId: "M-01", matNombre: "Membrana acrílica elastomérica blanca",
      campo: "precio", actual: 4850, propuesto: 5180, solicitadoPor: "José Ramírez", rol: "supervisor",
      fecha: "31 may", motivo: "El proveedor subió el precio de la cubeta esta semana.", estado: "pendiente" },
    { id: "SC-203", matId: "M-03", matNombre: "Manto asfáltico 4mm (rollo)",
      campo: "min", actual: 12, propuesto: 18, solicitadoPor: "José Ramírez", rol: "supervisor",
      fecha: "30 may", motivo: "Se agota rápido en temporada de lluvia, conviene subir el mínimo.", estado: "pendiente" },
  ];

  // Notificaciones por rol
  const notifs = [
    { id: "N-1", paraRol: "supervisor", tipo: "info", titulo: "Solicitudes en revisión",
      detalle: "Tus 2 solicitudes de cambio están esperando la aprobación del dueño.", fecha: "hoy", leida: false },
  ];

  let reqSeq = 205;
  let notifSeq = 2;

  function findMat(id) { return materiales.find((m) => m.id === id); }

  return {
    materiales, barcodes, requests, notifs, CAMPOS_SENSIBLES, ean13,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    // -------- Códigos de barra --------
    generarCodigo(matId) {
      if (!barcodes[matId]) {
        const seed = materiales.findIndex((m) => m.id === matId) + Date.now() % 9000 + 1;
        barcodes[matId] = nuevoCodigo(seed);
        emit();
      }
      return barcodes[matId];
    },
    codigoDe(matId) { return barcodes[matId] || null; },
    matPorCodigo(code) {
      const id = Object.keys(barcodes).find((k) => barcodes[k] === code);
      return id ? findMat(id) : null;
    },

    // -------- Edición directa (dueño) --------
    setCampoDirecto(matId, campo, valor) {
      const m = findMat(matId);
      if (m) { m[campo] = valor; emit(); }
    },
    setStock(matId, nuevoStock) {
      const m = findMat(matId);
      if (m) { m.stock = Math.max(0, nuevoStock); emit(); }
    },
    agregarMaterial(mat) { materiales.push(mat); emit(); },
    cargarMateriales(arr) { materiales.splice(0, materiales.length, ...arr); emit(); },
    reemplazarMaterial(oldId, nuevo) {
      const i = materiales.findIndex((m) => m.id === oldId);
      if (i >= 0) { materiales[i] = nuevo; emit(); }
    },

    // -------- Solicitudes de cambio --------
    pendientes() { return requests.filter((r) => r.estado === "pendiente"); },
    pendienteDe(matId, campo) {
      return requests.find((r) => r.matId === matId && r.campo === campo && r.estado === "pendiente") || null;
    },
    crearSolicitud({ matId, campo, propuesto, motivo, solicitadoPor, rol }) {
      const m = findMat(matId);
      if (!m) return;
      requests.unshift({
        id: "SC-" + reqSeq++, matId, matNombre: m.nombre, campo,
        actual: m[campo], propuesto, solicitadoPor, rol,
        fecha: "hoy", motivo: motivo || "", estado: "pendiente",
      });
      emit();
    },
    aprobarSolicitud(id) {
      const r = requests.find((x) => x.id === id);
      if (!r || r.estado !== "pendiente") return;
      const m = findMat(r.matId);
      if (m) {
        m[r.campo] = r.propuesto;
        m._updated = true;
        setTimeout(() => { const mm = findMat(r.matId); if (mm) { mm._updated = false; emit(); } }, 6500);
      }
      r.estado = "aprobada";
      notifs.unshift({
        id: "N-" + notifSeq++, paraRol: r.rol, tipo: "ok", titulo: "Cambio aprobado",
        detalle: `${r.matNombre} · ${CAMPOS_SENSIBLES[r.campo].label}: ${CAMPOS_SENSIBLES[r.campo].fmt(r.propuesto, m)}`,
        fecha: "ahora", leida: false,
      });
      emit();
    },
    rechazarSolicitud(id, motivoRechazo) {
      const r = requests.find((x) => x.id === id);
      if (!r || r.estado !== "pendiente") return;
      r.estado = "rechazada";
      r.motivoRechazo = motivoRechazo;
      const m = findMat(r.matId);
      notifs.unshift({
        id: "N-" + notifSeq++, paraRol: r.rol, tipo: "rechazo", titulo: "Solicitud rechazada",
        detalle: `${r.matNombre} · ${CAMPOS_SENSIBLES[r.campo].label}. Motivo: ${motivoRechazo}`,
        fecha: "ahora", leida: false,
      });
      emit();
    },

    // -------- Notificaciones --------
    notifsDe(rol) { return notifs.filter((n) => n.paraRol === rol); },
    noLeidasDe(rol) { return notifs.filter((n) => n.paraRol === rol && !n.leida).length; },
    marcarLeidas(rol) { notifs.forEach((n) => { if (n.paraRol === rol) n.leida = true; }); emit(); },

    // -------- Foco de navegación (Dashboard → Solicitudes) --------
    _focusSolicitudes: false,
    abrirSolicitudes() { this._focusSolicitudes = true; },
    consumirFocoSolicitudes() { const f = this._focusSolicitudes; this._focusSolicitudes = false; return f; },
  };
})();

// Hook que re-renderiza al cambiar el store
function useKlikaStore() {
  const [, force] = React.useState(0);
  React.useEffect(() => KlikaStore.subscribe(() => force((n) => n + 1)), []);
  return KlikaStore;
}

// ---- Componente: código de barras renderizado (EAN-13) ----
function BarcodeSVG({ code, height = 90, width = 2.4, fontSize = 18, displayValue = true, color = "#1A1A1A" }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current && code && window.JsBarcode) {
      try {
        window.JsBarcode(ref.current, code, {
          format: "EAN13", lineColor: color, width, height, fontSize,
          displayValue, margin: 6, font: "JetBrains Mono", textMargin: 3, background: "transparent",
        });
      } catch (e) { /* código inválido */ }
    }
  }, [code, height, width, fontSize, displayValue, color]);
  return <svg ref={ref} style={{ maxWidth: "100%" }} />;
}

// ---- Imprimir etiqueta (nombre + barcode + precio) ----
function imprimirEtiqueta(mat, code) {
  const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  try {
    window.JsBarcode(svgEl, code, { format: "EAN13", width: 2.2, height: 70, fontSize: 16, margin: 6, font: "JetBrains Mono", textMargin: 3 });
  } catch (e) { /* noop */ }
  const svgStr = new XMLSerializer().serializeToString(svgEl);
  const precio = money0(mat.precio);
  const w = window.open("", "_blank", "width=460,height=560");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Etiqueta · ${mat.nombre}</title>
  <style>
    @page { margin: 8mm; }
    body { font-family: "Figtree", -apple-system, Segoe UI, sans-serif; margin: 0; padding: 22px; color: #1A1A1A; }
    .label { width: 320px; margin: 0 auto; border: 1.5px dashed #B5B5B5; border-radius: 12px; padding: 18px 18px 14px; text-align: center; }
    .brand { font-size: 11px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; color: #1E7FC2; }
    .name { font-size: 16px; font-weight: 700; margin: 8px 0 12px; line-height: 1.25; }
    .bc { display: flex; justify-content: center; }
    .price-wrap { margin-top: 12px; padding-top: 12px; border-top: 1px solid #E8EAEE; display: flex; align-items: baseline; justify-content: space-between; }
    .price-lbl { font-size: 11px; color: #8A8A8A; font-weight: 600; text-transform: uppercase; letter-spacing: .6px; }
    .price { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
    .hint { text-align: center; font-size: 11px; color: #8A8A8A; margin-top: 16px; }
    @media print { .hint { display: none; } }
  </style></head>
  <body>
    <div class="label">
      <div class="brand">Techos Estrella</div>
      <div class="name">${mat.nombre}</div>
      <div class="bc">${svgStr}</div>
      <div class="price-wrap"><span class="price-lbl">Precio unitario</span><span class="price">${precio}</span></div>
    </div>
    <div class="hint">La impresión comienza automáticamente · Ctrl/⌘ + P para reimprimir</div>
  </body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => { try { w.print(); } catch (e) {} }, 350);
}

Object.assign(window, { KlikaStore, useKlikaStore, BarcodeSVG, imprimirEtiqueta });
