<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MaterialController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Material::query();

        if ($request->filled('buscar')) {
            $b = $request->buscar;
            $q->where(fn ($w) => $w->where('nombre', 'like', "%$b%")->orWhere('codigo_barras', 'like', "%$b%"));
        }
        if ($request->filled('categoria')) {
            $q->where('categoria', $request->categoria);
        }
        if ($request->filled('estado')) {
            // bajo | ok
            $request->estado === 'bajo'
                ? $q->bajoMinimo()
                : $q->whereColumn('stock_actual', '>', 'stock_minimo');
        }

        return response()->json($q->orderBy('nombre')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validar($request);
        return response()->json(Material::create($data), 201);
    }

    public function show(Material $material): JsonResponse
    {
        return response()->json($material->load(['movimientos' => fn ($q) => $q->latest('fecha')->limit(50)]));
    }

    public function update(Request $request, Material $material): JsonResponse
    {
        $material->update($this->validar($request, $material->id));

        return response()->json($material);
    }

    public function destroy(Material $material): JsonResponse
    {
        $material->delete();

        return response()->json(['message' => 'Material eliminado.']);
    }

    /** Busca un material por su código de barras (para el escáner). */
    public function buscarCodigo(string $codigo): JsonResponse
    {
        $material = Material::where('codigo_barras', $codigo)->first();

        return $material
            ? response()->json($material)
            : response()->json(['message' => 'No se encontró un material con ese código.'], 404);
    }

    /** Genera un código de barras único para un material. */
    public function generarCodigo(Material $material): JsonResponse
    {
        do {
            $codigo = '750'.str_pad((string) random_int(0, 9999999999), 10, '0', STR_PAD_LEFT);
        } while (Material::where('codigo_barras', $codigo)->exists());

        $material->update(['codigo_barras' => $codigo, 'tipo_codigo' => 'CODE128']);

        return response()->json($material);
    }

    private function validar(Request $request, ?int $id = null): array
    {
        $unique = $id ? "unique:materiales,codigo_barras,$id" : 'unique:materiales,codigo_barras';

        return $request->validate([
            'nombre' => [$id ? 'sometimes' : 'required', 'string', 'max:150'],
            'categoria' => [$id ? 'sometimes' : 'required', 'string', 'max:50'],
            'unidad' => [$id ? 'sometimes' : 'required', 'string', 'max:15'],
            'rendimiento' => ['nullable', 'numeric', 'min:0'],
            'rendimiento_unidad' => ['nullable', 'string', 'max:20'],
            'stock_actual' => ['sometimes', 'numeric'],
            'stock_minimo' => ['sometimes', 'numeric', 'min:0'],
            'costo_promedio' => ['sometimes', 'numeric', 'min:0'],
            'es_herramienta' => ['sometimes', 'boolean'],
            'codigo_barras' => ['nullable', 'string', 'max:50', $unique],
            'tipo_codigo' => ['sometimes', 'string', 'max:10'],
        ]);
    }
}
