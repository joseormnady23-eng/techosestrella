# Klika — Backend (Laravel 13)

Backend del ERP **Klika** para Techos Estrella SRL. API REST con Laravel 13 + MySQL + Sanctum.

## Estado actual — FUNDACIÓN + API COMPLETAS ✅

Pasos 1–12 del orden de construcción del handoff:

1. ✅ Laravel 13.15 + Sanctum + API scaffolding, `.env` apuntando a MySQL (`klika`).
2. ✅ **34 tablas de dominio** migradas (+ framework) — esquema completo del handoff, soft deletes y FKs con `nullOnDelete`/`cascadeOnDelete`.
3. ✅ **33 modelos Eloquent** con `$fillable`, `casts`, soft deletes y relaciones (`Usuario` autenticable con `HasApiTokens`).
4. ✅ Seeders: configuración (singleton), 4 usuarios, secuencias NCF (B01/B02/B04), 24 feriados RD 2026–2027.
5. ✅ **Autenticación** — login por teléfono **o** email + password → token Sanctum; logout; `/auth/me`.
6. ✅ **Control de acceso por rol** — middleware `role:dueno,secretaria,...` aplicado a cada ruta.
7. ✅ **30 controladores / 122 rutas API** cubriendo todos los módulos del handoff.
8. ✅ **CotizadorService** — fórmula `ceil((m²×manos×factor)÷rend.)` con factor/rendimiento **congelados** al aplicar (corrige ruido de punto flotante).
9. ✅ **ClimaService + ActualizarClimaJob** (Open-Meteo, programado cada 6h) — marca `cuadrilla_incompleta` por ausencias.
10. ✅ **EcfService** — consumo de NCF con bloqueo de fila, envío DGII gracioso, anulación con nota de crédito B04.
11. ✅ **VacacionesService** — Art. 177 (14/18 días), días hábiles excluyendo feriados, verificación de conflictos con obras.
12. ✅ **KlikaService** — chat con Ollama en cnsia, con fallback si el servidor no responde.

Verificado end-to-end: login, sesión, gating 401/403, y el motor de cotización (44 galones / total RD$44,132 en el caso de prueba).

> Nota: la tabla de usuarios es **`usuarios`** (no `users`). El modelo autenticable es `App\Models\Usuario` y `config/auth.php` ya apunta a él.

## Endpoints (resumen)

`php artisan route:list --path=api` lista las 122 rutas. Principales grupos:
`auth/*`, `dashboard`, `configuracion`, `usuarios`, `clientes`, `obras` (+secciones, ubicación, fotos, garantía, clima),
`cotizaciones` (+calcular/aplicar/acceso-portal), `materiales` (+movimientos, código), `cuadrillas` (+miembros),
`vehiculos`, `obra-dias` (planificador), `asistencias` (checkin/checkout/corregir), `facturas` (+enviar-dgii/anular/pagos),
`gastos`, `gastos-contables`, `pagos`, `ncf/secuencias`, `reportes/{606,607,...}`, `empleados`, `ausencias`,
`feriados`, `solicitudes-cambio`, `contabilidad/resumen`, `klika/chat`, y el `portal/{token}` público.

## Setup local

Requisitos: PHP 8.3+, Composer, MySQL 8+.

```bash
cd backend
composer install
# crear la base si no existe:
mysql -u root -e "CREATE DATABASE IF NOT EXISTS klika CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate:fresh --seed
php artisan serve   # http://127.0.0.1:8000
```

## Credenciales sembradas (password: `Klika2024!`)

| Rol        | Teléfono   | Email                |
|------------|------------|----------------------|
| dueno      | 8091110001 | dueno@klika.do       |
| secretaria | 8091110002 | secretaria@klika.do  |
| supervisor | 8091110003 | supervisor@klika.do  |
| aplicador  | 8091110004 | —                    |

## Integraciones (configuradas en `.env`, aún sin implementar)

- `KLIKA_OLLAMA_URL` → Ollama en cnsia (10.0.0.237:11434), modelo `klika:latest`
- `OPEN_METEO_URL` → clima (gratis, sin key)
- `DGII_ECF_*` → e-CF sandbox DGII (`ecfx/ecf-dgii-php`)

## Próximos pasos (pendientes)

13. Generación PDF (cotización + expediente de garantía) — los endpoints ya devuelven los datos listos.
14. Conectar el frontend (`../frontend`) a estos endpoints (reemplazar el mock por llamadas reales).
15. PWA klika-field (app de campo para aplicadores).
16. Integración real de `ecfx/ecf-dgii-php` (firma XML + SOAP) y carga del certificado `.p12`.
17. Tests automatizados (Pest/PHPUnit) y CI.
18. Docker → Unraid.

### Notas de implementación
- Las fotos se guardan en `storage/app/public` — corre `php artisan storage:link` para servirlas.
- El envío e-CF queda en `pendiente` hasta configurar `DGII_ECF_CERT_PATH` (certificado .p12).
- El TXT de 606/607 usa un formato pipe-delimitado práctico; ajústalo al layout oficial vigente de la DGII antes de producción.

## PDFs

`barryvdh/laravel-dompdf` + vistas en `resources/views/pdf/`. Endpoints:
`GET /cotizaciones/{id}/pdf`, `GET /facturas/{id}/pdf`, `GET /obras/{id}/garantia/pdf`.

## Datos de demostración

```bash
php artisan db:seed --class=DemoSeeder   # 5 materiales, 2 clientes, 1 cuadrilla, 2 obras con secciones
```

## Tests

```bash
php artisan test     # 28 tests, sqlite en memoria (phpunit.xml)
```

Cubren: auth + gating por rol (401/403), motor de cotización (fórmula, congelado de
factor/rendimiento, descuentos, ITBIS), inventario (entrada/salida/ajuste, código de barras),
facturación (NCF consecutivo, secuencia agotada, e-CF no_aplica) y vacaciones (Art. 177,
días hábiles sin feriados). La suite atrapó y se corrigieron 2 bugs reales: colisión
`Material::bajoMinimo()` (método vs. scope) y `Configuracion::actual()` que dependía de
defaults de la BD para el ITBIS.
