# Klika · ERP Techos Estrella SRL

Sistema ERP interno **Klika** para Techos Estrella SRL (impermeabilización de techos, Santiago, RD).
Gestiona clientes, obras, cotizaciones, inventario, cuadrillas, planificación con clima,
facturación electrónica (e-CF/DGII), RR.HH. y un asistente de IA (Klika).

## Estructura

| Carpeta | Qué es |
|---------|--------|
| [`backend/`](backend/) | **API REST** — Laravel 13 + MySQL + Sanctum. Toda la lógica, ~126 endpoints, servicios (cotizador, clima, vacaciones, e-CF, Klika), PDFs y tests. |
| [`frontend/`](frontend/) | **ERP web** — prototipo React (UMD + Babel en navegador) exportado de Claude Design, con el Login y la capa de datos ya conectados al backend. |
| [`field/`](field/) | **PWA de campo (`klika-field`)** — app móvil offline para aplicadores: obras del día, check-in/out con GPS, fotos, materiales y vacaciones. HTML/CSS/JS vanilla. |

Cada carpeta tiene su propio `README.md` con instrucciones detalladas.

## Arranque rápido (desarrollo local)

> 🪟 **¿En Windows con Laragon?** Sigue la guía dedicada: [`docs/SETUP-WINDOWS.md`](docs/SETUP-WINDOWS.md)
> (incluye un `backend\setup-windows.bat` que hace todo solo). Lo de abajo es la versión genérica.

```bash
# Backend (http://127.0.0.1:8000)
cd backend
composer install
php artisan migrate:fresh --seed
php artisan db:seed --class=DemoSeeder   # datos de ejemplo (opcional)
php artisan serve

# Frontend (http://localhost:8765) — en otra terminal
cd frontend
python3 -m http.server 8765
# abre http://localhost:8765/Klika%20ERP.html
```

Login de prueba: **8091110001 / Klika2024!** (rol dueño).

## Estado

- ✅ Backend: migraciones, modelos, auth por rol, ~125 endpoints, servicios de negocio, PDFs, **28 tests en verde**.
- ✅ Frontend: cliente API + capa de recursos con adaptadores; Login y Dashboard conectados.
- ⏳ Pendiente: conectar el resto de pantallas, PWA de campo (`klika-field`), integración real DGII (cert .p12), despliegue en Docker/Unraid.

## Documentación

- [`docs/API.md`](docs/API.md) — referencia de todos los endpoints (método, ruta, rol).
- [`docs/Klika.postman_collection.json`](docs/Klika.postman_collection.json) — colección Postman importable (el login guarda el token solo).

## Despliegue con Docker (Unraid)

```bash
cp backend/.env.docker backend/.env
docker compose build
docker compose up -d
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan storage:link
# ERP en http://HOST:8080
```

CI: cada push corre los 28 tests + lint de PHP (`.github/workflows/ci.yml`).

## Stack y despliegue

- **Backend:** Laravel 13, MySQL 8.4, Sanctum. **IA:** Ollama (`klika:latest`) en cnsia.
- **Clima:** Open-Meteo. **e-CF:** `ecfx/ecf-dgii-php` (sandbox DGII).
- **Desarrollo:** Windows + Laragon. **Producción:** Unraid (Docker).

> Nota: la tabla de usuarios es `usuarios` (no `users`); el modelo autenticable es `App\Models\Usuario`.
