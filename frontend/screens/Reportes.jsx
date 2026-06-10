/* global React, Icon, OBRAS, money0, KlikaData */
// ============================================================
//  Reportes · finanzas y desempeño (solo dueño)
// ============================================================
const { useState: useStateRp, useEffect: useEffectRp } = React;

function fmtM(n) {
  if (n >= 1e6) return "RD$ " + (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 1e3) return "RD$ " + Math.round(n / 1e3) + "K";
  return money0(n);
}

function Reportes({ role }) {
  const MESES_DEFAULT = [
    { m: "Ene", v: 680 }, { m: "Feb", v: 540 }, { m: "Mar", v: 920 }, { m: "Abr", v: 1100 },
    { m: "May", v: 1340 }, { m: "Jun", v: 760 },
  ];
  const ESTADO_DEFAULT = [
    { e: "Terminadas", n: 8, c: "var(--star-green)" },
    { e: "En proceso", n: 2, c: "var(--star-orange)" },
    { e: "Aprobadas", n: 2, c: "var(--star-blue)" },
    { e: "Cotizadas", n: 1, c: "var(--ink-300)" },
  ];

  const [kpis, setKpis] = useStateRp(null);
  const [meses, setMeses] = useStateRp(MESES_DEFAULT);
  const [porEstado, setPorEstado] = useStateRp(ESTADO_DEFAULT);
  const [topObras, setTopObras] = useStateRp(() => [...OBRAS].sort((a, b) => b.total - a.total).slice(0, 5));

  useEffectRp(() => {
    if (!window.KlikaData || !KlikaData.conectado()) return;
    KlikaData.reportes.rentabilidad().then((res) => {
      const d = res.data ?? res;
      if (d.kpis) setKpis(d.kpis);
      if (d.facturacion_mensual) {
        setMeses(d.facturacion_mensual.map((x) => ({ m: x.mes?.slice(5) ?? x.mes, v: Math.round(Number(x.total ?? 0) / 1000) })));
      }
    }).catch(() => {});
    KlikaData.reportes.resumenObras().then((res) => {
      const d = res.data ?? res;
      if (d.por_estado) {
        const map = { terminada: "var(--star-green)", proceso: "var(--star-orange)", aprobada: "var(--star-blue)", cotizada: "var(--ink-300)", pausada: "var(--amber)", cancelada: "var(--red)" };
        setPorEstado(Object.entries(d.por_estado).map(([k, n]) => ({ e: k, n: Number(n), c: map[k] ?? "var(--ink-300)" })));
      }
      if (d.top_obras) {
        setTopObras(d.top_obras.map((o) => ({ id: o.codigo ?? String(o.id), _id: o.id, titulo: o.titulo ?? "", clienteNom: o.cliente?.nombre ?? "", estado: o.estado ?? "", total: Number(o.total ?? 0) })));
      }
    }).catch(() => {});
  }, []);

  const max = Math.max(...meses.map((x) => x.v), 1);
  const totalEstado = Math.max(porEstado.reduce((a, x) => a + x.n, 0), 1);

  return (
    <div style={rp.page} className="r-page">
      <div style={rp.kpis} className="r-grid4">
        <Kpi label="Facturado (mes)" value={kpis ? fmtM(kpis.facturado_mes) : "RD$ 1.34M"} delta={kpis?.delta_facturado ?? "+18%"} up icon="money" color="var(--star-green)" />
        <Kpi label="Obras cerradas (mes)" value={kpis ? String(kpis.obras_cerradas_mes ?? 6) : "6"} delta={kpis?.delta_obras ?? "+2"} up icon="checkcircle" color="var(--star-blue)" />
        <Kpi label="Ticket promedio" value={kpis ? fmtM(kpis.ticket_promedio) : "RD$ 223K"} delta={kpis?.delta_ticket ?? "+5%"} up icon="quote" color="var(--star-purple)" />
        <Kpi label="Tasa de aprobación" value={kpis ? (kpis.tasa_aprobacion ?? "72") + "%" : "72%"} delta={kpis?.delta_tasa ?? "−4%"} icon="reports" color="var(--star-orange)" />
      </div>

      <div style={rp.cols} className="r-main">
        <section className="card" style={{ padding: 20 }}>
          <div style={rp.cardTitle}>Facturación por mes <span style={{ fontWeight: 500, color: "var(--ink-400)", fontSize: 12.5 }}>· miles RD$</span></div>
          <div style={rp.chart}>
            {meses.map((x) => (
              <div key={x.m} style={rp.barCol}>
                <div style={rp.barTrack}>
                  <div style={{ ...rp.bar, height: (x.v / max * 100) + "%", background: x.m === "May" || x.m === "05" ? "linear-gradient(var(--blue-500),var(--blue-700))" : "var(--ink-200)" }} />
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
              <span style={{ fontSize: 13.5, flex: 1, textTransform: "capitalize" }}>{x.e}</span>
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
            {topObras.map((o) => (
              <tr key={o.id} style={{ borderBottom: "1px solid var(--ink-100)" }}>
                <td style={rp.td}><span className="mono" style={{ fontSize: 12.5, color: "var(--ink-400)" }}>{o.id}</span> · {o.titulo}</td>
                <td style={{ ...rp.td, color: "var(--ink-500)" }}>{o.clienteNom}</td>
                <td style={rp.td}>{window.ESTADOS?.[o.estado] ? <span className={"badge " + window.ESTADOS[o.estado].cls}><span className="dot" />{window.ESTADOS[o.estado].label}</span> : <span style={{ fontSize: 12.5, color: "var(--ink-400)", textTransform: "capitalize" }}>{o.estado}</span>}</td>
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
