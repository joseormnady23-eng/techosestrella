/* global React, Icon, OBRAS, money0 */
// ============================================================
//  Reportes · finanzas y desempeño (solo dueño)
// ============================================================
function Reportes({ role }) {
  const meses = [
    { m: "Ene", v: 680 }, { m: "Feb", v: 540 }, { m: "Mar", v: 920 }, { m: "Abr", v: 1100 },
    { m: "May", v: 1340 }, { m: "Jun", v: 760 },
  ];
  const max = Math.max(...meses.map((x) => x.v));
  const porEstado = [
    { e: "Terminadas", n: 8, c: "var(--star-green)" },
    { e: "En proceso", n: 2, c: "var(--star-orange)" },
    { e: "Aprobadas", n: 2, c: "var(--star-blue)" },
    { e: "Cotizadas", n: 1, c: "var(--ink-300)" },
  ];
  const totalEstado = porEstado.reduce((a, x) => a + x.n, 0);

  return (
    <div style={rp.page} className="r-page">
      <div style={rp.kpis} className="r-grid4">
        <Kpi label="Facturado (mayo)" value="RD$ 1.34M" delta="+18%" up icon="money" color="var(--star-green)" />
        <Kpi label="Obras cerradas (mes)" value="6" delta="+2" up icon="checkcircle" color="var(--star-blue)" />
        <Kpi label="Ticket promedio" value="RD$ 223K" delta="+5%" up icon="quote" color="var(--star-purple)" />
        <Kpi label="Tasa de aprobación" value="72%" delta="−4%" icon="reports" color="var(--star-orange)" />
      </div>

      <div style={rp.cols} className="r-main">
        <section className="card" style={{ padding: 20 }}>
          <div style={rp.cardTitle}>Facturación por mes <span style={{ fontWeight: 500, color: "var(--ink-400)", fontSize: 12.5 }}>· miles RD$</span></div>
          <div style={rp.chart}>
            {meses.map((x) => (
              <div key={x.m} style={rp.barCol}>
                <div style={rp.barTrack}>
                  <div style={{ ...rp.bar, height: (x.v / max * 100) + "%", background: x.m === "May" ? "linear-gradient(var(--blue-500),var(--blue-700))" : "var(--ink-200)" }} />
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-400)", marginTop: 8, fontWeight: 600 }}>{x.m}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: 20 }}>
          <div style={rp.cardTitle}>Obras por estado</div>
          <div style={{ display: "flex", height: 14, borderRadius: 99, overflow: "hidden", margin: "14px 0 18px" }}>
            {porEstado.map((x) => <div key={x.e} style={{ width: (x.n / totalEstado * 100) + "%", background: x.c }} />)}
          </div>
          {porEstado.map((x) => (
            <div key={x.e} style={rp.legendRow}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: x.c }} />
              <span style={{ fontSize: 13.5, flex: 1 }}>{x.e}</span>
              <span style={{ fontWeight: 700, fontSize: 13.5 }} className="tnum">{x.n}</span>
            </div>
          ))}
        </section>
      </div>

      <section className="card r-tcard" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ ...rp.cardTitle, padding: "16px 20px 0" }}>Obras de mayor valor</div>
        <table style={rp.table} className="r-table">
          <thead><tr><th style={rp.th}>Obra</th><th style={rp.th}>Cliente</th><th style={rp.th}>Estado</th><th style={{ ...rp.th, textAlign: "right" }}>Monto</th></tr></thead>
          <tbody>
            {[...OBRAS].sort((a, b) => b.total - a.total).slice(0, 5).map((o) => (
              <tr key={o.id} style={{ borderBottom: "1px solid var(--ink-100)" }}>
                <td style={rp.td}><span className="mono" style={{ fontSize: 12.5, color: "var(--ink-400)" }}>{o.id}</span> · {o.titulo}</td>
                <td style={{ ...rp.td, color: "var(--ink-500)" }}>{o.clienteNom}</td>
                <td style={rp.td}><span className={"badge " + window.ESTADOS[o.estado].cls}><span className="dot" />{window.ESTADOS[o.estado].label}</span></td>
                <td style={{ ...rp.td, textAlign: "right", fontWeight: 700 }} className="tnum">{money0(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Kpi({ label, value, delta, up, icon, color }) {
  return (
    <div className="card" style={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "1A", display: "grid", placeItems: "center" }}><Icon name={icon} size={19} color={color} /></div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: up ? "var(--green-ink)" : "var(--red-ink)" }}>
          <Icon name={up ? "arrowup" : "arrowdown"} size={13} /> {delta}
        </span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 12, letterSpacing: "-.4px" }} className="tnum">{value}</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 2, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

const rp = {
  page: { padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 1320, margin: "0 auto" },
  kpis: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 },
  cols: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 },
  cardTitle: { fontWeight: 700, fontSize: 15 },
  chart: { display: "flex", alignItems: "flex-end", gap: 16, height: 200, marginTop: 18 },
  barCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" },
  barTrack: { flex: 1, width: "100%", maxWidth: 48, display: "flex", alignItems: "flex-end" },
  bar: { width: "100%", borderRadius: "7px 7px 0 0", minHeight: 4 },
  legendRow: { display: "flex", alignItems: "center", gap: 10, padding: "7px 0" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 12 },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: ".4px", padding: "11px 20px", borderBottom: "1px solid var(--ink-100)", background: "var(--surface-2)" },
  td: { padding: "12px 20px", fontSize: 13.5 },
};

window.Reportes = Reportes;
