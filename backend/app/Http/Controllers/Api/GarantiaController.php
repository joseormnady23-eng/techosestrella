<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Garantia;
use App\Models\Obra;
use App\Services\PdfService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GarantiaController extends Controller
{
    public function show(Obra $obra): JsonResponse
    {
        return response()->json($obra->garantia);
    }

    /** Crea o actualiza la garantía de una obra (plazo editable por el dueño). */
    public function upsert(Request $request, Obra $obra): JsonResponse
    {
        $data = $request->validate([
            'anios_cobertura' => ['required', 'integer', 'min:1', 'max:50'],
            'fecha_inicio' => ['nullable', 'date'],
            'cobertura' => ['nullable', 'string'],
            'condiciones' => ['nullable', 'string'],
            'material_referencia' => ['nullable', 'string', 'max:150'],
        ]);

        $inicio = Carbon::parse($data['fecha_inicio'] ?? now());
        $fin = $inicio->copy()->addYears($data['anios_cobertura']);

        $garantia = Garantia::updateOrCreate(
            ['obra_id' => $obra->id],
            [
                'numero_garantia' => $obra->garantia?->numero_garantia ?? $this->siguienteNumero(),
                'anios_cobertura' => $data['anios_cobertura'],
                'fecha_inicio' => $inicio->toDateString(),
                'fecha_fin' => $fin->toDateString(),
                'cobertura' => $data['cobertura'] ?? null,
                'condiciones' => $data['condiciones'] ?? null,
                'material_referencia' => $data['material_referencia'] ?? null,
            ],
        );

        return response()->json($garantia);
    }

    /** Descarga el certificado de garantía en PDF. */
    public function pdf(Obra $obra, PdfService $pdf): Response
    {
        if (! $obra->garantia) {
            return response()->json(['message' => 'Esta obra no tiene garantía registrada.'], 404);
        }

        return $pdf->garantia($obra)->download('garantia-'.$obra->garantia->numero_garantia.'.pdf');
    }

    /** Datos del expediente de garantía para generar el PDF. */
    public function expediente(Obra $obra): JsonResponse
    {
        $obra->load(['cliente', 'garantia', 'secciones', 'fotos' => fn ($q) => $q->where('tipo', 'despues')]);

        if (! $obra->garantia) {
            return response()->json(['message' => 'Esta obra no tiene garantía registrada.'], 404);
        }

        return response()->json([
            'obra' => $obra->only(['id', 'codigo', 'titulo', 'direccion_obra']),
            'cliente' => $obra->cliente?->only(['nombre', 'telefono', 'direccion']),
            'garantia' => $obra->garantia,
            'secciones' => $obra->secciones,
            'fotos_finales' => $obra->fotos,
        ]);
    }

    private function siguienteNumero(): string
    {
        $ultimo = Garantia::max('id') ?? 0;

        return 'GAR-'.str_pad((string) ($ultimo + 1), 5, '0', STR_PAD_LEFT);
    }
}
