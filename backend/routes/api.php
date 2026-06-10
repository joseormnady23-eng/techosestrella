<?php

use App\Http\Controllers\Api\AsistenciaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AusenciaController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\ClimaController;
use App\Http\Controllers\Api\ConfiguracionController;
use App\Http\Controllers\Api\ContabilidadController;
use App\Http\Controllers\Api\CotizacionController;
use App\Http\Controllers\Api\CuadrillaController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmpleadoController;
use App\Http\Controllers\Api\FacturaController;
use App\Http\Controllers\Api\FeriadoController;
use App\Http\Controllers\Api\GarantiaController;
use App\Http\Controllers\Api\GastoContableController;
use App\Http\Controllers\Api\GastoController;
use App\Http\Controllers\Api\KlikaController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\MovimientoInventarioController;
use App\Http\Controllers\Api\NcfController;
use App\Http\Controllers\Api\ObraController;
use App\Http\Controllers\Api\ObraDiaController;
use App\Http\Controllers\Api\ObraFotoController;
use App\Http\Controllers\Api\ObraSeccionController;
use App\Http\Controllers\Api\PagoController;
use App\Http\Controllers\Api\PortalController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\SolicitudCambioController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\VehiculoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas API — Klika ERP
|--------------------------------------------------------------------------
| Roles: dueno | secretaria | supervisor | aplicador
*/

// --- Público ---
Route::post('/auth/login', [AuthController::class, 'login']);

// Portal del cliente (acceso por token, sin sesión).
Route::get('/portal/{token}', [PortalController::class, 'ver']);
Route::post('/portal/{token}/aprobar', [PortalController::class, 'aprobar']);

// --- Autenticado (Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Configuración — solo dueño edita.
    Route::get('/configuracion', [ConfiguracionController::class, 'show']);
    Route::put('/configuracion', [ConfiguracionController::class, 'update'])->middleware('role:dueno');

    // Usuarios — solo dueño.
    Route::apiResource('usuarios', UsuarioController::class)->middleware('role:dueno');

    // Clientes — lectura para autenticados; escritura dueño + secretaria.
    Route::get('clientes', [ClienteController::class, 'index']);
    Route::get('clientes/{cliente}', [ClienteController::class, 'show']);
    Route::middleware('role:dueno,secretaria')->group(function () {
        Route::post('clientes', [ClienteController::class, 'store']);
        Route::match(['put', 'patch'], 'clientes/{cliente}', [ClienteController::class, 'update']);
        Route::delete('clientes/{cliente}', [ClienteController::class, 'destroy']);
        Route::post('clientes/{cliente}/reactivar', [ClienteController::class, 'reactivar']);
    });

    // Obras — CRUD dueño/secretaria/supervisor; aplicador solo lee las suyas.
    Route::get('obras', [ObraController::class, 'index']);
    Route::get('obras/{obra}', [ObraController::class, 'show']);
    Route::get('obras/{obra}/secciones', [ObraSeccionController::class, 'index']);
    Route::get('obras/{obra}/fotos', [ObraFotoController::class, 'index']);
    Route::post('obras/{obra}/fotos', [ObraFotoController::class, 'store']); // aplicador sube a sus obras
    Route::get('obras/{obra}/garantia', [GarantiaController::class, 'show']);
    Route::get('obras/{obra}/garantia/expediente', [GarantiaController::class, 'expediente']);
    Route::get('obras/{obra}/garantia/pdf', [GarantiaController::class, 'pdf']);
    Route::get('clima/obras/{obra}', [ClimaController::class, 'obra']);
    Route::middleware('role:dueno,secretaria,supervisor')->group(function () {
        Route::post('obras', [ObraController::class, 'store']);
        Route::match(['put', 'patch'], 'obras/{obra}', [ObraController::class, 'update']);
        Route::delete('obras/{obra}', [ObraController::class, 'destroy']);
        Route::patch('obras/{obra}/ubicacion-visible', [ObraController::class, 'ubicacionVisible']);
        Route::post('obras/{obra}/secciones', [ObraSeccionController::class, 'store']);
        Route::match(['put', 'patch'], 'secciones/{seccion}', [ObraSeccionController::class, 'update']);
        Route::delete('secciones/{seccion}', [ObraSeccionController::class, 'destroy']);
    });

    // Cotizaciones — dueño + secretaria + supervisor.
    Route::middleware('role:dueno,secretaria,supervisor')->group(function () {
        Route::post('cotizaciones/calcular', [CotizacionController::class, 'calcular']);
        Route::apiResource('cotizaciones', CotizacionController::class);
        Route::post('cotizaciones/{cotizacion}/aplicar', [CotizacionController::class, 'aplicar']);
        Route::get('cotizaciones/{cotizacion}/pdf', [CotizacionController::class, 'pdf']);
        Route::post('cotizaciones/{cotizacion}/acceso-portal', [PortalController::class, 'generarAcceso']);
    });

    // Inventario — lectura amplia; escritura dueño + secretaria.
    Route::get('materiales/buscar-codigo/{codigo}', [MaterialController::class, 'buscarCodigo']);
    Route::get('materiales', [MaterialController::class, 'index']);
    Route::get('materiales/{material}', [MaterialController::class, 'show']);
    Route::middleware('role:dueno,secretaria')->group(function () {
        Route::post('materiales', [MaterialController::class, 'store']);
        Route::match(['put', 'patch'], 'materiales/{material}', [MaterialController::class, 'update']);
        Route::delete('materiales/{material}', [MaterialController::class, 'destroy']);
        Route::post('materiales/{material}/generar-codigo', [MaterialController::class, 'generarCodigo']);
        Route::get('movimientos-inventario', [MovimientoInventarioController::class, 'index']);
        Route::post('movimientos-inventario', [MovimientoInventarioController::class, 'store']);
    });

    // Cuadrillas y vehículos — dueño + supervisor.
    Route::middleware('role:dueno,supervisor')->group(function () {
        Route::apiResource('cuadrillas', CuadrillaController::class);
        Route::post('cuadrillas/{cuadrilla}/miembros', [CuadrillaController::class, 'agregarMiembro']);
        Route::delete('cuadrillas/{cuadrilla}/miembros/{usuario}', [CuadrillaController::class, 'quitarMiembro']);
        Route::get('vehiculos', [VehiculoController::class, 'index']);
        Route::post('vehiculos', [VehiculoController::class, 'store']);
        Route::match(['put', 'patch'], 'vehiculos/{vehiculo}', [VehiculoController::class, 'update']);
        Route::patch('vehiculos/{vehiculo}/asignar', [VehiculoController::class, 'asignar']);
    });

    // Planificador / días de obra.
    Route::get('obra-dias', [ObraDiaController::class, 'index']);
    Route::middleware('role:dueno,supervisor')->group(function () {
        Route::post('obra-dias', [ObraDiaController::class, 'store']);
        Route::match(['put', 'patch'], 'obra-dias/{obraDia}', [ObraDiaController::class, 'update']);
        Route::delete('obra-dias/{obraDia}', [ObraDiaController::class, 'destroy']);
    });

    // Asistencias.
    Route::get('asistencias', [AsistenciaController::class, 'index']);
    Route::post('asistencias/checkin', [AsistenciaController::class, 'checkin'])->middleware('role:aplicador');
    Route::post('asistencias/checkout', [AsistenciaController::class, 'checkout'])->middleware('role:aplicador');
    Route::patch('asistencias/{asistencia}/corregir', [AsistenciaController::class, 'corregir'])->middleware('role:dueno,supervisor,secretaria');

    // Fotos — visibilidad y borrado (gestión).
    Route::patch('obra-fotos/{foto}/visible-cliente', [ObraFotoController::class, 'visibleCliente'])->middleware('role:dueno,secretaria,supervisor');
    Route::delete('obra-fotos/{foto}', [ObraFotoController::class, 'destroy'])->middleware('role:dueno,secretaria,supervisor');

    // Garantías — solo dueño edita.
    Route::put('obras/{obra}/garantia', [GarantiaController::class, 'upsert'])->middleware('role:dueno');

    // Pagos y gastos de obra — dueño + secretaria.
    Route::middleware('role:dueno,secretaria')->group(function () {
        Route::apiResource('pagos', PagoController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::apiResource('gastos', GastoController::class)->only(['index', 'store', 'update', 'destroy']);
    });

    // Facturación e-CF — dueño + secretaria.
    Route::middleware('role:dueno,secretaria')->group(function () {
        Route::apiResource('facturas', FacturaController::class)->only(['index', 'store', 'show']);
        Route::post('facturas/{factura}/enviar-dgii', [FacturaController::class, 'enviarDgii']);
        Route::post('facturas/{factura}/anular', [FacturaController::class, 'anular']);
        Route::post('facturas/{factura}/pagos', [FacturaController::class, 'pagos']);
        Route::get('facturas/{factura}/pdf', [FacturaController::class, 'pdf']);
        Route::apiResource('gastos-contables', GastoContableController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['gastos-contables' => 'gasto']);
    });

    // NCF — solo dueño edita.
    Route::get('ncf/secuencias', [NcfController::class, 'index']);
    Route::put('ncf/secuencias/{secuencia}', [NcfController::class, 'update'])->middleware('role:dueno');

    // Reportes — solo dueño.
    Route::middleware('role:dueno')->group(function () {
        Route::get('reportes/606', [ReporteController::class, 'dgii606']);
        Route::get('reportes/607', [ReporteController::class, 'dgii607']);
        Route::get('reportes/606/txt', [ReporteController::class, 'txt606']);
        Route::get('reportes/607/txt', [ReporteController::class, 'txt607']);
        Route::get('reportes/rentabilidad', [ReporteController::class, 'rentabilidad']);
        Route::get('reportes/resumen-obras', [ReporteController::class, 'resumenObras']);
        Route::get('reportes/stock-bajo', [ReporteController::class, 'stockBajo']);
        Route::get('reportes/asistencia-mensual', [ReporteController::class, 'asistenciaMensual']);
    });

    // RRHH — empleados (dueño + secretaria); ausencias (cualquiera para sí).
    Route::middleware('role:dueno,secretaria')->group(function () {
        Route::get('empleados/{usuario}/vacaciones-resumen', [EmpleadoController::class, 'vacacionesResumen']);
        Route::apiResource('empleados', EmpleadoController::class)
            ->only(['index', 'store', 'update'])
            ->parameters(['empleados' => 'empleado']);
    });
    // Resumen de vacaciones del propio usuario (cualquier rol — para la PWA de campo).
    Route::get('mi/vacaciones-resumen', [EmpleadoController::class, 'miResumen']);

    Route::get('ausencias', [AusenciaController::class, 'index']);
    Route::get('ausencias/calendario', [AusenciaController::class, 'calendario']);
    Route::post('ausencias', [AusenciaController::class, 'store']);
    Route::post('ausencias/{ausencia}/aprobar', [AusenciaController::class, 'aprobar'])->middleware('role:dueno');
    Route::post('ausencias/{ausencia}/rechazar', [AusenciaController::class, 'rechazar'])->middleware('role:dueno');
    Route::get('feriados', [FeriadoController::class, 'index']);
    Route::middleware('role:dueno')->group(function () {
        Route::post('feriados', [FeriadoController::class, 'store']);
        Route::delete('feriados/{feriado}', [FeriadoController::class, 'destroy']);
    });

    // Solicitudes de cambio (inventario sensible).
    Route::get('solicitudes-cambio', [SolicitudCambioController::class, 'index']);
    Route::post('solicitudes-cambio', [SolicitudCambioController::class, 'store']);
    Route::post('solicitudes-cambio/{solicitud}/aprobar', [SolicitudCambioController::class, 'aprobar'])->middleware('role:dueno');
    Route::post('solicitudes-cambio/{solicitud}/rechazar', [SolicitudCambioController::class, 'rechazar'])->middleware('role:dueno');

    // Contabilidad / e-CF.
    Route::get('contabilidad/resumen', [ContabilidadController::class, 'resumen'])->middleware('role:dueno,secretaria');
    Route::get('ecf/certificado-estado', [ContabilidadController::class, 'certificadoEstado'])->middleware('role:dueno');

    // Klika IA.
    Route::post('klika/chat', [KlikaController::class, 'chat']);
    Route::get('klika/conversaciones', [KlikaController::class, 'conversaciones']);
    Route::get('klika/conversaciones/{conversacion}', [KlikaController::class, 'show']);
});
