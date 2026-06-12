// ============================================================
//  Klika · Recursos del API (capa de acceso por módulo)
// ============================================================
// Envuelve window.KlikaAPI con funciones por recurso, alineadas 1:1 con las
// rutas del backend Laravel. Cada función devuelve la promesa con los datos.
//
// Uso en una pantalla:
//   const [clientes, setClientes] = React.useState([]);
//   React.useEffect(() => { KlikaData.clientes.lista().then(setClientes).catch(()=>{}); }, []);
//
// Si el backend no está disponible, las llamadas rechazan; las pantallas deben
// hacer fallback a sus datos mock (try/catch o .catch).
(function () {
  if (!window.KlikaAPI) {
    console.warn("KlikaData: KlikaAPI no está cargado. Incluye data/api.js antes.");
  }
  const api = window.KlikaAPI;
  const qs = (params) => {
    if (!params) return "";
    const p = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
    return p.length ? "?" + p.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&") : "";
  };

  // Traducción de estados de obra: backend → claves que usan las pantallas (ESTADOS/mock).
  const ESTADO_OBRA = {
    cotizada: "cotizada", aprobada: "aprobada", en_proceso: "proceso",
    pausada: "pausada", terminada: "terminada", cancelada: "cancelada",
  };

  // Adaptadores backend → forma mock que esperan las pantallas. Incluyen defaults
  // para TODO campo que la pantalla lee, evitando crashes al conectar datos reales.
  const map = {
    cliente: (c) => ({
      id: c.id,
      nombre: c.nombre ?? "",
      contacto: c.nombre ?? "",                 // backend no tiene "persona de contacto"
      tipoPersona: c.tipo === "empresa" ? "Empresa" : "Persona",
      tipo: "Residencial",                      // categoría sin equivalente en backend
      tel: c.telefono ?? "",
      telAlt: c.telefono_alt ?? "",
      correo: c.email ?? "",
      direccion: c.direccion ?? "",
      ciudad: c.ciudad ?? "",
      sector: c.ciudad ?? "",
      rnc: c.rnc_cedula ?? "",
      notas: c.notas ?? "",
      activo: c.activo !== false,
      desde: (c.created_at ?? "").slice(0, 4) || "—",
      obras: c.obras?.length ?? 0,
    }),

    obra: (o) => ({
      id: o.codigo ?? String(o.id),
      _id: o.id,
      cliente: o.cliente_id,
      clienteNom: o.cliente?.nombre ?? "",
      titulo: o.titulo ?? "",
      estado: ESTADO_OBRA[o.estado] ?? o.estado,
      cuadrilla: o.cuadrilla_id ?? null,
      inicio: o.fecha_inicio_estimada ?? "",
      fin: o.fecha_fin_estimada ?? "",
      avance: o.avance ?? 0,
      total: Number(o.total ?? 0),
      m2: Number(o.metros_cuadrados ?? 0),
    }),

    material: (m) => ({
      id: m.id,
      nombre: m.nombre ?? "",
      cat: m.categoria ?? "",
      unidad: m.unidad ?? "",
      stock: Number(m.stock_actual ?? 0),
      min: Number(m.stock_minimo ?? 0),
      rend: m.rendimiento != null ? Number(m.rendimiento) : null,
      precio: Number(m.costo_promedio ?? 0),
    }),

    // Convierte un formulario de la pantalla Clientes a la forma del backend.
    clienteAEnvio: (form) => ({
      nombre: form.nombre,
      tipo: form.tipoPersona === "Empresa" ? "empresa" : "persona",
      telefono: form.tel,
      telefono_alt: form.telAlt || null,
      email: form.correo || null,
      direccion: form.direccion || null,
      ciudad: form.ciudad || null,
      rnc_cedula: form.rnc || null,
      notas: form.notas || null,
    }),
  };

  const KlikaData = {
    conectado: () => !!(api && api.autenticado()),
    map,
    estadoObra: ESTADO_OBRA,

    // --- Dashboard / contabilidad ---
    dashboard: () => api.get("/dashboard"),
    contabilidad: {
      resumen: (periodo) => api.get("/contabilidad/resumen" + qs({ periodo })),
      certificadoEcf: () => api.get("/ecf/certificado-estado"),
    },

    // --- Configuración ---
    config: {
      get: () => api.get("/configuracion"),
      guardar: (data) => api.put("/configuracion", data),
    },

    // --- Usuarios ---
    usuarios: {
      lista: (params) => api.get("/usuarios" + qs(params)),
      crear: (data) => api.post("/usuarios", data),
      actualizar: (id, data) => api.put(`/usuarios/${id}`, data),
      desactivar: (id) => api.del(`/usuarios/${id}`),
    },

    // --- Clientes ---
    clientes: {
      lista: (params) => api.get("/clientes" + qs(params)),
      ver: (id) => api.get(`/clientes/${id}`),
      crear: (data) => api.post("/clientes", data),
      actualizar: (id, data) => api.put(`/clientes/${id}`, data),
      desactivar: (id) => api.del(`/clientes/${id}`),
      reactivar: (id) => api.post(`/clientes/${id}/reactivar`),
    },

    // --- Obras ---
    obras: {
      lista: (params) => api.get("/obras" + qs(params)),
      ver: (id) => api.get(`/obras/${id}`),
      crear: (data) => api.post("/obras", data),
      actualizar: (id, data) => api.put(`/obras/${id}`, data),
      eliminar: (id) => api.del(`/obras/${id}`),
      ubicacionVisible: (id, visible) => api.patch(`/obras/${id}/ubicacion-visible`, { visible }),
      secciones: (id) => api.get(`/obras/${id}/secciones`),
      crearSeccion: (id, data) => api.post(`/obras/${id}/secciones`, data),
      actualizarSeccion: (sid, data) => api.put(`/secciones/${sid}`, data),
      eliminarSeccion: (sid) => api.del(`/secciones/${sid}`),
      fotos: (id) => api.get(`/obras/${id}/fotos`),
      garantia: (id) => api.get(`/obras/${id}/garantia`),
      guardarGarantia: (id, data) => api.put(`/obras/${id}/garantia`, data),
      garantiaPdf: (id) => `${api.getBase()}/obras/${id}/garantia/pdf`,
      clima: (id) => api.get(`/clima/obras/${id}`),
    },

    // --- Cotizaciones ---
    cotizaciones: {
      lista: (params) => api.get("/cotizaciones" + qs(params)),
      ver: (id) => api.get(`/cotizaciones/${id}`),
      crear: (data) => api.post("/cotizaciones", data),
      actualizar: (id, data) => api.put(`/cotizaciones/${id}`, data),
      eliminar: (id) => api.del(`/cotizaciones/${id}`),
      calcular: (payload) => api.post("/cotizaciones/calcular", payload),
      aplicar: (id, payload) => api.post(`/cotizaciones/${id}/aplicar`, payload),
      accesoPortal: (id, data) => api.post(`/cotizaciones/${id}/acceso-portal`, data),
      pdf: (id) => `${api.getBase()}/cotizaciones/${id}/pdf`,
    },

    // --- Inventario ---
    materiales: {
      lista: (params) => api.get("/materiales" + qs(params)),
      ver: (id) => api.get(`/materiales/${id}`),
      crear: (data) => api.post("/materiales", data),
      actualizar: (id, data) => api.put(`/materiales/${id}`, data),
      eliminar: (id) => api.del(`/materiales/${id}`),
      buscarCodigo: (codigo) => api.get(`/materiales/buscar-codigo/${codigo}`),
      generarCodigo: (id) => api.post(`/materiales/${id}/generar-codigo`),
    },
    movimientos: {
      lista: (params) => api.get("/movimientos-inventario" + qs(params)),
      crear: (data) => api.post("/movimientos-inventario", data),
    },

    // --- Cuadrillas / vehículos ---
    cuadrillas: {
      lista: () => api.get("/cuadrillas"),
      crear: (data) => api.post("/cuadrillas", data),
      actualizar: (id, data) => api.put(`/cuadrillas/${id}`, data),
      eliminar: (id) => api.del(`/cuadrillas/${id}`),
      agregarMiembro: (id, usuarioId) => api.post(`/cuadrillas/${id}/miembros`, { usuario_id: usuarioId }),
      quitarMiembro: (id, usuarioId) => api.del(`/cuadrillas/${id}/miembros/${usuarioId}`),
    },
    vehiculos: {
      lista: () => api.get("/vehiculos"),
      crear: (data) => api.post("/vehiculos", data),
      actualizar: (id, data) => api.put(`/vehiculos/${id}`, data),
      asignar: (id, cuadrillaId) => api.patch(`/vehiculos/${id}/asignar`, { cuadrilla_id: cuadrillaId }),
      ubicaciones: () => api.get("/vehiculos/ubicaciones"),
    },

    // --- Planificador / clima ---
    planificador: {
      dias: (mes) => api.get("/obra-dias" + qs({ mes })),
      crearDia: (data) => api.post("/obra-dias", data),
      actualizarDia: (id, data) => api.put(`/obra-dias/${id}`, data),
      eliminarDia: (id) => api.del(`/obra-dias/${id}`),
    },

    // --- Asistencias ---
    asistencias: {
      lista: (params) => api.get("/asistencias" + qs(params)),
      checkin: (data) => api.post("/asistencias/checkin", data),
      checkout: (data) => api.post("/asistencias/checkout", data),
      corregir: (id, data) => api.patch(`/asistencias/${id}/corregir`, data),
    },

    // --- Facturación ---
    facturas: {
      lista: (params) => api.get("/facturas" + qs(params)),
      ver: (id) => api.get(`/facturas/${id}`),
      crear: (data) => api.post("/facturas", data),
      enviarDgii: (id) => api.post(`/facturas/${id}/enviar-dgii`),
      anular: (id) => api.post(`/facturas/${id}/anular`),
      pagar: (id, data) => api.post(`/facturas/${id}/pagos`, data),
      pdf: (id) => `${api.getBase()}/facturas/${id}/pdf`,
    },
    gastosContables: {
      lista: (params) => api.get("/gastos-contables" + qs(params)),
      crear: (data) => api.post("/gastos-contables", data),
      actualizar: (id, data) => api.put(`/gastos-contables/${id}`, data),
      eliminar: (id) => api.del(`/gastos-contables/${id}`),
    },
    ncf: {
      secuencias: () => api.get("/ncf/secuencias"),
      actualizar: (id, data) => api.put(`/ncf/secuencias/${id}`, data),
    },

    // --- Pagos / gastos de obra ---
    pagos: {
      lista: (params) => api.get("/pagos" + qs(params)),
      crear: (data) => api.post("/pagos", data),
    },
    gastos: {
      lista: (params) => api.get("/gastos" + qs(params)),
      crear: (data) => api.post("/gastos", data),
    },

    // --- Reportes (dueño) ---
    reportes: {
      r606: (periodo) => api.get("/reportes/606" + qs({ periodo })),
      r607: (periodo) => api.get("/reportes/607" + qs({ periodo })),
      txt606: (periodo) => `${api.getBase()}/reportes/606/txt` + qs({ periodo }),
      txt607: (periodo) => `${api.getBase()}/reportes/607/txt` + qs({ periodo }),
      rentabilidad: () => api.get("/reportes/rentabilidad"),
      resumenObras: () => api.get("/reportes/resumen-obras"),
      stockBajo: () => api.get("/reportes/stock-bajo"),
      asistenciaMensual: (periodo) => api.get("/reportes/asistencia-mensual" + qs({ periodo })),
    },

    // --- RR.HH. ---
    empleados: {
      lista: () => api.get("/empleados"),
      crear: (data) => api.post("/empleados", data),
      actualizar: (id, data) => api.put(`/empleados/${id}`, data),
      vacacionesResumen: (usuarioId) => api.get(`/empleados/${usuarioId}/vacaciones-resumen`),
    },
    ausencias: {
      lista: (params) => api.get("/ausencias" + qs(params)),
      crear: (data) => api.post("/ausencias", data),
      calendario: (mes) => api.get("/ausencias/calendario" + qs({ mes })),
      aprobar: (id, forzar) => api.post(`/ausencias/${id}/aprobar`, { forzar: !!forzar }),
      rechazar: (id, motivo) => api.post(`/ausencias/${id}/rechazar`, { motivo_rechazo: motivo }),
    },
    feriados: {
      lista: (ano) => api.get("/feriados" + qs({ ano })),
      crear: (data) => api.post("/feriados", data),
      eliminar: (id) => api.del(`/feriados/${id}`),
    },

    // --- Solicitudes de cambio ---
    solicitudes: {
      lista: (params) => api.get("/solicitudes-cambio" + qs(params)),
      crear: (data) => api.post("/solicitudes-cambio", data),
      aprobar: (id) => api.post(`/solicitudes-cambio/${id}/aprobar`),
      rechazar: (id, motivo) => api.post(`/solicitudes-cambio/${id}/rechazar`, { motivo_rechazo: motivo }),
    },

    // --- Klika IA ---
    klika: {
      chat: (mensaje, conversacionId) => api.post("/klika/chat", { mensaje, conversacion_id: conversacionId }),
      conversaciones: () => api.get("/klika/conversaciones"),
      conversacion: (id) => api.get(`/klika/conversaciones/${id}`),
    },
  };

  window.KlikaData = KlikaData;
})();
