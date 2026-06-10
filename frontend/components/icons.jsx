/* global React */
// ============================================================
//  Iconos · línea fina consistente (stroke 1.7), 24x24 grid
// ============================================================
function Icon({ name, size = 20, stroke = 1.7, color = "currentColor", style }) {
  const P = { fill: "none", stroke: color, strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" {...P}/><rect x="14" y="3" width="7" height="5" rx="1.5" {...P}/><rect x="14" y="12" width="7" height="9" rx="1.5" {...P}/><rect x="3" y="16" width="7" height="5" rx="1.5" {...P}/></>,
    roof: <><path d="M3 11 L12 4 L21 11" {...P}/><path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" {...P}/><path d="M3.5 14.5 L20.5 14.5" {...P}/></>,
    quote: <><path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" {...P}/><path d="M13 3v5h5" {...P}/><path d="M8.5 13h7M8.5 16.5h7M8.5 9.5h2" {...P}/></>,
    calendar: <><rect x="3" y="4.5" width="18" height="16" rx="2" {...P}/><path d="M3 9h18M8 2.5v4M16 2.5v4" {...P}/></>,
    inventory: <><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5Z" {...P}/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" {...P}/></>,
    crews: <><circle cx="9" cy="8" r="3" {...P}/><path d="M3.5 20a5.5 5.5 0 0 1 11 0" {...P}/><path d="M16 5.5a3 3 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-3-4.9" {...P}/></>,
    clients: <><circle cx="12" cy="8" r="3.4" {...P}/><path d="M5 20a7 7 0 0 1 14 0" {...P}/></>,
    klika: <><path d="M12 3l1.9 4.7L19 9l-4.2 2.4L14 17l-2-3.5L8 17l.2-5.6L4 9l5.1-1.3Z" {...P}/></>,
    reports: <><path d="M4 20V4" {...P}/><path d="M4 20h16" {...P}/><rect x="7" y="11" width="3" height="6" rx="1" {...P}/><rect x="12" y="7" width="3" height="10" rx="1" {...P}/><rect x="17" y="13" width="3" height="4" rx="1" {...P}/></>,
    settings: <><circle cx="12" cy="12" r="3" {...P}/><path d="M19.4 13a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V19a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 13H4.5a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V2a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.1a2 2 0 1 1 0 4Z" {...P}/></>,
    search: <><circle cx="11" cy="11" r="7" {...P}/><path d="m20 20-3.2-3.2" {...P}/></>,
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Z" {...P}/><path d="M13.7 21a2 2 0 0 1-3.4 0" {...P}/></>,
    plus: <><path d="M12 5v14M5 12h14" {...P}/></>,
    minus: <><path d="M5 12h14" {...P}/></>,
    filter: <><path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" {...P}/></>,
    chevdown: <><path d="m6 9 6 6 6-6" {...P}/></>,
    chevright: <><path d="m9 6 6 6-6 6" {...P}/></>,
    chevleft: <><path d="m15 6-6 6 6 6" {...P}/></>,
    check: <><path d="M20 6 9 17l-5-5" {...P}/></>,
    checkcircle: <><circle cx="12" cy="12" r="9" {...P}/><path d="m8.5 12 2.5 2.5 4.5-5" {...P}/></>,
    x: <><path d="M18 6 6 18M6 6l12 12" {...P}/></>,
    location: <><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" {...P}/><circle cx="12" cy="10" r="2.5" {...P}/></>,
    camera: <><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2L8 4.5h8L17.5 7h2A1.5 1.5 0 0 1 21 8.5v10A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5Z" {...P}/><circle cx="12" cy="13" r="3.5" {...P}/></>,
    sun: <><circle cx="12" cy="12" r="4" {...P}/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" {...P}/></>,
    cloud: <><path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17.5 11 3.5 3.5 0 0 1 17 18Z" {...P}/></>,
    rain: <><path d="M7 15a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17.5 8 3.5 3.5 0 0 1 17 15" {...P}/><path d="M8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5" {...P}/></>,
    phone: <><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5L19 12l4 1.5V17a2 2 0 0 1-2.2 2A16 16 0 0 1 5 6.2 2 2 0 0 1 7 4" {...P} transform="translate(-1 0)"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" {...P}/><path d="m3.5 7 8.5 6 8.5-6" {...P}/></>,
    whatsapp: <><path d="M4 20l1.3-4A7.5 7.5 0 1 1 9 19.3Z" {...P}/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.4 1-.7l-1.6-1-1 .8c-1-.5-1.8-1.3-2.3-2.3l.8-1-1-1.6c-.3 0-.7.4-.7 1Z" fill={color} stroke="none"/></>,
    download: <><path d="M12 4v11M7 11l5 5 5-5M5 20h14" {...P}/></>,
    send: <><path d="M21 3 3 10.5l7 2 2 7L21 3Z" {...P}/><path d="m10 12.5 4-4" {...P}/></>,
    edit: <><path d="M4 20h4L19 9l-4-4L4 16Z" {...P}/><path d="m14.5 5.5 4 4" {...P}/></>,
    trash: <><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" {...P}/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" {...P}/><circle cx="12" cy="12" r="3" {...P}/></>,
    eyeoff: <><path d="M3 3l18 18" {...P}/><path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-3.2 3.8M6.2 7.2A16 16 0 0 0 2 12s3.5 6 10 6a9.6 9.6 0 0 0 4-.9" {...P}/><path d="M9.5 10.5a3 3 0 0 0 4 4" {...P}/></>,
    money: <><rect x="2.5" y="6" width="19" height="12" rx="2" {...P}/><circle cx="12" cy="12" r="2.5" {...P}/><path d="M6 9.5v5M18 9.5v5" {...P}/></>,
    clock: <><circle cx="12" cy="12" r="8.5" {...P}/><path d="M12 7.5V12l3 2" {...P}/></>,
    alert: <><path d="M12 3 2.5 19.5h19L12 3Z" {...P}/><path d="M12 9.5v4M12 16.5v.5" {...P}/></>,
    arrowup: <><path d="M12 19V5M6 11l6-6 6 6" {...P}/></>,
    arrowdown: <><path d="M12 5v14M6 13l6 6 6-6" {...P}/></>,
    swap: <><path d="M7 4 3.5 7.5 7 11M3.5 7.5H17M17 20l3.5-3.5L17 13M20.5 16.5H7" {...P}/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" {...P}/></>,
    logout: <><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 17l5-5-5-5M21 12H9" {...P}/></>,
    layers: <><path d="M12 3 3 8l9 5 9-5-9-5Z" {...P}/><path d="m3 13 9 5 9-5M3 18l9 5 9-5" {...P} opacity=".5"/></>,
    ruler: <><rect x="3" y="8" width="18" height="8" rx="1.5" transform="rotate(0 12 12)" {...P}/><path d="M7 8v3M11 8v4M15 8v3M19 8v4" {...P}/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" {...P}/><rect x="14" y="3" width="7" height="7" rx="1.5" {...P}/><rect x="3" y="14" width="7" height="7" rx="1.5" {...P}/><rect x="14" y="14" width="7" height="7" rx="1.5" {...P}/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" {...P}/></>,
    shield: <><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6Z" {...P}/><path d="m9 12 2 2 4-4.5" {...P}/></>,
    truck: <><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h9A1.5 1.5 0 0 1 15 6.5V16H3Z" {...P}/><path d="M15 9h3.5L21 12.5V16h-6Z" {...P}/><circle cx="7" cy="18" r="1.8" {...P}/><circle cx="17.5" cy="18" r="1.8" {...P}/></>,
    user: <><circle cx="12" cy="8" r="3.6" {...P}/><path d="M5 20a7 7 0 0 1 14 0" {...P}/></>,
    paperclip: <><path d="M20 11.5 12 19.5a5 5 0 0 1-7-7l8-8a3.3 3.3 0 0 1 4.7 4.7l-8 8a1.7 1.7 0 0 1-2.4-2.4l7-7" {...P}/></>,
    sparkle: <><path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6Z" {...P}/><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z" {...P}/></>,
    receipt: <><path d="M6 2.5h12a1 1 0 0 1 1 1V21l-2.2-1.4L14.6 21l-2.6-1.6L9.4 21l-2.2-1.4L5 21V3.5a1 1 0 0 1 1-1Z" {...P}/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" {...P}/></>,
    wallet: <><path d="M3 7.5A2 2 0 0 1 5 5.5h12.5a1.5 1.5 0 0 1 1.5 1.5V9" {...P}/><path d="M3 7.5V18a2 2 0 0 0 2 2h13a1.5 1.5 0 0 0 1.5-1.5V11a1.5 1.5 0 0 0-1.5-1.5H5a2 2 0 0 1-2-2Z" {...P}/><circle cx="16" cy="14" r="1.4" fill={color} stroke="none"/></>,
    bank: <><path d="M3.5 9.5 12 4l8.5 5.5" {...P}/><path d="M5 9.5v8M9 9.5v8M15 9.5v8M19 9.5v8" {...P}/><path d="M3 20.5h18M4 9.5h16" {...P}/></>,
    hash: <><path d="M9 4 7 20M17 4l-2 16M4.5 9h15M3.5 15h15" {...P}/></>,
    barcode: <><path d="M4 6v12M6.6 6v12M9 6v12M11.4 6v12M14 6v12M16.6 6v12M20 6v12" {...P}/></>,
    scan: <><path d="M4 8V6.5A2.5 2.5 0 0 1 6.5 4H8M16 4h1.5A2.5 2.5 0 0 1 20 6.5V8M20 16v1.5a2.5 2.5 0 0 1-2.5 2.5H16M8 20H6.5A2.5 2.5 0 0 1 4 17.5V16" {...P}/><path d="M3.5 12h17" {...P}/></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2.2" {...P}/><path d="M5 15H4.2A1.2 1.2 0 0 1 3 13.8V4.2A1.2 1.2 0 0 1 4.2 3h9.6A1.2 1.2 0 0 1 15 4.2V5" {...P}/></>,
    printer: <><path d="M7 9V3.5h10V9" {...P}/><path d="M5 9h14a2 2 0 0 1 2 2v5h-4v4H7v-4H3v-5a2 2 0 0 1 2-2Z" {...P}/><path d="M7.5 13.5h9" {...P}/></>,
    inbox: <><path d="M3.5 13.5 6 6.5a2 2 0 0 1 1.9-1.3h8.2A2 2 0 0 1 18 6.5l2.5 7" {...P}/><path d="M3.5 13.5H8a1 1 0 0 1 1 1 2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 1 1 0 0 1 1-1h4.5v4a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2Z" {...P}/></>,
    hr: <><circle cx="9" cy="8" r="3" {...P}/><path d="M3.5 19a5.5 5.5 0 0 1 11 0" {...P}/><path d="M17 4.5v6M14 7.5h6" {...P}/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      {paths[name] || null}
    </svg>
  );
}
window.Icon = Icon;
