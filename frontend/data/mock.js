// ============================================================
//  Datos mock · Techos Estrella  (todo en RD$ y español dominicano)
// ============================================================

const FMT = new Intl.NumberFormat("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (n) => "RD$ " + FMT.format(n);
const money0 = (n) => "RD$ " + new Intl.NumberFormat("es-DO").format(Math.round(n));

// ---- Estados de obra ----
const ESTADOS = {
  borrador:   { label: "Borrador",   cls: "badge-purple" },
  cotizada:   { label: "Cotizada",   cls: "badge-gray" },
  aprobada:   { label: "Aprobada",   cls: "badge-blue" },
  proceso:    { label: "En proceso", cls: "badge-amber" },
  pausada:    { label: "Pausada",    cls: "badge-purple" },
  terminada:  { label: "Terminada",  cls: "badge-green" },
  cancelada:  { label: "Cancelada",  cls: "badge-red" },
};

// ---- Clientes ----
const CLIENTES = [
  { id: "C-1042", nombre: "Villa Olga · Familia Reyes", contacto: "Ana Reyes", tel: "809-555-0142", correo: "ana.reyes@gmail.com", sector: "Villa Olga, Santiago", tipo: "Residencial", obras: 2, desde: "2021" },
  { id: "C-1043", nombre: "Plaza Internacional", contacto: "Lic. Marte", tel: "809-555-0199", correo: "admin@plazaint.do", sector: "Av. Estrella Sadhalá", tipo: "Comercial", obras: 3, desde: "2019" },
  { id: "C-1044", nombre: "Residencial Cerros de Gurabo", contacto: "Junta de Vecinos", tel: "829-555-0177", correo: "junta@cerrosgurabo.do", sector: "Gurabo, Santiago", tipo: "Residencial", obras: 1, desde: "2023" },
  { id: "C-1045", nombre: "Colegio San Rafael", contacto: "P. Domínguez", tel: "809-555-0120", correo: "mantenimiento@sanrafael.edu.do", sector: "Los Jardines", tipo: "Institucional", obras: 2, desde: "2018" },
  { id: "C-1046", nombre: "Ferretería La Económica", contacto: "Sr. Peña", tel: "849-555-0188", correo: "lapena@economica.do", sector: "Centro de la ciudad", tipo: "Comercial", obras: 1, desde: "2022" },
  { id: "C-1047", nombre: "Familia Then Polanco", contacto: "Marcos Then", tel: "809-555-0163", correo: "mthen@hotmail.com", sector: "Jardines Metropolitanos", tipo: "Residencial", obras: 1, desde: "2024" },
];

// ---- Materiales / inventario ----
const MATERIALES = [
  { id: "M-01", nombre: "Membrana acrílica elastomérica blanca", cat: "Impermeabilizante", stock: 38, min: 25, unidad: "cubeta 5gal", rend: 9, precio: 4850 },
  { id: "M-02", nombre: "Primer / sellador de poros", cat: "Imprimante", stock: 9, min: 15, unidad: "cubeta 5gal", rend: 18, precio: 3200 },
  { id: "M-03", nombre: "Manto asfáltico 4mm (rollo)", cat: "Manto", stock: 22, min: 12, unidad: "rollo 10m²", rend: 9.5, precio: 2750 },
  { id: "M-04", nombre: "Malla de refuerzo poliéster", cat: "Refuerzo", stock: 6, min: 10, unidad: "rollo 100m", rend: 95, precio: 1850 },
  { id: "M-05", nombre: "Membrana acrílica roja (techo visible)", cat: "Impermeabilizante", stock: 14, min: 8, unidad: "cubeta 5gal", rend: 9, precio: 5200 },
  { id: "M-06", nombre: "Sellador de poliuretano (cartucho)", cat: "Sellador", stock: 41, min: 20, unidad: "cartucho", rend: 6, precio: 480 },
  { id: "M-07", nombre: "Pintura de tránsito (azotea transitable)", cat: "Acabado", stock: 17, min: 10, unidad: "cubeta 5gal", rend: 11, precio: 4100 },
  { id: "M-08", nombre: "Cinta de refuerzo autoadhesiva", cat: "Refuerzo", stock: 3, min: 12, unidad: "rollo 15m", rend: 14, precio: 920 },
];

// factor por condición del techo
const FACTOR_COND = { bueno: 1.0, regular: 1.15, dañado: 1.35 };
const COND_META = {
  bueno:   { label: "Bueno",   cls: "badge-green" },
  regular: { label: "Regular", cls: "badge-amber" },
  dañado:  { label: "Dañado",  cls: "badge-red" },
};

// ---- Cuadrillas ----
const CUADRILLAS = [
  { id: "CU-1", nombre: "Cuadrilla A — Ramírez", lider: "José Ramírez", color: "var(--star-blue)",
    miembros: ["José Ramírez", "Wilkin Suero", "Ramón Acosta"], obras: ["OB-2401", "OB-2405"], vehiculo: "V-01" },
  { id: "CU-2", nombre: "Cuadrilla B — Núñez", lider: "Pedro Núñez", color: "var(--star-green)",
    miembros: ["Pedro Núñez", "Elvis Tavárez", "Junior Paulino", "Carlos Mejía"], obras: ["OB-2403"], vehiculo: "V-02" },
  { id: "CU-3", nombre: "Cuadrilla C — Disla", lider: "Frank Disla", color: "var(--star-purple)",
    miembros: ["Frank Disla", "Yan Carlos R.", "Manuel Ureña"], obras: ["OB-2406"], vehiculo: null },
];

// ---- Vehículos / flota ----
const VEHICULOS = [
  { id: "V-01", placa: "A123456", tipo: "Camioneta", modelo: "Toyota Hilux 2019", estado: "activo" },
  { id: "V-02", placa: "A789012", tipo: "Camión", modelo: "Isuzu NPR 2017", estado: "activo" },
  { id: "V-03", placa: "L345678", tipo: "Motocicleta", modelo: "Honda XR150 2022", estado: "taller" },
];

// ---- Usuarios del sistema ----
const USUARIOS = [
  { id: "U-1", nombre: "Rafael Estrella", rol: "dueno", tel: "809-580-1993", correo: "rafael@techosestrella.com", activo: true },
  { id: "U-2", nombre: "Yokasta Pérez", rol: "secretaria", tel: "809-555-0110", correo: "yokasta@techosestrella.com", activo: true },
  { id: "U-3", nombre: "José Ramírez", rol: "supervisor", tel: "829-555-0121", correo: "jose@techosestrella.com", activo: true },
  { id: "U-4", nombre: "Wilkin Suero", rol: "aplicador", tel: "849-555-0142", correo: "", activo: true },
  { id: "U-5", nombre: "Frank Disla", rol: "aplicador", tel: "809-555-0163", correo: "", activo: false },
];

// ---- Asistencias (check-ins) ----
const ASISTENCIAS = [
  { id: "A-1", fecha: "31 may", quien: "Wilkin Suero", cuadrilla: "CU-1", obra: "OB-2401", entrada: "07:52", salida: "16:10", estado: "ok" },
  { id: "A-2", fecha: "31 may", quien: "Ramón Acosta", cuadrilla: "CU-1", obra: "OB-2401", entrada: "08:05", salida: "16:10", estado: "ok" },
  { id: "A-3", fecha: "31 may", quien: "Pedro Núñez", cuadrilla: "CU-2", obra: "OB-2403", entrada: "—", salida: "—", estado: "falta" },
  { id: "A-4", fecha: "30 may", quien: "Wilkin Suero", cuadrilla: "CU-1", obra: "OB-2401", entrada: "07:48", salida: "—", estado: "sin_salida" },
  { id: "A-5", fecha: "30 may", quien: "Elvis Tavárez", cuadrilla: "CU-2", obra: "OB-2403", entrada: "09:20", salida: "16:00", estado: "tarde" },
  { id: "A-6", fecha: "30 may", quien: "Frank Disla", cuadrilla: "CU-3", obra: "OB-2406", entrada: "08:00", salida: "15:30", estado: "ok" },
];
const ASIST_META = {
  ok:         { label: "Completa",   cls: "badge-green" },
  tarde:      { label: "Tarde",      cls: "badge-amber" },
  sin_salida: { label: "Sin salida", cls: "badge-purple" },
  falta:      { label: "Falta",      cls: "badge-red" },
};

// ---- Obras ----
const OBRAS = [
  { id: "OB-2401", cliente: "C-1042", clienteNom: "Villa Olga · Familia Reyes", titulo: "Impermeabilización azotea principal",
    estado: "proceso", cuadrilla: "CU-1", direccion: "Calle 4 #12, Villa Olga, Santiago", mapa: true,
    inicio: "26 may", fin: "02 jun", avance: 60, total: 187420,
    secciones: [
      { nombre: "Techo principal", m2: 120, cond: "regular", manos: 2 },
      { nombre: "Marquesina entrada", m2: 28, cond: "dañado", manos: 2 },
    ] },
  { id: "OB-2402", cliente: "C-1043", clienteNom: "Plaza Internacional", titulo: "Sellado de filtraciones nivel 2",
    estado: "aprobada", cuadrilla: null, direccion: "Av. Estrella Sadhalá #88", mapa: true,
    inicio: "03 jun", fin: "06 jun", avance: 0, total: 342900,
    secciones: [ { nombre: "Azotea bloque A", m2: 240, cond: "regular", manos: 2 }, { nombre: "Azotea bloque B", m2: 180, cond: "bueno", manos: 2 } ] },
  { id: "OB-2403", cliente: "C-1045", clienteNom: "Colegio San Rafael", titulo: "Membrana acrílica aulas nuevas",
    estado: "proceso", cuadrilla: "CU-2", direccion: "Los Jardines, calle principal", mapa: true,
    inicio: "24 may", fin: "31 may", avance: 85, total: 256000,
    secciones: [ { nombre: "Techo aulas", m2: 310, cond: "bueno", manos: 2 } ] },
  { id: "OB-2404", cliente: "C-1046", clienteNom: "Ferretería La Económica", titulo: "Cotización techo de zinc + acrílico",
    estado: "cotizada", cuadrilla: null, direccion: "Centro, calle del Sol #45", mapa: false,
    inicio: "—", fin: "—", avance: 0, total: 98750,
    secciones: [ { nombre: "Techo nave", m2: 95, cond: "dañado", manos: 1 } ] },
  { id: "OB-2405", cliente: "C-1047", clienteNom: "Familia Then Polanco", titulo: "Azotea transitable + jardín",
    estado: "aprobada", cuadrilla: "CU-1", direccion: "Jardines Metropolitanos, manzana H", mapa: true,
    inicio: "05 jun", fin: "10 jun", avance: 0, total: 214300,
    secciones: [ { nombre: "Azotea principal", m2: 140, cond: "regular", manos: 3 } ] },
  { id: "OB-2406", cliente: "C-1044", clienteNom: "Residencial Cerros de Gurabo", titulo: "Mantenimiento preventivo torre B",
    estado: "pausada", cuadrilla: "CU-3", direccion: "Gurabo arriba, entrada 2", mapa: true,
    inicio: "20 may", fin: "—", avance: 35, total: 176800,
    secciones: [ { nombre: "Azotea torre B", m2: 165, cond: "regular", manos: 2 } ] },
  { id: "OB-2398", cliente: "C-1043", clienteNom: "Plaza Internacional", titulo: "Impermeabilización parqueo techado",
    estado: "terminada", cuadrilla: "CU-2", direccion: "Av. Estrella Sadhalá #88", mapa: true,
    inicio: "02 may", fin: "09 may", avance: 100, total: 410500,
    secciones: [ { nombre: "Losa parqueo", m2: 380, cond: "bueno", manos: 2 } ] },
  { id: "OB-2399", cliente: "C-1042", clienteNom: "Villa Olga · Familia Reyes", titulo: "Reparación marquesina trasera",
    estado: "cancelada", cuadrilla: null, direccion: "Calle 4 #12, Villa Olga", mapa: true,
    inicio: "—", fin: "—", avance: 0, total: 42000,
    secciones: [ { nombre: "Marquesina", m2: 30, cond: "dañado", manos: 2 } ] },
];

// ---- Cotizaciones independientes (sin obra) ----
// Casos: venta de materiales a particulares / presupuesto rápido sin obra registrada.
// item.tipo: "material" (del inventario) | "manual"
const COTIZ_INDEP = [
  { id: "CT-0091", clienteId: "C-1046", cliente: "Ferretería La Económica", desc: "Reposición de inventario — venta de materiales al por mayor",
    estado: "cotizada", itbis: true, descTipo: "pct", descVal: 5,
    items: [
      { id: "i1", tipo: "material", matId: "M-01", desc: "Membrana acrílica elastomérica blanca", cant: 8, unidad: "cubeta 5gal", precio: 4850 },
      { id: "i2", tipo: "material", matId: "M-06", desc: "Sellador de poliuretano (cartucho)", cant: 24, unidad: "cartucho", precio: 480 },
      { id: "i3", tipo: "material", matId: "M-08", desc: "Cinta de refuerzo autoadhesiva", cant: 6, unidad: "rollo 15m", precio: 920 },
    ] },
  { id: "CT-0090", clienteId: null, cliente: "Wilson De la Cruz (mostrador)", desc: "Cliente de mostrador — compra rápida",
    estado: "aprobada", itbis: true, descTipo: "monto", descVal: 0,
    items: [
      { id: "i1", tipo: "material", matId: "M-05", desc: "Membrana acrílica roja (techo visible)", cant: 2, unidad: "cubeta 5gal", precio: 5200 },
      { id: "i2", tipo: "manual", desc: "Transporte a domicilio (Gurabo)", cant: 1, unidad: "viaje", precio: 1500 },
    ] },
];


// ============================================================
//  CONTABILIDAD · Facturación electrónica DGII (RD)
//  NCF / e-CF · ITBIS 18% · reportes 606 (compras) y 607 (ventas)
// ============================================================
const ITBIS_RATE = 0.18;

// Tipos de comprobante (NCF)
const TIPO_NCF = {
  B01: { short: "B01", label: "Crédito Fiscal", cls: "badge-blue",   desc: "Para clientes con RNC (deducen ITBIS)" },
  B02: { short: "B02", label: "Consumo",        cls: "badge-gray",   desc: "Consumidor final, sin RNC" },
  B03: { short: "B03", label: "Nota de Débito", cls: "badge-amber",  desc: "Aumenta el valor de una factura" },
  B04: { short: "B04", label: "Nota de Crédito",cls: "badge-purple", desc: "Devoluciones / descuentos posteriores" },
};

// Estado e-CF (envío a la DGII)
const ECF_META = {
  aprobado:  { label: "Aprobado",  cls: "badge-green" },
  pendiente: { label: "Pendiente", cls: "badge-amber" },
  rechazado: { label: "Rechazado", cls: "badge-red" },
  no_aplica: { label: "No aplica", cls: "badge-gray" },
};

const METODOS_PAGO = ["Efectivo", "Transferencia", "Cheque", "Tarjeta"];

// Categorías de gasto (mapean a tipo de bienes/servicios del 606)
const GASTO_CAT = [
  "Materiales / impermeabilizantes", "Combustible", "Mano de obra externa",
  "Herramientas y equipos", "Transporte / fletes", "Servicios (luz, agua, tel.)",
  "Alquiler", "Mantenimiento de flota", "Otros",
];

// ---- Facturas (ventas · reporte 607) ----
// items: { desc, cant, unidad, precio, itbis (% — 18 ó 0 exento) }
// pagos: { fecha, monto, metodo, ref }
const FACTURAS = [
  { id: "F-2605", ncf: "E310000000045", tipo: "B01", clienteId: "C-1043", cliente: "Plaza Internacional", rnc: "1-30-12345-6",
    fecha: "09 may 2026", fechaISO: "2026-05-09", obraId: "OB-2398", requiere_ecf: true, ecf: "aprobado", trackId: "DGII-7F3A9C",
    descTipo: "pct", descVal: 0,
    items: [
      { desc: "Impermeabilización losa parqueo (380 m²)", cant: 380, unidad: "m²", precio: 950, itbis: 18 },
      { desc: "Sellado de juntas y fisuras", cant: 1, unidad: "global", precio: 48500, itbis: 18 },
    ],
    pagos: [{ fecha: "12 may 2026", monto: 410500, metodo: "Transferencia", ref: "TRF-889201" }] },

  { id: "F-2606", ncf: "E310000000046", tipo: "B01", clienteId: "C-1045", cliente: "Colegio San Rafael", rnc: "4-01-50891-2",
    fecha: "28 may 2026", fechaISO: "2026-05-28", obraId: "OB-2403", requiere_ecf: true, ecf: "pendiente", trackId: "DGII-91B2D0",
    descTipo: "pct", descVal: 5,
    items: [
      { desc: "Membrana acrílica techo aulas (310 m²)", cant: 310, unidad: "m²", precio: 720, itbis: 18 },
      { desc: "Primer / sellador de poros", cant: 18, unidad: "cubeta", precio: 3200, itbis: 18 },
    ],
    pagos: [] },

  { id: "F-2604", ncf: "B0200000891", tipo: "B02", clienteId: "C-1042", cliente: "Villa Olga · Familia Reyes", rnc: "",
    fecha: "30 may 2026", fechaISO: "2026-05-30", obraId: "OB-2401", requiere_ecf: false, ecf: "no_aplica", trackId: null,
    descTipo: "pct", descVal: 0,
    items: [
      { desc: "Avance 60% impermeabilización azotea", cant: 1, unidad: "abono", precio: 112452, itbis: 18 },
    ],
    pagos: [{ fecha: "30 may 2026", monto: 60000, metodo: "Efectivo", ref: "REC-0042" }] },

  { id: "F-2603", ncf: "E310000000044", tipo: "B01", clienteId: "C-1043", cliente: "Plaza Internacional", rnc: "1-30-12345-6",
    fecha: "26 may 2026", fechaISO: "2026-05-26", obraId: null, requiere_ecf: true, ecf: "rechazado", trackId: "DGII-55E1A7",
    motivoRechazo: "RNC del comprador no válido o inactivo en el registro de la DGII (código 2-CO-001). Verifique el RNC y reenvíe el e-CF.",
    descTipo: "pct", descVal: 0,
    items: [
      { desc: "Mantenimiento preventivo cubierta nivel 2", cant: 1, unidad: "servicio", precio: 64800, itbis: 18 },
    ],
    pagos: [] },

  { id: "F-2602", ncf: "E310000000043", tipo: "B01", clienteId: "C-1047", cliente: "Familia Then Polanco", rnc: "0-01-2233445-1",
    fecha: "20 may 2026", fechaISO: "2026-05-20", obraId: "OB-2405", requiere_ecf: true, ecf: "aprobado", trackId: "DGII-22A8FF",
    descTipo: "monto", descVal: 0,
    items: [
      { desc: "Azotea transitable + jardín (140 m²)", cant: 140, unidad: "m²", precio: 1280, itbis: 18 },
    ],
    pagos: [{ fecha: "21 may 2026", monto: 90000, metodo: "Cheque", ref: "CHQ-4471" }] },

  { id: "F-2601", ncf: "B0200000888", tipo: "B02", clienteId: "C-1046", cliente: "Ferretería La Económica", rnc: "",
    fecha: "14 may 2026", fechaISO: "2026-05-14", obraId: null, requiere_ecf: false, ecf: "no_aplica", trackId: null,
    descTipo: "pct", descVal: 0,
    items: [
      { desc: "Venta de membrana acrílica blanca", cant: 8, unidad: "cubeta", precio: 4850, itbis: 18 },
    ],
    pagos: [{ fecha: "14 may 2026", monto: 45784, metodo: "Tarjeta", ref: "POS-7781" }] },

  { id: "F-2598", ncf: "B0400000012", tipo: "B04", clienteId: "C-1042", cliente: "Villa Olga · Familia Reyes", rnc: "",
    fecha: "05 may 2026", fechaISO: "2026-05-05", obraId: "OB-2399", requiere_ecf: false, ecf: "no_aplica", trackId: null,
    anulada: false, descTipo: "pct", descVal: 0,
    items: [
      { desc: "Nota de crédito — reparación marquesina cancelada", cant: 1, unidad: "global", precio: 42000, itbis: 18 },
    ],
    pagos: [] },
];

// ---- Gastos (compras · reporte 606) ----
const GASTOS = [
  { id: "G-141", fecha: "29 may 2026", fechaISO: "2026-05-29", proveedor: "Impermeabilizantes del Cibao SRL", rncProv: "1-31-55890-7",
    descripcion: "Compra de 20 cubetas membrana acrílica", categoria: "Materiales / impermeabilizantes", monto: 82203, itbis: 14797,
    ncfProv: "E310000098231", tipoNcf: "B01", metodo: "Transferencia", obraId: null },
  { id: "G-140", fecha: "27 may 2026", fechaISO: "2026-05-27", proveedor: "Estación Texaco Sadhalá", rncProv: "1-01-00012-3",
    descripcion: "Combustible camioneta V-01 (mes)", categoria: "Combustible", monto: 9322, itbis: 1678,
    ncfProv: "B0100023118", tipoNcf: "B01", metodo: "Tarjeta", obraId: "OB-2401" },
  { id: "G-139", fecha: "24 may 2026", fechaISO: "2026-05-24", proveedor: "Ferretería La Económica", rncProv: "1-30-77120-4",
    descripcion: "Tornillería, brochas y rodillos", categoria: "Herramientas y equipos", monto: 6610, itbis: 1190,
    ncfProv: "B0100445091", tipoNcf: "B01", metodo: "Efectivo", obraId: "OB-2403" },
  { id: "G-138", fecha: "20 may 2026", fechaISO: "2026-05-20", proveedor: "Frank Disla (subcontrato)", rncProv: "",
    descripcion: "Mano de obra externa — torre B", categoria: "Mano de obra externa", monto: 35000, itbis: 0,
    ncfProv: "", tipoNcf: "B02", metodo: "Efectivo", obraId: "OB-2406" },
  { id: "G-137", fecha: "16 may 2026", fechaISO: "2026-05-16", proveedor: "EDENORTE", rncProv: "1-01-80009-9",
    descripcion: "Electricidad — taller y almacén", categoria: "Servicios (luz, agua, tel.)", monto: 7458, itbis: 1342,
    ncfProv: "E450000041220", tipoNcf: "B01", metodo: "Transferencia", obraId: null },
  { id: "G-136", fecha: "12 may 2026", fechaISO: "2026-05-12", proveedor: "Repuestos Hilux Santiago", rncProv: "1-31-22008-1",
    descripcion: "Mantenimiento Isuzu NPR V-02", categoria: "Mantenimiento de flota", monto: 18644, itbis: 3356,
    ncfProv: "B0100099812", tipoNcf: "B01", metodo: "Cheque", obraId: null },
];

// ---- Secuencias de NCF autorizadas por la DGII ----
const NCF_SECUENCIAS = [
  { tipo: "B01", prefijo: "E31", desde: 1, hasta: 5000, actual: 46, vence: "31 dic 2026" },
  { tipo: "B02", prefijo: "B02", desde: 1, hasta: 1000, actual: 942, vence: "31 dic 2026" },
  { tipo: "B03", prefijo: "B03", desde: 1, hasta: 200, actual: 14, vence: "31 dic 2026" },
  { tipo: "B04", prefijo: "B04", desde: 1, hasta: 100, actual: 100, vence: "31 dic 2026" },
];

// ---- Helpers de cálculo contable ----
function facturaCalc(f) {
  const items = f.items || [];
  const sub = items.reduce((a, it) => a + (it.cant || 0) * (it.precio || 0), 0);
  const desc = f.descTipo === "pct" ? sub * ((f.descVal || 0) / 100) : Math.min(f.descVal || 0, sub);
  const base = sub - desc;
  const factor = sub > 0 ? base / sub : 0; // descuento prorrateado para la base imponible
  const itbis = items.reduce((a, it) => a + (it.cant || 0) * (it.precio || 0) * factor * ((it.itbis || 0) / 100), 0);
  const total = base + itbis;
  const cobrado = (f.pagos || []).reduce((a, p) => a + (p.monto || 0), 0);
  return { sub, desc, base, itbis, total, cobrado, pendiente: Math.max(0, total - cobrado) };
}
function facturaPagada(f) {
  const { total, cobrado } = facturaCalc(f);
  return cobrado >= total - 0.5;
}
function ncfDisponibles(s) { return Math.max(0, s.hasta - s.actual); }
function ncfPct(s) { const tot = s.hasta - s.desde + 1; return tot > 0 ? ncfDisponibles(s) / tot : 0; }

// apto | precaucion | bloqueado
function buildClima() {
  const dias = {};
  const lluvia = { 5: "precaucion", 11: "bloqueado", 12: "bloqueado", 18: "precaucion", 24: "bloqueado", 25: "precaucion", 6: "precaucion" };
  for (let d = 1; d <= 30; d++) dias[d] = lluvia[d] || "apto";
  return dias;
}
const CLIMA = buildClima();
const CLIMA_META = {
  apto:       { label: "Apto",      color: "var(--green)",  bg: "var(--green-bg)",  ink: "var(--green-ink)",  icon: "sun" },
  precaucion: { label: "Precaución", color: "var(--amber)", bg: "var(--amber-bg)",  ink: "var(--amber-ink)",  icon: "cloud" },
  bloqueado:  { label: "Bloqueado", color: "var(--red)",    bg: "var(--red-bg)",    ink: "var(--red-ink)",    icon: "rain" },
};

// Obras programadas en el calendario (día de junio -> obras)
const PROGRAMACION = {
  3: ["OB-2402"], 4: ["OB-2402"], 5: ["OB-2405"], 6: ["OB-2405"],
  2: ["OB-2401"], 9: ["OB-2403"], 11: ["OB-2405"], 16: ["OB-2406"], 18: ["OB-2402"], 24: ["OB-2401"],
};

// ---- Roles ----
const ROLES = {
  dueno:      { label: "Dueño",      nombre: "Rafael Estrella", inicial: "RE",
    nav: ["dashboard","obras","cotizacion","facturas","gastos","dgii","ncf","planificador","inventario","rrhh","cuadrillas","vehiculos","asistencias","clientes","usuarios","reportes","klika","config"] },
  secretaria: { label: "Secretaria", nombre: "Yokasta Pérez", inicial: "YP",
    nav: ["dashboard","obras","cotizacion","facturas","gastos","dgii","ncf","rrhh","clientes","klika"] },
  supervisor: { label: "Supervisor", nombre: "José Ramírez", inicial: "JR",
    nav: ["dashboard","obras","planificador","cuadrillas","vehiculos","asistencias","inventario","klika"] },
  aplicador:  { label: "Aplicador",  nombre: "Wilkin Suero", inicial: "WS", nav: ["aplicador"] },
};

const NAV_META = {
  dashboard:    { label: "Inicio",        icon: "dashboard" },
  obras:        { label: "Obras",         icon: "roof" },
  cotizacion:   { label: "Cotizaciones",  icon: "quote" },
  facturas:     { label: "Facturas",      icon: "receipt",  grupo: "Contabilidad" },
  gastos:       { label: "Gastos",        icon: "wallet" },
  dgii:         { label: "Reportes DGII", icon: "bank" },
  ncf:          { label: "Secuencias NCF",icon: "hash" },
  planificador: { label: "Planificador",  icon: "calendar" },
  inventario:   { label: "Inventario",    icon: "inventory" },
  rrhh:         { label: "Recursos Humanos", icon: "hr" },
  cuadrillas:   { label: "Cuadrillas",    icon: "crews" },
  vehiculos:    { label: "Vehículos",     icon: "truck" },
  asistencias:  { label: "Asistencias",   icon: "clock" },
  clientes:     { label: "Clientes",      icon: "clients" },
  usuarios:     { label: "Usuarios",      icon: "user" },
  reportes:     { label: "Reportes",      icon: "reports" },
  klika:        { label: "Asistente Klika", icon: "klika" },
  config:       { label: "Configuración",   icon: "settings" },
};

Object.assign(window, {
  money, money0, ESTADOS, CLIENTES, MATERIALES, FACTOR_COND, COND_META,
  CUADRILLAS, VEHICULOS, USUARIOS, ASISTENCIAS, ASIST_META, OBRAS, COTIZ_INDEP, CLIMA, CLIMA_META, PROGRAMACION, ROLES, NAV_META,
  ITBIS_RATE, TIPO_NCF, ECF_META, METODOS_PAGO, GASTO_CAT, FACTURAS, GASTOS, NCF_SECUENCIAS,
  facturaCalc, facturaPagada, ncfDisponibles, ncfPct,
});
