<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pago;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PagoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Pago::with('obra:id,codigo,titulo');
        if ($request->filled('obra_id')) {
            $q->where('obra_id', $request->obra_id);
        }

        return response()->json($q->latest('fecha')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'obra_id' => ['required', 'exists:obras,id'],
            'monto' => ['required', 'numeric', 'min:0.01'],
            'fecha' => ['required', 'date'],
            'metodo' => ['nullable', 'string', 'max:30'],
            'nota' => ['nullable', 'string', 'max:200'],
        ]);

        return response()->json(Pago::create($data), 201);
    }

    public function update(Request $request, Pago $pago): JsonResponse
    {
        $data = $request->validate([
            'monto' => ['sometimes', 'numeric', 'min:0.01'],
            'fecha' => ['sometimes', 'date'],
            'metodo' => ['nullable', 'string', 'max:30'],
            'nota' => ['nullable', 'string', 'max:200'],
        ]);

        $pago->update($data);

        return response()->json($pago);
    }

    public function destroy(Pago $pago): JsonResponse
    {
        $pago->delete();

        return response()->json(['message' => 'Pago eliminado.']);
    }
}
