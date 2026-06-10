<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gasto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GastoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Gasto::with('obra:id,codigo,titulo');
        if ($request->filled('obra_id')) {
            $q->where('obra_id', $request->obra_id);
        }

        return response()->json($q->latest('fecha')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'categoria' => ['required', 'string', 'max:50'],
            'monto' => ['required', 'numeric', 'min:0'],
            'fecha' => ['required', 'date'],
            'obra_id' => ['nullable', 'exists:obras,id'],
            'nota' => ['nullable', 'string', 'max:200'],
        ]);

        return response()->json(Gasto::create($data), 201);
    }

    public function update(Request $request, Gasto $gasto): JsonResponse
    {
        $data = $request->validate([
            'categoria' => ['sometimes', 'string', 'max:50'],
            'monto' => ['sometimes', 'numeric', 'min:0'],
            'fecha' => ['sometimes', 'date'],
            'obra_id' => ['nullable', 'exists:obras,id'],
            'nota' => ['nullable', 'string', 'max:200'],
        ]);

        $gasto->update($data);

        return response()->json($gasto);
    }

    public function destroy(Gasto $gasto): JsonResponse
    {
        $gasto->delete();

        return response()->json(['message' => 'Gasto eliminado.']);
    }
}
