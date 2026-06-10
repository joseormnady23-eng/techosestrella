# Klika · ERP Techos Estrella

Prototipo interactivo del ERP "Klika" para Techos Estrella SRL (impermeabilización de techos).
App React (React 18 UMD + Babel standalone en el navegador), sin paso de build.

## Cómo ejecutar

Necesita servirse por HTTP (los scripts `type="text/babel"` no cargan con `file://`):

```bash
cd frontend
python3 -m http.server 8765
```

Luego abre: http://localhost:8765/Klika%20ERP.html

## Conexión con el backend

El frontend ya trae un cliente API (`data/api.js`, `window.KlikaAPI`) y el **Login está conectado** al backend Laravel (`../backend`).

1. Levanta el backend: `cd ../backend && php artisan serve` (queda en `http://127.0.0.1:8000`).
2. En el login, usa **8091110001 / Klika2024!** (dueño). El rol y el token vienen del backend.
3. Si el backend no está corriendo, **deja los campos vacíos y pulsa Entrar** para el modo demo (datos mock).

CORS ya permite `http://localhost:8765`. Para cambiar la URL del API desde la consola del navegador:
`KlikaAPI.setBase('http://127.0.0.1:8000/api')`.

> Las demás pantallas todavía usan datos mock (`data/mock.js`). El siguiente paso es reemplazar
> esos mocks por llamadas a `KlikaData`, pantalla por pantalla.

### Capa de datos: `KlikaData` (`data/resources.js`)

Envuelve la API por recurso y trae **adaptadores** que traducen la respuesta del backend
a la forma exacta que esperan las pantallas (con defaults para que nada truene):

- `KlikaData.<recurso>.lista()/ver()/crear()/...` — llamadas por módulo.
- `KlikaData.map.cliente(apiC)` / `map.obra(apiO)` / `map.material(apiM)` — backend → forma mock.
  Traduce estados (`en_proceso → proceso`), nombres de campos (`telefono → tel`,
  `rnc_cedula → rnc`, `email → correo`…) y parsea decimales.
- `KlikaData.map.clienteAEnvio(form)` — formulario de pantalla → cuerpo del backend.

### Receta para conectar una pantalla (segura, con fallback al mock)

```jsx
const [clientes, setClientes] = React.useState(MOCK_INICIAL);
React.useEffect(() => {
  if (window.KlikaData && KlikaData.conectado()) {
    KlikaData.clientes.lista()
      .then(rows => {
        const mapped = rows.map(KlikaData.map.cliente);
        setClientes(mapped);
        if (mapped[0]) setSel(mapped[0].id);   // ← clave: resetear la selección
      })
      .catch(() => {});                          // si falla, se queda el mock
  }
}, []);
```

Para crear/editar: `KlikaData.clientes.crear(KlikaData.map.clienteAEnvio(form))`.
**Gotcha importante:** al cargar datos reales, resetea cualquier `sel`/`id` seleccionado al
primer registro de la lista nueva — si apunta a un id viejo, `lista.find(...)` da `undefined`
y la pantalla truena. El Dashboard ya está conectado así (solo lectura, sin ese riesgo).

## Estructura

- `Klika ERP.html` — entrada; carga estilos, datos, componentes y pantallas.
- `styles/` — `tokens.css` (paleta del logo + tipografía) y `responsive.css`.
- `data/mock.js` — datos de ejemplo (obras, clientes, materiales, cuadrillas, clima…).
- `components/` — `Shell` (sidebar + topbar + selector de rol), `Logo`, `icons`, stores.
- `screens/` — una pantalla por archivo (Login, Dashboard, Obras, Cotización,
  Planificador, Inventario, Cuadrillas, Vehículos, Clientes, Usuarios, Configuración,
  vista móvil del Aplicador, Portal del Cliente, etc.).

## Roles

Dueño, Secretaria, Supervisor y Aplicador ven distintas secciones (selector de rol en la topbar).

## Nota

Es un prototipo: el estado vive en memoria durante la sesión y no se persiste al recargar.
