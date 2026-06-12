/* global React, Icon, StarMark, KlikaAPI, KlikaData */
// ============================================================
//  Pantalla 11 · Asistente Klika (chat)
// ============================================================
const { useState: useStateK, useRef: useRefK, useEffect: useEffectK } = React;

const SUGERENCIAS_POR_ROL = {
  dueno: [
    "¿Cómo van las finanzas del mes?",
    "¿Qué obras debo mover por la lluvia?",
    "¿Qué materiales están bajo mínimo?",
    "Muéstrame el estado de todas las obras",
  ],
  secretaria: [
    "¿Qué obras están en proceso ahora?",
    "¿Qué cotizaciones están pendientes?",
    "¿Qué materiales están bajo mínimo?",
    "¿Cómo está el clima para esta semana?",
  ],
  supervisor: [
    "¿Cómo están las cuadrillas hoy?",
    "¿Qué obras debo mover por la lluvia?",
    "¿Qué materiales están bajo mínimo?",
    "Muéstrame el estado de todas las obras",
  ],
  aplicador: [
    "¿Cuáles obras están en proceso?",
    "¿Cómo está el clima esta semana?",
  ],
  default: [
    "¿Qué obras están en proceso?",
    "¿Qué materiales están bajo mínimo?",
    "¿Cómo está el clima esta semana?",
    "¿Qué cotizaciones están pendientes?",
  ],
};

function getSugerencias() {
  const rol = window.__klikaUser?.rol;
  return SUGERENCIAS_POR_ROL[rol] ?? SUGERENCIAS_POR_ROL.default;
}

const RESPUESTA_OFFLINE = "Klika no está disponible en este momento. Verifica la conexión al servidor y vuelve a intentarlo.";

function fmtMsg(s) {
  return s.split("\n").map((line, i) => {
    let style = { minHeight: line ? "auto" : 6 };
    let html = line;

    const h3 = html.match(/^###\s+(.+)/);
    const h2 = html.match(/^##\s+(.+)/);
    const h1 = html.match(/^#\s+(.+)/);
    if (h3) {
      html = h3[1];
      style = { fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-400)", marginTop: 12, marginBottom: 2 };
    } else if (h2) {
      html = h2[1];
      style = { fontWeight: 700, fontSize: 13.5, marginTop: 10, marginBottom: 2 };
    } else if (h1) {
      html = h1[1];
      style = { fontWeight: 700, fontSize: 14, marginTop: 8, marginBottom: 2 };
    }

    const bullet = html.match(/^[-*]\s+(.+)/);
    if (bullet) { html = "• " + bullet[1]; style = { ...style, paddingLeft: 2 }; }

    html = html
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

    return <div key={i} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
  });
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

    try {
      const res = await KlikaData.klika.chat(t, convId);
      setTyping(false);
      if (res.conversacion_id) setConvId(res.conversacion_id);
      setMsgs((m) => [...m, { from: "klika", text: res.respuesta || RESPUESTA_OFFLINE }]);
    } catch (_) {
      setTyping(false);
      setMsgs((m) => [...m, { from: "klika", text: RESPUESTA_OFFLINE }]);
    }
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
              {getSugerencias().map((s) => (
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
