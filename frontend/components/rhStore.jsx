/* global React, OBRAS, CUADRILLAS */
// ============================================================
//  Store de Recursos Humanos
//  Empleados · feriados RD 2026 · ausencias · vacaciones
//  Estado compartido: pantalla RRHH, dashboard, vista móvil, sidebar
// ============================================================

const RH_HOY = "2026-06-02"; // fecha "actual" del sistema (mar 2 jun 2026)

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MESES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS_LMV = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]; // semana inicia lunes

// ---- Helpers de fecha (ISO "YYYY-MM-DD", sin desfase de zona horaria) ----
function parseISO(iso) { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); }
function toISO(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function fmtFecha(iso) { if (!iso) return "—"; const d = parseISO(iso); return `${d.getDate()} ${MESES_CORTO[d.getMonth()]} ${d.getFullYear()}`; }
function fmtFechaLarga(iso) { const d = parseISO(iso); return `${d.getDate()} de ${MESES[d.getMonth()]} ${d.getFullYear()}`; }
function esFinde(iso) { const g = parseISO(iso).getDay(); return g === 0 || g === 6; }
function diaSemanaLun(iso) { const g = parseISO(iso).getDay(); return (g + 6) % 7; } // 0=lunes
function addDias(iso, n) { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); }
function entreISO(iso, ini, fin) { return iso >= ini && iso <= fin; }
function rangosSolapan(a1, a2, b1, b2) { return a1 <= b2 && b1 <= a2; }
function añosEntre(iso, hastaISO) {
  const a = parseISO(iso), b = parseISO(hastaISO);
  let años = b.getFullYear() - a.getFullYear();
  const m = b.getMonth() - a.getMonth();
  if (m < 0 || (m === 0 && b.getDate() < a.getDate())) años--;
  return años;
}

// ---- Feriados nacionales de RD · 2026 ----
const FERIADOS_RD = {
  "2026-01-01": "Año Nuevo",
  "2026-01-06": "Día de los Santos Reyes",
  "2026-01-21": "Día de la Altagracia",
  "2026-01-26": "Día de Duarte",
  "2026-02-27": "Día de la Independencia",
  "2026-04-03": "Viernes Santo",
  "2026-05-01": "Día del Trabajo",
  "2026-06-04": "Corpus Christi",
  "2026-08-16": "Día de la Restauración",
  "2026-09-24": "Día de las Mercedes",
  "2026-11-06": "Día de la Constitución",
  "2026-12-25": "Día de Navidad",
};
function esFeriado(iso) { return !!FERIADOS_RD[iso]; }
function nombreFeriado(iso) { return FERIADOS_RD[iso] || null; }

// días hábiles entre dos ISO (inclusive), excluyendo fines de semana y feriados
function diasHabiles(ini, fin) {
  if (!ini || !fin || fin < ini) return 0;
  let n = 0, cur = ini;
  while (cur <= fin) { if (!esFinde(cur) && !esFeriado(cur)) n++; cur = addDias(cur, 1); }
  return n;
}

// ---- Rangos ISO de obras (para detectar conflictos con ausencias) ----
const OBRA_FECHAS = {
  "OB-2401": { ini: "2026-05-26", fin: "2026-06-02" },
  "OB-2403": { ini: "2026-05-24", fin: "2026-05-31" },
  "OB-2405": { ini: "2026-06-05", fin: "2026-06-10" },
  "OB-2402": { ini: "2026-06-03", fin: "2026-06-06" },
  "OB-2406": { ini: "2026-05-20", fin: "2026-06-30" },
};

// ---- Tipos de ausencia ----
const TIPO_AUSENCIA = {
  vacaciones:  { label: "Vacaciones", cls: "badge-blue",   color: "var(--star-blue)",   icon: "sun" },
  permiso:     { label: "Permiso",    cls: "badge-amber",  color: "var(--star-orange)", icon: "clock" },
  enfermedad:  { label: "Enfermedad", cls: "badge-red",    color: "var(--star-red)",    icon: "alert" },
  personal:    { label: "Personal",   cls: "badge-purple", color: "var(--star-purple)", icon: "user" },
  otro:        { label: "Otro",       cls: "badge-gray",   color: "var(--ink-500)",     icon: "calendar" },
};
const AUSENCIA_ESTADO = {
  pendiente: { label: "Pendiente", cls: "badge-amber" },
  aprobada:  { label: "Aprobada",  cls: "badge-green" },
  rechazada: { label: "Rechazada", cls: "badge-red" },
};

// ---- Empleados ----
const EMPLEADOS = [
  { id: "U-1", nombre: "Rafael Estrella", rol: "dueno", cargo: "Gerente General", ingreso: "2015-03-01", salario: 150000, contrato: "Indefinido", cuadrilla: null, color: "#1E7FC2", activo: true },
  { id: "U-2", nombre: "Yokasta Pérez", rol: "secretaria", cargo: "Administradora", ingreso: "2019-08-15", salario: 42000, contrato: "Indefinido", cuadrilla: null, color: "#7B4FA0", activo: true },
  { id: "U-3", nombre: "José Ramírez", rol: "supervisor", cargo: "Supervisor de cuadrilla", ingreso: "2017-06-10", salario: 55000, contrato: "Indefinido", cuadrilla: "CU-1", color: "#3FAE4A", activo: true },
  { id: "U-4", nombre: "Wilkin Suero", rol: "aplicador", cargo: "Aplicador", ingreso: "2021-02-20", salario: 28000, contrato: "Indefinido", cuadrilla: "CU-1", color: "#F2A33A", activo: true },
  { id: "U-6", nombre: "Pedro Núñez", rol: "supervisor", cargo: "Supervisor de cuadrilla", ingreso: "2016-09-12", salario: 54000, contrato: "Indefinido", cuadrilla: "CU-2", color: "#176399", activo: true },
  { id: "U-7", nombre: "Elvis Tavárez", rol: "aplicador", cargo: "Aplicador", ingreso: "2022-07-01", salario: 26000, contrato: "Temporal", cuadrilla: "CU-2", color: "#C2528B", activo: true },
  { id: "U-8", nombre: "Ramón Acosta", rol: "aplicador", cargo: "Aplicador", ingreso: "2020-01-15", salario: 27000, contrato: "Indefinido", cuadrilla: "CU-1", color: "#2A9D8F", activo: true },
  { id: "U-5", nombre: "Frank Disla", rol: "supervisor", cargo: "Aplicador líder", ingreso: "2018-11-05", salario: 32000, contrato: "Indefinido", cuadrilla: "CU-3", color: "#E0392B", activo: false },
];

// ---- Ausencias (semilla) ----
const AUSENCIAS_SEED = [
  { id: "AU-305", empId: "U-6", tipo: "vacaciones", ini: "2026-05-29", fin: "2026-06-03", motivo: "", estado: "aprobada", solicitada: "20 may" },
  { id: "AU-308", empId: "U-3", tipo: "vacaciones", ini: "2026-06-15", fin: "2026-06-19", motivo: "Viaje familiar", estado: "aprobada", solicitada: "22 may" },
  { id: "AU-309", empId: "U-7", tipo: "enfermedad", ini: "2026-06-02", fin: "2026-06-02", motivo: "Cita médica", estado: "aprobada", solicitada: "01 jun" },
  { id: "AU-312", empId: "U-8", tipo: "vacaciones", ini: "2026-06-08", fin: "2026-06-12", motivo: "", estado: "aprobada", solicitada: "21 may" },
  { id: "AU-306", empId: "U-2", tipo: "vacaciones", ini: "2026-05-18", fin: "2026-05-22", motivo: "", estado: "aprobada", solicitada: "05 may" },
  { id: "AU-310", empId: "U-4", tipo: "vacaciones", ini: "2026-06-01", fin: "2026-06-03", motivo: "", estado: "pendiente", solicitada: "30 may" },
  { id: "AU-307", empId: "U-8", tipo: "personal", ini: "2026-06-04", fin: "2026-06-04", motivo: "Trámite en el ayuntamiento", estado: "pendiente", solicitada: "31 may" },
  { id: "AU-311", empId: "U-4", tipo: "permiso", ini: "2026-05-12", fin: "2026-05-12", motivo: "Asunto familiar", estado: "rechazada", motivoRechazo: "La obra estaba en fase crítica esa semana.", solicitada: "08 may" },
];

const COLORS_POOL = ["#1E7FC2", "#7B4FA0", "#3FAE4A", "#F2A33A", "#176399", "#C2528B", "#2A9D8F", "#E0392B", "#6B7280"];

const RHStore = (function () {
  const listeners = new Set();
  function emit() { listeners.forEach((fn) => fn()); }
  const empleados = EMPLEADOS.map((e) => ({ ...e }));
  const ausencias = AUSENCIAS_SEED.map((a) => ({ ...a }));
  let seq = 313;
  let _inicializado = false;

  function mapEmp(u, idx) {
    return {
      id: u.id, nombre: u.nombre ?? "", rol: u.rol ?? "aplicador",
      cargo: u.cargo ?? "", ingreso: u.fecha_ingreso ?? u.ingreso ?? "",
      salario: Number(u.salario ?? 0), contrato: u.tipo_contrato ?? u.contrato ?? "Indefinido",
      cuadrilla: u.cuadrilla_id ?? null,
      color: u.color ?? COLORS_POOL[idx % COLORS_POOL.length], activo: u.activo !== false,
    };
  }
  function mapAus(a) {
    return {
      id: a.id, empId: a.usuario_id ?? a.empId,
      tipo: a.tipo ?? "otro",
      ini: (a.fecha_inicio ?? a.ini ?? "").slice(0, 10),
      fin: (a.fecha_fin ?? a.fin ?? "").slice(0, 10),
      motivo: a.motivo ?? "", estado: a.estado ?? "pendiente",
      motivoRechazo: a.motivo_rechazo ?? a.motivoRechazo ?? null,
      solicitada: (a.created_at ?? a.solicitada ?? "").slice(0, 10),
    };
  }

  function emp(id) { return empleados.find((e) => e.id === id); }

  // Antigüedad y vacaciones (código laboral RD: 14 días tras 1 año, 18 tras 5 años)
  function añosLaborados(e) { return Math.max(0, añosEntre(e.ingreso, RH_HOY)); }
  function derechoVacaciones(e) { const a = añosLaborados(e); return a < 1 ? 0 : a >= 5 ? 18 : 14; }
  function vacacionesTomadas(e) {
    return ausencias.filter((x) => x.empId === e.id && x.tipo === "vacaciones" && x.estado === "aprobada" && x.ini.slice(0, 4) === "2026")
      .reduce((s, x) => s + diasHabiles(x.ini, x.fin), 0);
  }
  function vacacionesDisponibles(e) { return Math.max(0, derechoVacaciones(e) - vacacionesTomadas(e)); }

  // Conflictos: obras activas de la cuadrilla del empleado que solapan el rango
  function conflictos(empId, ini, fin) {
    const e = emp(empId);
    if (!e || !e.cuadrilla) return [];
    const cu = (window.CUADRILLAS || []).find((c) => c.id === e.cuadrilla);
    if (!cu) return [];
    const res = [];
    (cu.obras || []).forEach((oid) => {
      const o = (window.OBRAS || []).find((x) => x.id === oid);
      const r = OBRA_FECHAS[oid];
      if (o && r && ["proceso", "aprobada"].includes(o.estado) && rangosSolapan(ini, fin, r.ini, r.fin || r.ini)) {
        res.push({ obraId: oid, titulo: o.titulo, cuadrilla: cu.nombre });
      }
    });
    return res;
  }
  // ¿este día concreto es conflictivo para una ausencia? (cae en ausencia y en obra activa de su cuadrilla)
  function diaEnConflicto(aus, iso) {
    if (!entreISO(iso, aus.ini, aus.fin)) return false;
    const e = emp(aus.empId);
    if (!e || !e.cuadrilla) return false;
    const cu = (window.CUADRILLAS || []).find((c) => c.id === e.cuadrilla);
    if (!cu) return false;
    return (cu.obras || []).some((oid) => {
      const o = (window.OBRAS || []).find((x) => x.id === oid);
      const r = OBRA_FECHAS[oid];
      return o && r && ["proceso", "aprobada"].includes(o.estado) && entreISO(iso, r.ini, r.fin || r.ini);
    });
  }

  return {
    empleados, ausencias, HOY: RH_HOY,
    TIPO_AUSENCIA, AUSENCIA_ESTADO, FERIADOS_RD, MESES, MESES_CORTO, DIAS_LMV,
    parseISO, toISO, fmtFecha, fmtFechaLarga, esFinde, esFeriado, nombreFeriado, diaSemanaLun, addDias, diasHabiles, entreISO,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    empleado: emp,
    empleadoPorRol(rol) { return empleados.find((e) => e.rol === rol && e.activo) || empleados.find((e) => e.rol === rol); },
    añosLaborados, derechoVacaciones, vacacionesTomadas, vacacionesDisponibles, conflictos, diaEnConflicto,

    ausenciasDe(empId) { return ausencias.filter((a) => a.empId === empId); },
    pendientes() { return ausencias.filter((a) => a.estado === "pendiente"); },
    visibles() { return ausencias.filter((a) => a.estado !== "rechazada"); },

    deVacacionesHoy() {
      return empleados.filter((e) => ausencias.some((a) => a.empId === e.id && a.estado === "aprobada" && a.tipo === "vacaciones" && entreISO(RH_HOY, a.ini, a.fin)));
    },
    proximasSemana() {
      const fin = addDias(RH_HOY, 7);
      return ausencias.filter((a) => a.estado === "aprobada" && a.tipo === "vacaciones" && a.ini > RH_HOY && a.ini <= fin)
        .sort((x, y) => x.ini.localeCompare(y.ini));
    },

    crearAusencia({ empId, tipo, ini, fin, motivo }) {
      const tempId = "AU-" + seq++;
      ausencias.unshift({ id: tempId, empId, tipo, ini, fin, motivo: motivo || "", estado: "pendiente", solicitada: "hoy" });
      emit();
      if (window.KlikaData && KlikaData.conectado()) {
        KlikaData.ausencias.crear({ usuario_id: empId, tipo, fecha_inicio: ini, fecha_fin: fin, motivo: motivo || null })
          .then((res) => {
            const created = mapAus(res.data ?? res);
            const a = ausencias.find((x) => x.id === tempId);
            if (a) { a.id = created.id; emit(); }
          }).catch(() => {});
      }
    },
    aprobar(id) {
      const a = ausencias.find((x) => x.id === id);
      if (a) { a.estado = "aprobada"; emit(); }
      if (window.KlikaData && KlikaData.conectado()) KlikaData.ausencias.aprobar(id).catch(() => {});
    },
    rechazar(id, motivoRechazo) {
      const a = ausencias.find((x) => x.id === id);
      if (a) { a.estado = "rechazada"; a.motivoRechazo = motivoRechazo; emit(); }
      if (window.KlikaData && KlikaData.conectado()) KlikaData.ausencias.rechazar(id, motivoRechazo).catch(() => {});
    },
    editarEmpleado(id, campos) {
      const e = emp(id);
      if (e) { Object.assign(e, campos); emit(); }
      if (window.KlikaData && KlikaData.conectado()) {
        const payload = {};
        if (campos.cargo) payload.cargo = campos.cargo;
        if (campos.salario) payload.salario = campos.salario;
        if (campos.contrato) payload.tipo_contrato = campos.contrato;
        if (campos.ingreso) payload.fecha_ingreso = campos.ingreso;
        KlikaData.empleados.actualizar(id, payload).catch(() => {});
      }
    },

    async inicializar() {
      if (_inicializado || !window.KlikaData || !KlikaData.conectado()) return;
      _inicializado = true;
      try {
        const [empRes, ausRes] = await Promise.all([
          KlikaData.empleados.lista(),
          KlikaData.ausencias.lista({ per_page: 300 }),
        ]);
        const emps = (empRes.data ?? empRes).map((u, i) => mapEmp(u, i));
        const auss = (ausRes.data ?? ausRes).map(mapAus);
        if (emps.length) { empleados.splice(0, empleados.length, ...emps); }
        if (auss.length) { ausencias.splice(0, ausencias.length, ...auss); }
        emit();
      } catch (e) { _inicializado = false; }
    },
  };
})();

function useRHStore() {
  const [, force] = React.useState(0);
  React.useEffect(() => RHStore.subscribe(() => force((n) => n + 1)), []);
  return RHStore;
}

Object.assign(window, { RHStore, useRHStore });
