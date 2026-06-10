<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Obra;
use App\Models\ObraSeccion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ObraSeccionController extends Controller
{
    public function index(Obra $obra): JsonResponse
    {
        return response()->json($obra->secciones);
    }

    public function store(Request $request, Obra $obra): JsonResponse
    {
        $data = $this->validar($request);
        $seccion = $obra->secciones()->create($data);

        return response()->json($seccion, 201);
    }

    public function update(Request $request, ObraSeccion $seccion): JsonResponse
    {
        $seccion->update($this->validar($request, true));

        return response()->json($seccion);
    }

    public function destroy(ObraSeccion $seccion): JsonResponse
    {
        $seccion->delete();

        return response()->json(['message' => 'Sección eliminada.']);
    }

    private function validar(Request $request, bool $parcial = false): array
    {
        $req = $parcial ? 'sometimes' : 'required';

        return $request->validate([
            'nombre' => [$req, 'string', 'max:100'],
            'metros_cuadrados' => [$req, 'numeric', 'min:0'],
            'condicion' => [$req, Rule::in(['bueno', 'regular', 'danado'])],
            'factor_desperdicio' => ['sometimes', 'numeric', 'min:1'],
            'etapa' => ['nullable', 'integer'],
            'notas' => ['nullable', 'string', 'max:200'],
        ]);
    }
}
