<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehiculo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehiculoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Vehiculo::with('cuadrilla:id,nombre')->orderBy('placa')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cuadrilla_id' => ['nullable', 'exists:cuadrillas,id'],
            'placa' => ['required', 'string', 'max:15', 'unique:vehiculos,placa'],
            'tipo' => ['required', Rule::in(['camion', 'pickup', 'furgoneta', 'otro'])],
            'modelo' => ['nullable', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string', 'max:200'],
            'activo' => ['boolean'],
        ]);

        return response()->json(Vehiculo::create($data), 201);
    }

    public function update(Request $request, Vehiculo $vehiculo): JsonResponse
    {
        $data = $request->validate([
            'cuadrilla_id' => ['nullable', 'exists:cuadrillas,id'],
            'placa' => ['sometimes', 'string', 'max:15', Rule::unique('vehiculos', 'placa')->ignore($vehiculo->id)],
            'tipo' => ['sometimes', Rule::in(['camion', 'pickup', 'furgoneta', 'otro'])],
            'modelo' => ['nullable', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string', 'max:200'],
            'activo' => ['sometimes', 'boolean'],
        ]);

        $vehiculo->update($data);

        return response()->json($vehiculo);
    }

    /** Asigna (o desasigna con null) el vehículo a una cuadrilla. */
    public function asignar(Request $request, Vehiculo $vehiculo): JsonResponse
    {
        $data = $request->validate([
            'cuadrilla_id' => ['nullable', 'exists:cuadrillas,id'],
        ]);

        $vehiculo->update(['cuadrilla_id' => $data['cuadrilla_id'] ?? null]);

        return response()->json($vehiculo->load('cuadrilla:id,nombre'));
    }
}
