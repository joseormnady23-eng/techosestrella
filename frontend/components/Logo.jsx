/* global React */
// ============================================================
//  Marca · Techos Estrella (logo geométrico) + Klika (software)
//  Interpretación original: estrella de 5 puntas en los colores
//  del logo + casita azul con techo rojo.
// ============================================================

// --- Estrella de 5 puntas formada por 5 segmentos de color ---
function StarMark({ size = 38 }) {
  const colors = ["#E0392B", "#F2A33A", "#3FAE4A", "#1E7FC2", "#7B4FA0"];
  const cx = 50, cy = 52, R = 46, r = 18;
  // 5 puntas, cada una su color
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const aOut = (-90 + i * 72) * Math.PI / 180;
    const aIn1 = (-90 + i * 72 - 36) * Math.PI / 180;
    const aIn2 = (-90 + i * 72 + 36) * Math.PI / 180;
    pts.push({
      out: [cx + R * Math.cos(aOut), cy + R * Math.sin(aOut)],
      in1: [cx + r * Math.cos(aIn1), cy + r * Math.sin(aIn1)],
      in2: [cx + r * Math.cos(aIn2), cy + r * Math.sin(aIn2)],
      color: colors[i],
    });
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {pts.map((p, i) => (
        <path
          key={i}
          d={`M ${p.in1[0]} ${p.in1[1]} L ${p.out[0]} ${p.out[1]} L ${p.in2[0]} ${p.in2[1]} L ${cx} ${cy} Z`}
          fill={p.color}
          stroke="#fff" strokeWidth="2" strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

// --- Casita azul con techo rojo ---
function HouseMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M50 14 L86 44 L14 44 Z" fill="#E0392B" />
      <rect x="24" y="44" width="52" height="40" rx="4" fill="#1E7FC2" />
      <rect x="43" y="58" width="14" height="26" rx="2" fill="#fff" opacity=".92" />
    </svg>
  );
}

// Logo completo Techos Estrella (para login / portal cliente)
function TechosLogo({ scale = 1, dark = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 * scale }}>
      <div style={{ position: "relative", width: 56 * scale, height: 56 * scale }}>
        <div style={{ position: "absolute", inset: 0 }}><StarMark size={56 * scale} /></div>
        <div style={{ position: "absolute", right: -6 * scale, bottom: -4 * scale,
          background: "#fff", borderRadius: 10 * scale, padding: 3 * scale, boxShadow: "0 2px 6px rgba(0,0,0,.18)" }}>
          <HouseMark size={22 * scale} />
        </div>
      </div>
      <div style={{ lineHeight: 1.05 }}>
        <div style={{ fontWeight: 800, letterSpacing: ".5px", fontSize: 18 * scale,
          color: dark ? "#fff" : "var(--ink-900)" }}>
          TECHOS <span style={{ color: "var(--star-orange)" }}>ESTRELLA</span>
        </div>
        <div style={{ fontSize: 9.5 * scale, letterSpacing: "3.5px", fontWeight: 700,
          color: dark ? "var(--ink-300)" : "var(--ink-400)", marginTop: 2 * scale }}>
          IMPERMEABILIZANTES
        </div>
      </div>
    </div>
  );
}

// --- Wordmark "Klika IA" (SVG del cliente, recortado al contenido) ---
// "Klika" en azul claro, punto de la i en rojo, "IA" en degradado azul navy -> gris.
function KlikaWord({ height = 22, style }) {
  const w = height * (799 / 173);
  const gid = React.useId().replace(/:/g, "");
  const AZUL = "#2E96D8";   // azul claro predominante
  const ROJO = "#E0392B";   // punto de la i
  return (
    <svg height={height} width={w} viewBox="610 916 799 173" style={style} aria-label="Klika IA" role="img">
      <defs>
        {/* navy -> gris, a lo ancho de "IA" (coords en unidades de path) */}
        <linearGradient id={"ia" + gid} gradientUnits="userSpaceOnUse" x1="12060" y1="0" x2="13720" y2="0">
          <stop offset="0" stopColor="#27508C"/>
          <stop offset="1" stopColor="#A6ADB6"/>
        </linearGradient>
      </defs>
      <g transform="translate(0,2000) scale(0.1,-0.1)" stroke="none">
        {/* l */}
        <path fill={AZUL} d="M7540 9985 l0 -815 155 0 155 0 0 815 0 815 -155 0 -155 0 0 -815z"/>
        {/* punto de la i — rojo */}
        <path fill={ROJO} d="M8291 10790 c-51 -12 -84 -42 -100 -89 -17 -54 -7 -122 24 -159 57 -68 207 -68 272 0 23 24 28 39 31 97 4 64 2 70 -27 103 -44 50 -117 68 -200 48z"/>
        {/* k */}
        <path fill={AZUL} d="M8850 9985 l0 -815 155 0 155 0 0 183 0 182 57 45 c31 25 64 50 73 57 14 10 39 -20 186 -228 l169 -239 178 0 c97 0 177 2 177 5 0 3 -106 147 -236 322 -130 174 -238 322 -241 329 -3 7 88 114 204 241 114 126 217 239 227 251 l19 22 -175 0 -175 0 -170 -187 c-94 -104 -198 -223 -232 -265 -34 -43 -62 -78 -64 -78 -1 0 0 223 2 495 l3 495 -156 0 -156 0 0 -815z"/>
        {/* A — degradado IA */}
        <path fill={`url(#ia${gid})`} d="M13117 10703 c-7 -11 -537 -1519 -537 -1527 0 -3 78 -6 173 -6 l172 0 55 183 55 182 278 3 c257 2 278 1 285 -15 3 -10 29 -92 57 -183 l51 -165 172 -3 c95 -1 172 1 172 5 0 5 -121 350 -269 768 l-268 760 -196 3 c-107 1 -198 -1 -200 -5z m306 -585 l94 -308 -199 0 c-185 0 -199 1 -194 18 3 9 39 127 80 262 40 135 82 274 92 309 13 50 19 60 25 45 4 -10 50 -157 102 -326z"/>
        {/* K */}
        <path fill={AZUL} d="M6140 9935 l0 -765 160 0 160 0 0 275 0 274 58 42 c31 23 62 46 68 51 8 6 75 -94 214 -317 l203 -325 179 0 c177 0 179 0 168 20 -6 12 -124 199 -262 418 -138 218 -253 402 -255 409 -3 7 113 161 256 342 144 182 261 333 261 336 0 3 -78 5 -172 5 l-173 0 -206 -258 c-113 -141 -234 -298 -270 -349 l-64 -92 -3 350 -2 349 -160 0 -160 0 0 -765z"/>
        {/* I — degradado IA */}
        <path fill={`url(#ia${gid})`} d="M12060 9935 l0 -765 160 0 160 0 0 765 0 765 -160 0 -160 0 0 -765z"/>
        {/* a */}
        <path fill={AZUL} d="M10485 10346 c-126 -25 -265 -75 -265 -96 0 -8 86 -188 95 -198 1 -1 22 6 47 17 75 32 208 61 281 61 122 0 187 -61 187 -178 l0 -51 -42 -5 c-24 -3 -99 -7 -168 -10 -382 -13 -547 -153 -509 -430 18 -136 88 -236 192 -274 77 -29 197 -37 283 -19 94 20 146 48 211 113 30 30 57 54 61 54 4 0 20 -36 37 -80 l29 -80 108 0 109 0 -3 453 -3 452 -28 60 c-47 100 -113 156 -229 196 -80 27 -287 35 -393 15z m345 -698 c0 -92 -12 -133 -51 -181 -42 -50 -100 -79 -176 -85 -113 -9 -175 40 -175 136 1 125 76 178 272 192 58 4 111 8 118 8 8 2 12 -18 12 -70z"/>
        {/* cuerpo de la i */}
        <path fill={AZUL} d="M8200 9755 l0 -585 155 0 155 0 0 585 0 585 -155 0 -155 0 0 -585z"/>
      </g>
    </svg>
  );
}

// Marca Klika (software) — estrella + wordmark; usada en el sidebar
function KlikaMark({ light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <div style={{ position: "relative", width: 34, height: 34, flexShrink: 0 }}>
        <StarMark size={34} />
      </div>
      <div style={{ lineHeight: 1 }}>
        <KlikaWord height={23} colorful style={{ display: "block" }} />
        <div style={{ fontSize: 9.5, letterSpacing: "1.6px", fontWeight: 700, marginTop: 6,
          color: light ? "var(--ink-300)" : "var(--ink-400)" }}>
          TECHOS ESTRELLA
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StarMark, HouseMark, TechosLogo, KlikaMark, KlikaWord });
