<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Obra;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ObraController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Obra::with(['cliente:id,nombre', 'cuadrilla:id,nombre', 'supervisor:id,nombre']);

        // El aplicador solo ve obras de sus cuadrillas.
        $user = $request->user();
        if ($user->esAplicador()) {
            $cuadrillaIds = $user->cuadrillas()->pluck('cuadrillas.id');
            $q->whereIn('cuadrilla_id', $cuadrillaIds);
        }

        if ($request->filled('estado')) {
            $q->where('estado', $request->estado);
        }
        if ($request->filled('buscar')) {
            $b = $request->buscar;
            $q->where(fn ($w) => $w->where('titulo', 'like', "%$b%")->orWhere('codigo', 'like', "%$b%"));
        }

        return response()->json($q->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cliente_id' => ['required', 'exists:clientes,id'],
            'titulo' => ['required', 'string', 'max:150'],
            'direccion_obra' => ['nullable', 'string'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
            'maps_url' => ['nullable', 'string', 'max:255'],
            'metros_cuadrados' => ['nullable', 'numeric', 'min:0'],
            'estado' => ['sometimes', Rule::in(['cotizada', 'aprobada', 'en_proceso', 'pausada', 'terminada', 'cancelada'])],
            'cuadrilla_id' => ['nullable', 'exists:cuadrillas,id'],
            'supervisor_id' => ['nullable', 'exists:usuarios,id'],
            'fecha_inicio_estimada' => ['nullable', 'date'],
            'fecha_fin_estimada' => ['nullable', 'date'],
            'notas' => ['nullable', 'string'],
        ]);

        $data['codigo'] = $this->siguienteCodigo();
        $data['estado'] ??= 'cotizada';

        $obra = Obra::create($data);

        return response()->json($obra->load('cliente:id,nombre'), 201);
    }

    public function show(Obra $obra): JsonResponse
    {
        return response()->json($obra->load([
            'cliente', 'cuadrilla.miembros:id,nombre', 'supervisor:id,nombre',
            'secciones', 'garantia', 'cotizaciones' => fn ($q) => $q->latest(),
            'fotos', 'dias.clima',
        ]));
    }

    public function update(Request $request, Obra $obra): JsonResponse
    {
        $data = $request->validate([
            'cliente_id' => ['sometimes', 'exists:clientes,id'],
            'titulo' => ['sometimes', 'string', 'max:150'],
            'direccion_obra' => ['nullable', 'string'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
            'maps_url' => ['nullable', 'string', 'max:255'],
            'metros_cuadrados' => ['nullable', 'numeric', 'min:0'],
            'estado' => ['sometimes', Rule::in(['cotizada', 'aprobada', 'en_proceso', 'pausada', 'terminada', 'cancelada'])],
            'cuadrilla_id' => ['nullable', 'exists:cuadrillas,id'],
            'supervisor_id' => ['nullable', 'exists:usuarios,id'],
            'fecha_inicio_estimada' => ['nullable', 'date'],
            'fecha_fin_estimada' => ['nullable', 'date'],
            'fecha_inicio_real' => ['nullable', 'date'],
            'fecha_fin_real' => ['nullable', 'date'],
            'notas' => ['nullable', 'string'],
        ]);

        $obra->update($data);

        return response()->json($obra);
    }

    public function destroy(Obra $obra): JsonResponse
    {
        $obra->delete();

        return response()->json(['message' => 'Obra eliminada.']);
    }

    /** Activa/desactiva la visibilidad de la ubicación para aplicadores, con registro. */
    public function ubicacionVisible(Request $request, Obra $obra): JsonResponse
    {
        $data = $request->validate(['visible' => ['required', 'boolean']]);

        $obra->update([
            'ubicacion_visible' => $data['visible'],
            'ubicacion_habilitada_por' => $request->user()->id,
            'ubicacion_habilitada_en' => now(),
        ]);

        return response()->json($obra->load('ubicacionHabilitadaPor:id,nombre'));
    }

    private function siguienteCodigo(): string
    {
        $ultimo = Obra::withTrashed()->max('id') ?? 0;

        return 'OB-'.str_pad((string) ($ultimo + 1), 4, '0', STR_PAD_LEFT);
    }
}
