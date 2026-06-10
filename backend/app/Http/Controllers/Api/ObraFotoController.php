<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Obra;
use App\Models\ObraFoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ObraFotoController extends Controller
{
    public function index(Obra $obra): JsonResponse
    {
        return response()->json($obra->fotos()->with('usuario:id,nombre')->latest('tomada_en')->get());
    }

    /** Sube una foto de evidencia (aplicador a sus obras). */
    public function store(Request $request, Obra $obra): JsonResponse
    {
        $data = $request->validate([
            'foto' => ['required', 'image', 'max:10240'],
            'tipo' => ['required', Rule::in(['antes', 'durante', 'despues', 'problema', 'otro'])],
            'descripcion' => ['nullable', 'string', 'max:200'],
            'obra_dia_id' => ['nullable', 'exists:obra_dias,id'],
        ]);

        $ruta = $request->file('foto')->store("obras/{$obra->id}", 'public');

        $foto = $obra->fotos()->create([
            'obra_dia_id' => $data['obra_dia_id'] ?? null,
            'usuario_id' => $request->user()->id,
            'ruta' => $ruta,
            'tipo' => $data['tipo'],
            'descripcion' => $data['descripcion'] ?? null,
            'visible_cliente' => false,
            'tomada_en' => now(),
        ]);

        return response()->json($foto, 201);
    }

    /** Interruptor de visibilidad para el cliente (secretaria/supervisor). */
    public function visibleCliente(Request $request, ObraFoto $foto): JsonResponse
    {
        $data = $request->validate(['visible' => ['required', 'boolean']]);
        $foto->update(['visible_cliente' => $data['visible']]);

        return response()->json($foto);
    }

    public function destroy(ObraFoto $foto): JsonResponse
    {
        $foto->delete();

        return response()->json(['message' => 'Foto eliminada.']);
    }
}
