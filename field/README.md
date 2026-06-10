# Klika Campo · PWA de aplicadores

App de campo (móvil, **solo rol aplicador**) para usar en obra: obras del día con clima,
check-in/out con GPS, subir fotos, ver materiales y solicitar vacaciones. **Funciona offline**
(las acciones se encolan y se sincronizan al reconectar).

Es **HTML + CSS + JS vanilla**, sin frameworks ni build. Consume la misma API del `backend/`.

## Cómo ejecutar

Necesita HTTP (el service worker y la cámara no funcionan con `file://`):

```bash
cd field
python3 -m http.server 8090
# abre http://localhost:8090/ en el teléfono (misma red) o en el navegador
```

El backend debe estar corriendo (`cd ../backend && php artisan serve`). Si el API no está en
`http://127.0.0.1:8000/api`, cámbialo en la pantalla **Perfil → Servidor**, o desde la consola:
`KlikaCampo.setBase('http://10.0.0.181:8000/api')`.

Login de prueba: **8091110004 / Klika2024!** (aplicador). Otros roles reciben error.

## Pantallas

- **Hoy** — saludo, clima 7 días, obras activas.
- **Obras** — todas mis obras.
- **Detalle** — estado, dirección + "cómo llegar" (solo si la ubicación es visible),
  botones grandes de **Check-in / Check-out / Subir foto / Materiales**, y la jornada del día.
- **Subir foto** — tipo (antes/durante/después/problema), cámara, descripción, vista previa.
- **Materiales** — solo lectura, según la cotización aprobada de la obra.
- **Vacaciones** — días disponibles, solicitar ausencia, historial.
- **Perfil** — sincronización manual, configurar servidor, cerrar sesión.

## Offline

- Sin conexión aparece un banner amarillo arriba.
- **Check-in/out y solicitudes** se guardan en `localStorage`; **las fotos** en IndexedDB.
- Al volver la conexión (evento `online`) se sincroniza solo; también hay botón manual en Perfil.

## Pendiente

- Iconos PWA reales en `icons/icon-192.png` y `icons/icon-512.png` (ahora son placeholders;
  sin ellos la app corre, pero la instalación no muestra ícono propio).
- Verificación en dispositivo real (cámara, GPS, instalación PWA).
