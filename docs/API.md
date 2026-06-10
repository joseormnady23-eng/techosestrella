# Klika · Referencia del API

Base URL (local): `http://127.0.0.1:8000/api`
Autenticación: **Bearer token** (Laravel Sanctum) en el header `Authorization: Bearer <token>`.
Todas las respuestas son JSON. Roles: `dueno`, `secretaria`, `supervisor`, `aplicador`.

## Autenticación

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/auth/login` | público | `{login, password}` (login = teléfono o email) → `{token, usuario}` |
| POST | `/auth/logout` | auth | Revoca el token actual |
| GET | `/auth/me` | auth | Usuario autenticado con su rol |

```bash
# Ejemplo de login
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"8091110001","password":"Klika2024!"}'
```

## Dashboard y contabilidad

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/dashboard` | auth | Obras activas/hoy, cotizaciones pendientes, alertas de clima, stock bajo |
| GET | `/contabilidad/resumen` | dueno, secretaria | Ingresos, gastos, por cobrar, rechazadas DGII, solicitudes pendientes |
| GET | `/ecf/certificado-estado` | dueno | Estado del certificado .p12 |

## Configuración

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/configuracion` | auth | Identidad de empresa, ITBIS, umbrales de clima, branding |
| PUT | `/configuracion` | dueno | Actualiza la configuración (singleton) |

## Usuarios — `dueno`

`GET/POST /usuarios`, `GET/PUT/DELETE /usuarios/{id}` (DELETE = desactivar).

## Clientes

| Método | Ruta | Rol |
|---|---|---|
| GET | `/clientes`, `/clientes/{id}` | auth (lectura) |
| POST | `/clientes` | dueno, secretaria |
| PUT/DELETE | `/clientes/{id}` | dueno, secretaria (DELETE = desactivar) |
| POST | `/clientes/{id}/reactivar` | dueno, secretaria |

## Obras

| Método | Ruta | Rol |
|---|---|---|
| GET | `/obras`, `/obras/{id}` | auth (aplicador solo las suyas) |
| POST/PUT/DELETE | `/obras`, `/obras/{id}` | dueno, secretaria, supervisor |
| PATCH | `/obras/{id}/ubicacion-visible` | dueno, secretaria, supervisor |
| GET/POST | `/obras/{id}/secciones`, PUT/DELETE `/secciones/{id}` | gestión |
| GET/POST | `/obras/{id}/fotos` | auth (aplicador sube) |
| PATCH | `/obra-fotos/{id}/visible-cliente` | dueno, secretaria, supervisor |
| GET/PUT | `/obras/{id}/garantia` (PUT solo dueno) | — |
| GET | `/obras/{id}/garantia/expediente`, `/obras/{id}/garantia/pdf` | auth |
| GET | `/clima/obras/{id}` | auth (clima 14 días) |

## Cotizaciones — `dueno, secretaria, supervisor`

| Método | Ruta | Descripción |
|---|---|---|
| GET/POST | `/cotizaciones`, `/cotizaciones/{id}` | CRUD |
| POST | `/cotizaciones/calcular` | Vista previa del cálculo (sin guardar) |
| POST | `/cotizaciones/{id}/aplicar` | Persiste ítems con factor/rendimiento **congelados** |
| GET | `/cotizaciones/{id}/pdf` | PDF de la cotización |
| POST | `/cotizaciones/{id}/acceso-portal` | Genera link de cliente por token |

Cuerpo de `calcular`/`aplicar`:
```json
{
  "items": [
    {"descripcion":"Membrana","metros_cuadrados":100,"manos":2,"factor_desperdicio":1.10,"rendimiento_usado":5,"unidad":"galón","precio_unitario":850},
    {"descripcion":"Mano de obra","cantidad":1,"unidad":"servicio","precio_unitario":15000}
  ],
  "descuento_tipo":"porcentaje","descuento_valor":10,"itbis_activo":true
}
```
Fórmula: `cantidad = ceil((m² × manos × factor) ÷ rendimiento)`.

## Inventario

| Método | Ruta | Rol |
|---|---|---|
| GET | `/materiales`, `/materiales/{id}` | auth |
| GET | `/materiales/buscar-codigo/{codigo}` | auth |
| POST/PUT/DELETE | `/materiales`, `/materiales/{id}` | dueno, secretaria |
| POST | `/materiales/{id}/generar-codigo` | dueno, secretaria |
| GET/POST | `/movimientos-inventario` | dueno, secretaria (ajusta stock) |

## Cuadrillas y vehículos — `dueno, supervisor`

`GET/POST/PUT/DELETE /cuadrillas`, `POST /cuadrillas/{id}/miembros`, `DELETE /cuadrillas/{id}/miembros/{usuario}`,
`GET/POST/PUT /vehiculos`, `PATCH /vehiculos/{id}/asignar`.

## Planificador y asistencias

| Método | Ruta | Rol |
|---|---|---|
| GET | `/obra-dias?mes=YYYY-MM` | auth (calendario + clima + conflictos) |
| POST/PUT/DELETE | `/obra-dias`, `/obra-dias/{id}` | dueno, supervisor |
| GET | `/asistencias` | auth |
| POST | `/asistencias/checkin`, `/asistencias/checkout` | aplicador (con GPS) |
| PATCH | `/asistencias/{id}/corregir` | dueno, supervisor, secretaria |

## Facturación e-CF — `dueno, secretaria`

| Método | Ruta | Descripción |
|---|---|---|
| GET/POST | `/facturas`, GET `/facturas/{id}` | Emite con NCF consecutivo |
| POST | `/facturas/{id}/enviar-dgii` | Envía a la DGII (sandbox) |
| POST | `/facturas/{id}/anular` | Anula con nota de crédito B04 |
| POST | `/facturas/{id}/pagos` | Registra pago parcial/total |
| GET | `/facturas/{id}/pdf` | PDF de factura/nota |
| GET/POST/PUT/DELETE | `/gastos-contables` | Compras con NCF (606) |
| GET | `/ncf/secuencias`, PUT `/ncf/secuencias/{id}` (dueno) | Rangos NCF |

## Reportes — `dueno`

`/reportes/606`, `/reportes/607`, `/reportes/606/txt`, `/reportes/607/txt`,
`/reportes/rentabilidad`, `/reportes/resumen-obras`, `/reportes/stock-bajo`,
`/reportes/asistencia-mensual?periodo=YYYY-MM`.

## Pagos y gastos de obra — `dueno, secretaria`

`GET/POST/PUT/DELETE /pagos`, `GET/POST/PUT/DELETE /gastos`.

## RR.HH.

| Método | Ruta | Rol |
|---|---|---|
| GET/POST/PUT | `/empleados`, `/empleados/{id}` | dueno, secretaria |
| GET | `/empleados/{usuario}/vacaciones-resumen` | dueno, secretaria |
| GET | `/mi/vacaciones-resumen` | auth (propio — para la PWA) |
| GET/POST | `/ausencias` | auth (propias; dueno/secretaria ven todas) |
| GET | `/ausencias/calendario?mes=YYYY-MM` | auth |
| POST | `/ausencias/{id}/aprobar` (verifica conflictos), `/rechazar` | dueno |
| GET/POST/DELETE | `/feriados` | GET auth, escritura dueno |

## Solicitudes de cambio

`GET/POST /solicitudes-cambio`, `POST /solicitudes-cambio/{id}/aprobar|rechazar` (dueno aplica el cambio).

## Klika IA

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/klika/chat` | `{mensaje, conversacion_id?}` → respuesta (Ollama en cnsia) |
| GET | `/klika/conversaciones`, `/klika/conversaciones/{id}` | Historial del usuario |

## Portal del cliente (público, por token)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/portal/{token}` | Cotización + galería de avances visibles |
| POST | `/portal/{token}/aprobar` | Aprobar / pedir cambios / rechazar (completa o por etapa) |
