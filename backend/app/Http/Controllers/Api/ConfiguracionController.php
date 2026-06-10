<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConfiguracionController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(Configuracion::actual());
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'empresa_nombre' => ['sometimes', 'string', 'max:150'],
            'empresa_rnc' => ['nullable', 'string', 'max:20'],
            'empresa_telefono' => ['nullable', 'string', 'max:20'],
            'empresa_direccion' => ['nullable', 'string'],
            'empresa_email' => ['nullable', 'email', 'max:150'],
            'empresa_logo' => ['nullable', 'string', 'max:255'],
            'itbis_activo' => ['sometimes', 'boolean'],
            'itbis_porcentaje' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'moneda' => ['sometimes', 'string', 'max:10'],
            'clima_umbral_apto' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'clima_umbral_precaucion' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'pdf_pie_pagina' => ['nullable', 'string'],
            'garantia_condiciones_default' => ['nullable', 'string'],
            'klika_logo' => ['nullable', 'string', 'max:255'],
            'color_primario' => ['sometimes', 'string', 'max:7'],
            'color_acento' => ['sometimes', 'string', 'max:7'],
        ]);

        $config = Configuracion::actual();
        $config->update($data);

        return response()->json($config);
    }
}
