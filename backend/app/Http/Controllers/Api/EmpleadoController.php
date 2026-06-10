<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmpleadoInfo;
use App\Models\Usuario;
use App\Services\VacacionesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmpleadoController extends Controller
{
    public function __construct(private readonly VacacionesService $vacaciones)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json(
            EmpleadoInfo::with('usuario:id,nombre,telefono,rol')->where('activo', true)->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'usuario_id' => ['required', 'exists:usuarios,id', 'unique:empleados_info,usuario_id'],
            'fecha_ingreso' => ['required', 'date'],
            'cargo' => ['nullable', 'string', 'max:100'],
            'salario' => ['nullable', 'numeric', 'min:0'],
            'tipo_contrato' => ['sometimes', 'string', 'max:20'],
            'fecha_fin_contrato' => ['nullable', 'date'],
            'dias_vacaciones_base' => ['sometimes', 'integer', 'min:0'],
        ]);

        return response()->json(EmpleadoInfo::create($data), 201);
    }

    public function update(Request $request, EmpleadoInfo $empleado): JsonResponse
    {
        $data = $request->validate([
            'fecha_ingreso' => ['sometimes', 'date'],
            'cargo' => ['nullable', 'string', 'max:100'],
            'salario' => ['nullable', 'numeric', 'min:0'],
            'tipo_contrato' => ['sometimes', 'string', 'max:20'],
            'fecha_fin_contrato' => ['nullable', 'date'],
            'dias_vacaciones_base' => ['sometimes', 'integer', 'min:0'],
            'activo' => ['sometimes', 'boolean'],
        ]);

        $empleado->update($data);

        return response()->json($empleado);
    }

    /** Resumen de vacaciones: días derecho / tomados / disponibles. */
    public function vacacionesResumen(Usuario $usuario): JsonResponse
    {
        return response()->json($this->vacaciones->resumen($usuario));
    }

    /** Resumen de vacaciones del usuario autenticado (para la PWA de campo). */
    public function miResumen(Request $request): JsonResponse
    {
        return response()->json($this->vacaciones->resumen($request->user()));
    }
}
