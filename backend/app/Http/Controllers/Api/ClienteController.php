<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Cliente::query();

        if ($request->filled('buscar')) {
            $b = $request->buscar;
            $q->where(fn ($w) => $w->where('nombre', 'like', "%$b%")
                ->orWhere('telefono', 'like', "%$b%")
                ->orWhere('rnc_cedula', 'like', "%$b%"));
        }
        if ($request->filled('tipo')) {
            $q->where('tipo', $request->tipo);
        }
        if (! $request->boolean('incluir_inactivos')) {
            $q->where('activo', true);
        }

        return response()->json($q->orderBy('nombre')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validar($request);
        $cliente = Cliente::create($data);

        return response()->json($cliente, 201);
    }

    public function show(Cliente $cliente): JsonResponse
    {
        return response()->json($cliente->load(['obras' => fn ($q) => $q->latest()]));
    }

    public function update(Request $request, Cliente $cliente): JsonResponse
    {
        $cliente->update($this->validar($request, $cliente->id));

        return response()->json($cliente);
    }

    /** Desactivar (no se borra). */
    public function destroy(Cliente $cliente): JsonResponse
    {
        $cliente->update(['activo' => false]);

        return response()->json(['message' => 'Cliente desactivado.']);
    }

    public function reactivar(Cliente $cliente): JsonResponse
    {
        $cliente->update(['activo' => true]);

        return response()->json($cliente);
    }

    private function validar(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'nombre' => [$id ? 'sometimes' : 'required', 'string', 'max:150'],
            'tipo' => ['sometimes', Rule::in(['persona', 'empresa'])],
            'telefono' => [$id ? 'sometimes' : 'required', 'string', 'max:20'],
            'telefono_alt' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:150'],
            'direccion' => ['nullable', 'string'],
            'ciudad' => ['nullable', 'string', 'max:80'],
            'rnc_cedula' => ['nullable', 'string', 'max:20'],
            'notas' => ['nullable', 'string'],
            'activo' => ['sometimes', 'boolean'],
        ]);
    }
}
