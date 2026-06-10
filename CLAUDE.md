# Klika ERP — contexto para Claude Code

Este archivo lo lee Claude Code automáticamente. Resume el proyecto para continuar el trabajo
en cualquier máquina (este repo se desarrolló al inicio en un Mac y sigue en Windows + Laragon).

## Qué es

ERP interno **Klika** para **Techos Estrella SRL** (impermeabilización de techos, Santiago, RD).
NO es SaaS. "Klika" es la marca de IA propia del dueño (José Ormandy). Todo en español dominicano.

## Repo (3 proyectos + infra)

| Carpeta | Qué es |
|---|---|
| `backend/` | API REST — **Laravel 13 + MySQL + Sanctum**. Lógica completa, ~126 endpoints, servicios, PDFs, 28 tests. |
| `frontend/` | ERP web — prototipo **React UMD + Babel** (sin build). Login y Dashboard conectados al backend. |
| `field/` | PWA de campo (`klika-field`) — **HTML/CSS/JS vanilla**, offline, solo rol aplicador. |
| `docs/` | `API.md` (referencia de endpoints) + colección Postman + `SETUP-WINDOWS.md`. |
| `docker-compose.yml`, `.github/workflows/ci.yml` | Despliegue Docker (Unraid) y CI (28 tests + lint en cada push). |

## Estado (qué está hecho / qué falta)

**Hecho:** migraciones (34 tablas), 33 modelos, auth por teléfono/email, control de acceso por
rol (`role:` middleware), todos los controladores y rutas, servicios (CotizadorService,
ClimaService+Job, VacacionesService, KlikaService, EcfService), PDFs (dompdf), 28 tests PHPUnit
en verde, Docker, CI, docs. Frontend: `data/api.js` (KlikaAPI) + `data/resources.js` (KlikaData
con adaptadores) + Login y Dashboard en vivo. PWA `field/` completa (falta probar en dispositivo).

**Pendiente:** conectar el resto de pantallas del ERP web al backend; iconos PNG de la PWA y
prueba en celular; integración real DGII (`ecfx/ecf-dgii-php` + certificado .p12); desplegar en
Unraid (Docker).

## Convenciones importantes (no romper)

- La tabla de usuarios es **`usuarios`** (no `users`); el modelo autenticable es `App\Models\Usuario`.
- Roles: `dueno`, `secretaria`, `supervisor`, `aplicador`. Gating con middleware `role:dueno,secretaria`.
- Fórmula del cotizador: `cantidad = ceil((m² × manos × factor) ÷ rendimiento)`; al **aplicar**,
  el factor y el rendimiento se **congelan** en `cotizacion_items`.
- Montos `decimal(12,2)` DOP. ITBIS y umbrales de clima salen de la tabla `configuracion` (singleton).
- Seeders: `php artisan migrate --seed` + `php artisan db:seed --class=DemoSeeder` (datos demo).
  Usuarios de prueba (pass `Klika2024!`): 8091110001 dueño, 8091110002 secretaria,
  8091110003 supervisor, 8091110004 aplicador.

## Cómo correrlo

- **Windows/Laragon:** ver `docs/SETUP-WINDOWS.md` (hay un `backend\setup-windows.bat`).
- Genérico: `cd backend && composer install && php artisan migrate --seed && php artisan serve`.
  Frontend: `cd frontend && php -S 127.0.0.1:8765` → `Klika ERP.html`.
  PWA: `cd field && php -S 127.0.0.1:8090`.

## Para conectar una pantalla del ERP al backend (patrón seguro)

Usar `KlikaData` (en `frontend/data/resources.js`): trae helpers por recurso y **adaptadores**
`KlikaData.map.cliente/obra/material` que traducen la respuesta del backend a la forma que esperan
las pantallas (incluyen defaults y traducción de estados, ej. `en_proceso → proceso`). Cargar con
`useEffect` + fallback al mock, y **resetear cualquier `sel`/id seleccionado** al primer registro
nuevo (si apunta a un id viejo, la pantalla truena). Receta detallada en `frontend/README.md`.

## Infra del dueño (referencia)

- Dev: Windows + Laragon (PHP 8.3, MySQL 8.4). Prod: Unraid (HP Z4, 10.0.0.181, Docker).
- IA Klika: Ollama en cnsia (10.0.0.237:11434, modelo `klika:latest`). Si no responde, el chat
  degrada con gracia (no rompe).
