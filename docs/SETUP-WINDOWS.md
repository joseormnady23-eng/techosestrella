# Klika · Puesta en marcha en Windows (Laragon)

Todo el proyecto es multiplataforma. En Windows usas **Laragon**, que ya trae
PHP 8.3, MySQL/MariaDB, Composer y una terminal con todo en el PATH.

## 1. Requisitos (una sola vez)

- [Laragon](https://laragon.org/download/) (Full) — incluye PHP, MySQL, Composer.
- [Git para Windows](https://git-scm.com/download/win) (o GitHub Desktop).

> Verifica en la terminal de Laragon (botón **Terminal**): `php -v`, `composer -V`, `git --version`, `mysql --version`.

## 2. Clonar el repo

Abre **Laragon → Terminal** y:

```bat
cd C:\laragon\www
git clone https://github.com/joseormnady23-eng/techosestrella.git klika
cd klika
```

## 3. Backend (automático)

Desde `C:\laragon\www\klika`:

```bat
cd backend
setup-windows.bat
```

El script hace: `composer install`, crea el `.env`, genera la APP_KEY, crea la base
`klika` y corre migraciones + seeders + datos demo. Si prefieres a mano:

```bat
cd backend
composer install
copy .env.example .env
php artisan key:generate
mysql -u root -e "CREATE DATABASE IF NOT EXISTS klika CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed
php artisan db:seed --class=DemoSeeder
```

> **MySQL en Laragon:** por defecto usuario `root` **sin contraseña** — coincide con el `.env`
> (`DB_USERNAME=root`, `DB_PASSWORD=` vacío). Si tu MySQL tiene contraseña, ponla en `backend\.env`.

### Levantar el backend

```bat
php artisan serve
```
Queda en **http://127.0.0.1:8000**.

> Alternativa Laragon (URL bonita): apunta el Document Root a `backend\public` y tendrás
> `http://klika.test`. Con `php artisan serve` no hace falta.

## 4. Frontend (ERP web)

En **otra** terminal de Laragon:

```bat
cd C:\laragon\www\klika\frontend
php -S 127.0.0.1:8765
```
Abre **http://127.0.0.1:8765/Klika%20ERP.html**
Login: **8091110001 / Klika2024!** (dueño).

> El frontend ya apunta al API en `http://127.0.0.1:8000/api`. Si lo cambias, en la consola
> del navegador: `KlikaAPI.setBase('http://127.0.0.1:8000/api')`.

## 5. PWA de campo (klika-field)

```bat
cd C:\laragon\www\klika\field
php -S 127.0.0.1:8090
```
Abre **http://127.0.0.1:8090/** · login **8091110004 / Klika2024!** (aplicador).
Para probarla en el celular: usa la IP de tu PC (p. ej. `http://192.168.1.50:8090`) estando
en la misma red, y en **Perfil → Servidor** pon `http://192.168.1.50:8000/api`.

## 6. Asistente Klika (IA) — opcional

El chat de Klika llama a Ollama en `cnsia` (`http://10.0.0.237:11434`). Si ese servidor no
está accesible desde tu PC, el chat responde con un mensaje de "no disponible" (no rompe nada).

## Problemas comunes

| Síntoma | Solución |
|---|---|
| `could not find driver` | Habilita `pdo_mysql` en el `php.ini` de Laragon (Menú → PHP → Extensions). |
| `Access denied for user root` | Pon la contraseña de tu MySQL en `backend\.env` (`DB_PASSWORD=`). |
| El frontend no carga datos | Confirma que el backend está en `:8000` y que entraste con un usuario real (no modo demo). |
| Puerto ocupado | Cambia el puerto: `php artisan serve --port=8001` y ajusta `KlikaAPI.setBase`. |

## Producción

Para el servidor real (Unraid con Docker) mira la sección **Despliegue con Docker** del
[README raíz](../README.md).
