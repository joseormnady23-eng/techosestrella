<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cuadrilla;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CuadrillaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Cuadrilla::with([
                'jefe:id,nombre',
                'miembros:id,nombre,rol',
                'vehiculo',
                'obras' => fn ($q) => $q->whereIn('estado', ['aprobada', 'en_proceso'])->select('id', 'codigo', 'titulo', 'cuadrilla_id', 'estado'),
            ])->orderBy('nombre')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:80'],
            'jefe_id' => ['nullable', 'exists:usuarios,id'],
            'activa' => ['boolean'],
            'miembros' => ['array'],
            'miembros.*' => ['exists:usuarios,id'],
        ]);

        $cuadrilla = Cuadrilla::create($data);
        if (! empty($data['miembros'])) {
            $cuadrilla->miembros()->sync($data['miembros']);
        }

        return response()->json($cuadrilla->load('miembros:id,nombre,rol'), 201);
    }

    public function show(Cuadrilla $cuadrilla): JsonResponse
    {
        return response()->json($cuadrilla->load(['jefe:id,nombre', 'miembros:id,nombre,rol', 'vehiculo', 'obras']));
    }

    public function update(Request $request, Cuadrilla $cuadrilla): JsonResponse
    {
        $data = $request->validate([
            'nombre' => ['sometimes', 'string', 'max:80'],
            'jefe_id' => ['nullable', 'exists:usuarios,id'],
            'activa' => ['sometimes', 'boolean'],
        ]);

        $cuadrilla->update($data);

        return response()->json($cuadrilla);
    }

    public function destroy(Cuadrilla $cuadrilla): JsonResponse
    {
        $cuadrilla->delete();

        return response()->json(['message' => 'Cuadrilla eliminada.']);
    }

    public function agregarMiembro(Request $request, Cuadrilla $cuadrilla): JsonResponse
    {
        $data = $request->validate(['usuario_id' => ['required', 'exists:usuarios,id']]);
        $cuadrilla->miembros()->syncWithoutDetaching([$data['usuario_id']]);

        return response()->json($cuadrilla->load('miembros:id,nombre,rol'));
    }

    public function quitarMiembro(Cuadrilla $cuadrilla, int $usuario): JsonResponse
    {
        $cuadrilla->miembros()->detach($usuario);

        return response()->json($cuadrilla->load('miembros:id,nombre,rol'));
    }
}
