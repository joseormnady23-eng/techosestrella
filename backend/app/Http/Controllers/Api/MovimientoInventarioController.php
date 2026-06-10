<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\MovimientoInventario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MovimientoInventarioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = MovimientoInventario::with(['material:id,nombre,unidad', 'obra:id,codigo', 'usuario:id,nombre']);

        if ($request->filled('material_id')) {
            $q->where('material_id', $request->material_id);
        }

        return response()->json($q->latest('fecha')->limit(200)->get());
    }

    /** Registra un movimiento y actualiza el stock del material en transacción. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'material_id' => ['required', 'exists:materiales,id'],
            'tipo' => ['required', Rule::in(['entrada', 'salida', 'ajuste'])],
            'cantidad' => ['required', 'numeric', 'min:0.01'],
            'obra_id' => ['nullable', 'exists:obras,id'],
            'motivo' => ['nullable', 'string', 'max:200'],
        ]);

        $movimiento = DB::transaction(function () use ($data, $request) {
            $material = Material::lockForUpdate()->findOrFail($data['material_id']);

            $material->stock_actual = match ($data['tipo']) {
                'entrada' => $material->stock_actual + $data['cantidad'],
                'salida' => $material->stock_actual - $data['cantidad'],
                'ajuste' => $data['cantidad'], // ajuste fija el stock al valor dado
            };
            $material->save();

            return MovimientoInventario::create([
                'material_id' => $material->id,
                'tipo' => $data['tipo'],
                'cantidad' => $data['cantidad'],
                'obra_id' => $data['obra_id'] ?? null,
                'usuario_id' => $request->user()->id,
                'motivo' => $data['motivo'] ?? null,
                'fecha' => now(),
            ]);
        });

        return response()->json($movimiento->load('material:id,nombre,stock_actual'), 201);
    }
}
