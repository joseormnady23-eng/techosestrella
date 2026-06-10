/* global React, Icon, FACTURAS, GASTOS, TIPO_NCF, facturaCalc, money, money0 */
// ============================================================
//  CONTABILIDAD · Reportes DGII (606 compras · 607 ventas)
// ============================================================
const { useState: useStateR } = React;

const PERIODOS = [
  { v: "2026-05", label: "Mayo 2026" },
  { v: "2026-04", label: "Abril 2026" },
  { v: "2026-06", label: "Junio 2026" },
];

function ReportesDGII({ role }) {
  const [tab, setTab] = useStateR("607");
  const [periodo, setPeriodo] = useStateR("2026-05");

  const facturas = window.FACTURAS.filter((f) => (f.fechaISO || "").slice(0, 7) === periodo && !f.anulada && f.ncf);
  const gastos = window.GASTOS.filter((g) => (g.fechaISO || "").slice(0, 7) === periodo);

  // 607 — ventas
  const ventas = facturas.map((f) => {
    const c = facturaCalc(f);
    return { rnc: f.rnc || "Consumidor final", tipoId: f.rnc ? "RNC" : "—", ncf: f.ncf, tipo: f.tipo, fecha: f.fecha, base: c.base, itbis: c.itbis, total: c.total };
  });
  const v607 = {
    base: ventas.reduce((a, r) => a + r.base, 0),
    itbis: ventas.reduce((a, r) => a + r.itbis, 0),
    total: ventas.reduce((a, r) => a + r.total, 0),
    n: ventas.length,
  };

  // 606 — compras
  const compras = gastos.map((g) => ({ rnc: g.rncProv || "Sin RNC", ncf: g.ncfProv || "—", tipo: g.tipoNcf, fecha: g.fecha, proveedor: g.proveedor, base: g.monto - g.itbis, itbis: g.itbis, total: g.monto }));
  const c606 = {
    base: compras.reduce((a, r) => a + r.base, 0),
    itbis: compras.reduce((a, r) => a + r.itbis, 0),
    total: compras.reduce((a, r) => a + r.total, 0),
    n: compras.length,
  };

  const itbisXpagar = v607.itbis - c606.itbis;
  const data = tab === "607" ? ventas : compras;
  const sum = tab === "607" ? v607 : c606;

  return (
    <div style={rpd.page} className="r-page">
      {/* Header: tabs + periodo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={rpd.tabs}>
          <button onClick={() => setTab("607")} style={{ ...rpd.tab, ...(tab === "607" ? rpd.tabOn : {}) }}>
            <span style={{ fontWeight: 800 }}>607</span> Ventas
          </button>
          <button onClick={() => setTab("606")} style={{ ...rpd.tab, ...(tab === "606" ? rpd.tabOn : {}) }}>
            <span style={{ fontWeight: 800 }}>606</span> Compras
          </button>
        </div>
        <select className="input input-sm" value={periodo} onChange={(e) => setPeriodo(e.target.value)} style={{ width: "auto", minWidth: 160 }}>
          {PERIODOS.map((p) => <option key={p.v} value={p.v}>{p.label}</option>)}
        </select>
        <button className="btn btn-ghost" style={{ marginLeft: "auto" }}><Icon name="download" size={16} /> Descargar .txt</button>
      </div>

      {/* Resumen */}
      <div style={rpd.cards} className="r-grid4">
        <RCard label={tab === "607" ? "Facturas emitidas" : "Comprobantes de compra"} value={String(sum.n)} sub={tab === "607" ? "reporte 607" : "reporte 606"} />
        <RCard label="Base imponible" value={money0(sum.base)} sub="monto gravado" />
        <RCard label={tab === "607" ? "ITBIS cobrado" : "ITBIS pagado"} value={money0(sum.itbis)} sub="18%" accent />
        <RCard label="ITBIS a pagar (mes)" value={money0(itbisXpagar)} sub="607 − 606" warn={itbisXpagar > 0} />
      </div>

      {/* Tabla del reporte */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={rpd.cardHead}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Icon name="bank" size={18} color="var(--ink-500)" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>{tab === "607" ? "607 · Ventas de bienes y servicios" : "606 · Compras de bienes y servicios"}</span>
          </div>
          <span style={{ fontSize: 12.5, color: "var(--ink-400)" }}>{PERIODOS.find((p) => p.v === periodo)?.label}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={rpd.table}>
            <thead>
              <tr>
                <th style={rpd.th}>{tab === "607" ? "RNC / Cédula comprador" : "RNC proveedor"}</th>
                {tab === "606" && <th style={rpd.th}>Proveedor</th>}
                <th style={rpd.th}>NCF</th>
                <th style={{ ...rpd.th, textAlign: "center" }}>Tipo</th>
                <th style={rpd.th}>Fecha</th>
                <th style={{ ...rpd.th, textAlign: "right" }}>Base</th>
                <th style={{ ...rpd.th, textAlign: "right" }}>ITBIS</th>
                <th style={{ ...rpd.th, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--ink-100)" }}>
                  <td style={rpd.td}><span className="mono" style={{ fontSize: 12.5 }}>{r.rnc}</span></td>
                  {tab === "606" && <td style={{ ...rpd.td, fontWeight: 600 }}>{r.proveedor}</td>}
                  <td style={rpd.td}><span className="mono" style={{ fontSize: 12.5 }}>{r.ncf}</span></td>
                  <td style={{ ...rpd.td, textAlign: "center" }}><span className={"badge " + TIPO_NCF[r.tipo].cls} style={{ height: 20, fontSize: 10.5 }}>{TIPO_NCF[r.tipo].short}</span></td>
                  <td style={{ ...rpd.td, color: "var(--ink-500)", whiteSpace: "nowrap" }}>{r.fecha}</td>
                  <td style={{ ...rpd.td, textAlign: "right" }} className="tnum">{money0(r.base)}</td>
                  <td style={{ ...rpd.td, textAlign: "right", color: "var(--ink-500)" }} className="tnum">{money0(r.itbis)}</td>
                  <td style={{ ...rpd.td, textAlign: "right", fontWeight: 700 }} className="tnum">{money0(r.total)}</td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={tab === "606" ? 8 : 7} style={{ ...rpd.td, textAlign: "center", color: "var(--ink-400)", padding: "28px" }}>Sin registros en este periodo.</td></tr>}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--surface-2)" }}>
                <td style={{ ...rpd.td, fontWeight: 700 }} colSpan={tab === "606" ? 4 : 3}>Totales</td>
                <td style={rpd.td}></td>
                <td style={{ ...rpd.td, textAlign: "right", fontWeight: 800 }} className="tnum">{money0(sum.base)}</td>
                <td style={{ ...rpd.td, textAlign: "right", fontWeight: 800, color: "var(--blue-700)" }} className="tnum">{money0(sum.itbis)}</td>
                <td style={{ ...rpd.td, textAlign: "right", fontWeight: 800 }} className="tnum">{money0(sum.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div style={rpd.note}>
        <Icon name="alert" size={15} color="var(--ink-400)" />
        <span>El archivo <strong>.txt</strong> se genera con el formato oficial de la DGII para subirlo manualmente en la Oficina Virtual. Fecha límite de envío: día 15 del mes siguiente.</span>
      </div>
    </div>
  );
}

function RCard({ label, value, sub, accent, warn }) {
  return (
    <div className="card" style={{ padding: "16px 18px" }}>
      <div style={{ fontSize: 12.5, color: "var(--ink-400)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.6px", marginTop: 6, color: warn ? "var(--red)" : accent ? "var(--blue-700)" : "var(--ink-900)" }} className="tnum">{value}</div>
      <div style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

const rpd = {
  page: { padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 1320, margin: "0 auto" },
  tabs: { display: "inline-flex", background: "var(--ink-100)", borderRadius: 10, padding: 4, gap: 3 },
  tab: { display: "inline-flex", alignItems: "center", gap: 7, border: "none", background: "transparent", padding: "8px 16px", borderRadius: 7, fontSize: 13.5, fontWeight: 600, color: "var(--ink-500)" },
  tabOn: { background: "var(--surface)", color: "var(--ink-900)", boxShadow: "var(--sh-sm)" },
  cards: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 },
  cardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--ink-100)" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 760 },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".4px", padding: "12px 14px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)", whiteSpace: "nowrap" },
  td: { padding: "11px 14px", fontSize: 13.5, verticalAlign: "middle" },
  note: { display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--ink-500)", padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--ink-100)", borderRadius: 10, lineHeight: 1.4 },
};

Object.assign(window, { ReportesDGII });
