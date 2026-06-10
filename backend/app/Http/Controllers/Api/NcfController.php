<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SecuenciaNcf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NcfController extends Controller
{
    public function index(): JsonResponse
    {
        $secuencias = SecuenciaNcf::orderBy('tipo_comprobante')->get()
            ->map(fn ($s) => array_merge($s->toArray(), ['disponibles' => $s->disponibles()]));

        return response()->json($secuencias);
    }

    public function update(Request $request, SecuenciaNcf $secuencia): JsonResponse
    {
        $data = $request->validate([
            'prefijo' => ['sometimes', 'string', 'max:11'],
            'secuencia_actual' => ['sometimes', 'integer', 'min:1'],
            'secuencia_fin' => ['sometimes', 'integer', 'min:1', 'gte:secuencia_actual'],
            'activa' => ['sometimes', 'boolean'],
        ]);

        $secuencia->update($data);

        return response()->json(array_merge($secuencia->toArray(), ['disponibles' => $secuencia->disponibles()]));
    }
}
