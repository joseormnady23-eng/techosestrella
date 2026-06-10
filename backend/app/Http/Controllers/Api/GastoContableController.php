<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GastoContable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GastoContableController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = GastoContable::with(['obra:id,codigo', 'registrador:id,nombre']);

        if ($request->filled('periodo')) {
            // YYYY-MM
            [$ano, $mes] = explode('-', $request->periodo);
            $q->whereYear('fecha', $ano)->whereMonth('fecha', $mes);
        }

        return response()->json($q->latest('fecha')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validar($request);
        $gasto = GastoContable::create($data + ['registrado_por' => $request->user()->id]);

        return response()->json($gasto, 201);
    }

    public function update(Request $request, GastoContable $gasto): JsonResponse
    {
        $gasto->update($this->validar($request, true));

        return response()->json($gasto);
    }

    public function destroy(GastoContable $gasto): JsonResponse
    {
        $gasto->delete();

        return response()->json(['message' => 'Gasto eliminado.']);
    }

    private function validar(Request $request, bool $parcial = false): array
    {
        $req = $parcial ? 'sometimes' : 'required';

        return $request->validate([
            'categoria' => [$req, 'string', 'max:50'],
            'descripcion' => [$req, 'string', 'max:200'],
            'monto' => [$req, 'numeric', 'min:0'],
            'itbis_pagado' => ['nullable', 'numeric', 'min:0'],
            'fecha' => [$req, 'date'],
            'proveedor' => ['nullable', 'string', 'max:150'],
            'rnc_proveedor' => ['nullable', 'string', 'max:20'],
            'ncf_proveedor' => ['nullable', 'string', 'max:19'],
            'obra_id' => ['nullable', 'exists:obras,id'],
            'comprobante_tipo' => ['nullable', 'string', 'max:3'],
            'pagado_con' => ['nullable', 'string', 'max:30'],
            'adjunto' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
