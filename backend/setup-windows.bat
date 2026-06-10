@echo off
REM ====================================================================
REM  Klika backend - setup automatico para Windows + Laragon
REM  Ejecutar desde C:\laragon\www\klika\backend  ->  setup-windows.bat
REM ====================================================================
setlocal

echo.
echo === Klika backend - instalacion ===
echo.

echo [1/6] Instalando dependencias (composer install)...
call composer install --no-interaction
if errorlevel 1 goto :err

echo [2/6] Preparando .env...
if not exist .env copy .env.example .env >nul

echo [3/6] Generando APP_KEY...
call php artisan key:generate

echo [4/6] Creando base de datos 'klika' (MySQL root sin password)...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS klika CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
if errorlevel 1 echo    (Aviso: no pude crear la BD automaticamente. Si tu MySQL tiene password, ponla en .env y crea la base 'klika' a mano.)

echo [5/6] Migraciones + seeders + datos demo...
call php artisan migrate --seed --force
if errorlevel 1 goto :err
call php artisan db:seed --class=DemoSeeder --force

echo [6/6] Enlazando storage...
call php artisan storage:link

echo.
echo === LISTO ===
echo Arranca el backend con:   php artisan serve
echo Usuarios (pass Klika2024!): 8091110001 dueno  ^|  8091110004 aplicador
echo.
goto :eof

:err
echo.
echo *** Ocurrio un error. Revisa el mensaje de arriba. ***
exit /b 1
