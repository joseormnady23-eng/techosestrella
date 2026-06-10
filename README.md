# Klika · ERP Techos Estrella SRL

Sistema ERP interno **Klika** para Techos Estrella SRL (impermeabilización de techos, Santiago, RD).
Gestiona clientes, obras, cotizaciones, inventario, cuadrillas, planificación con clima,
facturación electrónica (e-CF/DGII), RR.HH. y un asistente de IA (Klika).

## Estructura

| Carpeta | Qué es |
|---------|--------|
| [`backend/`](backend/) | **API REST** — Laravel 13 + MySQL + Sanctum. Toda la lógica, ~125 endpoints, servicios (cotizador, clima, vacaciones, e-CF, Klika), PDFs y tests. |
| [`frontend/`](frontend/) | **ERP web** — prototipo React (UMD + Babel en navegador) exportado de Claude Design, con el Login y la capa de datos ya conectados al backend. |

Cada carpeta tiene su propio `README.md` con instrucciones detalladas.

## Arranque rápido (desarrollo local)

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

## Stack y despliegue

- **Backend:** Laravel 13, MySQL 8.4, Sanctum. **IA:** Ollama (`klika:latest`) en cnsia.
- **Clima:** Open-Meteo. **e-CF:** `ecfx/ecf-dgii-php` (sandbox DGII).
- **Desarrollo:** Windows + Laragon. **Producción:** Unraid (Docker).

> Nota: la tabla de usuarios es `usuarios` (no `users`); el modelo autenticable es `App\Models\Usuario`.
