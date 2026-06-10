/* global React, Icon, StarMark, KlikaAPI, KlikaData */
// ============================================================
//  Pantalla 11 · Asistente Klika (chat)
// ============================================================
const { useState: useStateK, useRef: useRefK, useEffect: useEffectK } = React;

const SUGERENCIAS = [
  "¿Qué obras debo mover por la lluvia?",
  "Cotiza 120 m² de techo en condición regular",
  "¿Qué materiales están bajo mínimo?",
  "¿Cómo va la obra de Villa Olga?",
];

const RESPUESTAS = {
  default: "Puedo ayudarte con cotizaciones, reprogramar obras por el clima, revisar inventario o consultar el estado de cualquier obra. ¿Qué necesitas?",
  lluvia: "Revisé el clima de junio. El **jueves 11 y viernes 12 están bloqueados** por lluvia. Tienes *Familia Then Polanco* programada el jueves.\n\n👉 Te sugiero moverla al **lunes 15** (día apto) — la Cuadrilla A queda libre. ¿La reprogramo?",
  cotiza: "Para 120 m² de techo en condición **regular** (factor 1.15), con 2 manos de membrana acrílica (rendimiento 9 m²/gal):\n\n• Membrana: (120 × 2 × 1.15) ÷ 9 = **30.7 cubetas**\n• Primer (1 mano): (120 × 1 × 1.15) ÷ 18 = **7.7 cubetas**\n\nMaterial ≈ RD$ 173,500 + mano de obra. ¿Genero la cotización formal?",
  material: "Hay **3 materiales bajo mínimo**:\n\n• Cinta de refuerzo autoadhesiva — 3 / 12\n• Primer / sellador de poros — 9 / 15\n• Malla de refuerzo poliéster — 6 / 10\n\n¿Quieres que prepare una orden de compra?",
  villa: "**Villa Olga · Familia Reyes** (OB-2401) va al **60%**. La Cuadrilla A está en sitio hoy. Terminó el primer y la 1ra mano de membrana; falta la 2da mano y el refuerzo en grietas. Fin estimado: **2 de junio**.",
};

function matchResp(text) {
  const t = text.toLowerCase();
  if (t.includes("lluvia") || t.includes("clima") || t.includes("mov")) return RESPUESTAS.lluvia;
  if (t.includes("cotiz") || t.includes("m²") || t.includes("m2") || t.includes("metro")) return RESPUESTAS.cotiza;
  if (t.includes("material") || t.includes("mínimo") || t.includes("stock") || t.includes("inventario")) return RESPUESTAS.material;
  if (t.includes("villa") || t.includes("olga") || t.includes("obra")) return RESPUESTAS.villa;
  return RESPUESTAS.default;
}

function fmtMsg(s) {
  return s.split("\n").map((line, i) => (
    <div key={i} style={{ minHeight: line ? "auto" : 8 }}
      dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>") }} />
  ));
}

function KlikaPanel({ onClose, onNav, mobile }) {
  const [msgs, setMsgs] = useStateK([
    { from: "klika", text: "¡Hola! Soy **Klika**, tu asistente. Estoy al tanto de tus obras, el clima y el inventario. ¿En qué te ayudo hoy?" },
  ]);
  const [input, setInput] = useStateK("");
  const [typing, setTyping] = useStateK(false);
  const [convId, setConvId] = useStateK(null);
  const endRef = useRefK(null);

  useEffectK(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs, typing]);

  async function send(text) {
    const t = (text ?? input).trim();
    if (!t) return;
    setMsgs((m) => [...m, { from: "user", text: t }]);
    setInput("");
    setTyping(true);

    if (window.KlikaData && KlikaData.conectado()) {
      try {
        const res = await KlikaData.klika.chat(t, convId);
        setTyping(false);
        if (res.conversacion_id) setConvId(res.conversacion_id);
        setMsgs((m) => [...m, { from: "klika", text: res.respuesta ?? matchResp(t) }]);
        return;
      } catch (_) {}
    }

    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "klika", text: matchResp(t) }]);
    }, 850);
  }

  return (
    <>
      {!mobile && <div onClick={onClose} style={kp.overlay} className="fade-in" />}
      <div style={mobile ? kp.drawerMobile : kp.drawer} className={(mobile ? "fade-in" : "fade-up r-klika")}>
        {/* header */}
        <div style={kp.head}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span style={kp.glyph}><StarMark size={28} /></span>
            <div>
              <KlikaWord height={19} color="var(--ink-900)" style={{ display: "block", marginTop: 1 }} />
              <div style={{ fontSize: 12, color: "var(--green-ink)", display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--green)" }} /> En línea
              </div>
            </div>
          </div>
          <button className="btn btn-icon btn-quiet btn-sm" onClick={onClose}><Icon name="x" size={19} /></button>
        </div>

        {/* mensajes */}
        <div style={kp.body}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
              <div style={m.from === "user" ? kp.bubbleUser : kp.bubbleKlika}>{fmtMsg(m.text)}</div>
            </div>
          ))}
          {typing && (
            <div style={{ display: "flex" }}>
              <div style={{ ...kp.bubbleKlika, display: "flex", gap: 4, padding: "14px 16px" }}>
                {[0, 1, 2].map((i) => <span key={i} style={{ ...kp.typingDot, animationDelay: i * 0.15 + "s" }} />)}
              </div>
            </div>
          )}
          {msgs.length <= 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
              {SUGERENCIAS.map((s) => (
                <button key={s} onClick={() => send(s)} style={kp.suggest}>
                  <Icon name="sparkle" size={14} color="var(--blue-600)" /> {s}
                </button>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* input */}
        <div style={kp.inputBar}>
          <button style={kp.attach}><Icon name="paperclip" size={18} color="var(--ink-400)" /></button>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Escríbele a Klika…" style={kp.input} />
          <button onClick={() => send()} style={{ ...kp.sendBtn, opacity: input.trim() ? 1 : .5 }}><Icon name="send" size={18} color="#fff" /></button>
        </div>
      </div>
      <style>{`@keyframes kpb {0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1}}`}</style>
    </>
  );
}

const kp = {
  overlay: { position: "fixed", inset: 0, background: "rgba(20,22,26,.4)", zIndex: 90 },
  drawer: { position: "fixed", top: 0, right: 0, bottom: 0, width: 420, background: "var(--surface)", boxShadow: "var(--sh-pop)",
    zIndex: 91, display: "flex", flexDirection: "column" },
  drawerMobile: { position: "absolute", inset: 0, background: "var(--surface)", zIndex: 91, display: "flex", flexDirection: "column", borderRadius: 36 },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--ink-100)" },
  glyph: { width: 40, height: 40, borderRadius: 11, background: "var(--ink-900)", display: "grid", placeItems: "center" },
  body: { flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 12, background: "var(--bg)" },
  bubbleKlika: { maxWidth: "85%", background: "var(--surface)", border: "1px solid var(--ink-100)", borderRadius: "4px 16px 16px 16px", padding: "12px 15px", fontSize: 14, lineHeight: 1.5, boxShadow: "var(--sh-sm)" },
  bubbleUser: { maxWidth: "85%", background: "var(--blue-600)", color: "#fff", borderRadius: "16px 4px 16px 16px", padding: "12px 15px", fontSize: 14, lineHeight: 1.5 },
  typingDot: { width: 7, height: 7, borderRadius: 99, background: "var(--ink-300)", animation: "kpb 1.1s infinite" },
  suggest: { display: "flex", alignItems: "center", gap: 9, textAlign: "left", padding: "11px 13px", borderRadius: 11, border: "1px solid var(--ink-100)", background: "var(--surface)", fontSize: 13.5, fontWeight: 500, color: "var(--ink-700)", cursor: "pointer" },
  inputBar: { display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderTop: "1px solid var(--ink-100)" },
  attach: { width: 40, height: 40, borderRadius: 10, border: "none", background: "transparent", display: "grid", placeItems: "center", flexShrink: 0 },
  input: { flex: 1, height: 44, border: "1px solid var(--ink-200)", borderRadius: 12, padding: "0 14px", fontSize: 14, outline: "none" },
  sendBtn: { width: 44, height: 44, borderRadius: 12, border: "none", background: "var(--blue-600)", display: "grid", placeItems: "center", flexShrink: 0, transition: "opacity .15s", cursor: "pointer" },
};

window.KlikaPanel = KlikaPanel;
