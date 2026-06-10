<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeriadoRd;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeriadoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = FeriadoRd::query();
        if ($request->filled('ano')) {
            $q->where('ano', $request->ano);
        }

        return response()->json($q->orderBy('fecha')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fecha' => ['required', 'date', 'unique:feriados_rd,fecha'],
            'nombre' => ['required', 'string', 'max:100'],
            'tipo' => ['sometimes', 'string', 'max:20'],
        ]);

        $data['ano'] = Carbon::parse($data['fecha'])->year;
        $data['tipo'] ??= 'especial';

        return response()->json(FeriadoRd::create($data), 201);
    }

    public function destroy(FeriadoRd $feriado): JsonResponse
    {
        $feriado->delete();

        return response()->json(['message' => 'Feriado eliminado.']);
    }
}
