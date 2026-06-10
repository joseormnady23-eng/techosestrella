<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeriadoRd;
use App\Models\VacacionAusencia;
use App\Services\VacacionesService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AusenciaController extends Controller
{
    public function __construct(private readonly VacacionesService $vacaciones)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $q = VacacionAusencia::with(['usuario:id,nombre', 'revisor:id,nombre']);

        // Aplicador/supervisor solo ven las propias; dueño/secretaria ven todas.
        if (! $user->tieneRol('dueno', 'secretaria')) {
            $q->where('usuario_id', $user->id);
        } elseif ($request->filled('estado')) {
            $q->where('estado', $request->estado);
        }

        return response()->json($q->latest('solicitado_en')->get());
    }

    /** Cualquier usuario solicita una ausencia para sí mismo. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tipo' => ['required', Rule::in(['vacaciones', 'permiso', 'enfermedad', 'personal', 'otro'])],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'motivo' => ['nullable', 'string', 'max:200'],
        ]);

        $inicio = Carbon::parse($data['fecha_inicio']);
        $fin = Carbon::parse($data['fecha_fin']);

        $ausencia = VacacionAusencia::create([
            'usuario_id' => $request->user()->id,
            'tipo' => $data['tipo'],
            'fecha_inicio' => $inicio->toDateString(),
            'fecha_fin' => $fin->toDateString(),
            'dias_habiles' => $this->vacaciones->diasHabiles($inicio, $fin),
            'motivo' => $data['motivo'] ?? null,
            'estado' => 'pendiente',
            'solicitado_en' => now(),
        ]);

        return response()->json($ausencia, 201);
    }

    /** Aprueba (solo dueño). Verifica conflictos con obras antes. */
    public function aprobar(Request $request, VacacionAusencia $ausencia): JsonResponse
    {
        $conflictos = $this->vacaciones->conflictosConObras(
            $ausencia->usuario,
            $ausencia->fecha_inicio,
            $ausencia->fecha_fin,
        );

        if (! empty($conflictos) && ! $request->boolean('forzar')) {
            return response()->json([
                'message' => 'Hay obras programadas que se cruzan con estas fechas. Reenvía con forzar=true para aprobar igual.',
                'conflictos' => $conflictos,
            ], 409);
        }

        $ausencia->update([
            'estado' => 'aprobado',
            'revisado_por' => $request->user()->id,
            'revisado_en' => now(),
        ]);

        return response()->json(['message' => 'Ausencia aprobada.', 'ausencia' => $ausencia, 'conflictos' => $conflictos]);
    }

    /** Rechaza (solo dueño). Requiere motivo. */
    public function rechazar(Request $request, VacacionAusencia $ausencia): JsonResponse
    {
        $data = $request->validate(['motivo_rechazo' => ['required', 'string', 'max:200']]);

        $ausencia->update([
            'estado' => 'rechazado',
            'motivo_rechazo' => $data['motivo_rechazo'],
            'revisado_por' => $request->user()->id,
            'revisado_en' => now(),
        ]);

        return response()->json(['message' => 'Ausencia rechazada.', 'ausencia' => $ausencia]);
    }

    /** Calendario del mes: ausencias aprobadas + feriados. */
    public function calendario(Request $request): JsonResponse
    {
        $mes = $request->input('mes', now()->format('Y-m'));
        [$ano, $m] = explode('-', $mes);

        $ausencias = VacacionAusencia::with('usuario:id,nombre')
            ->where('estado', 'aprobado')
            ->where(function ($q) use ($ano, $m) {
                $q->whereYear('fecha_inicio', $ano)->whereMonth('fecha_inicio', $m)
                    ->orWhere(fn ($w) => $w->whereYear('fecha_fin', $ano)->whereMonth('fecha_fin', $m));
            })->get();

        $feriados = FeriadoRd::whereYear('fecha', $ano)->whereMonth('fecha', $m)->get();

        return response()->json(['mes' => $mes, 'ausencias' => $ausencias, 'feriados' => $feriados]);
    }
}
