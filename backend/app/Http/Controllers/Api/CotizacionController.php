<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cotizacion;
use App\Services\CotizadorService;
use App\Services\PdfService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class CotizacionController extends Controller
{
    public function __construct(private readonly CotizadorService $cotizador)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $q = Cotizacion::with(['obra:id,codigo,titulo', 'cliente:id,nombre']);

        if ($request->filled('obra_id')) {
            $q->where('obra_id', $request->obra_id);
        }
        if ($request->filled('estado')) {
            $q->where('estado', $request->estado);
        }

        return response()->json($q->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'obra_id' => ['nullable', 'exists:obras,id'],
            'tipo' => ['sometimes', Rule::in(['obra', 'independiente'])],
            'cliente_id' => ['nullable', 'exists:clientes,id'],
            'cliente_nombre' => ['nullable', 'string', 'max:150'],
            'valida_hasta' => ['nullable', 'date'],
            'notas' => ['nullable', 'string'],
        ]);

        $data['tipo'] ??= $data['obra_id'] ? 'obra' : 'independiente';
        $cotizacion = Cotizacion::create($data);

        return response()->json($cotizacion, 201);
    }

    public function show(Cotizacion $cotizacion): JsonResponse
    {
        return response()->json($cotizacion->load(['items', 'obra:id,codigo,titulo', 'cliente:id,nombre']));
    }

    /** Descarga la cotización en PDF. */
    public function pdf(Cotizacion $cotizacion, PdfService $pdf): Response
    {
        return $pdf->cotizacion($cotizacion)
            ->download('cotizacion-'.str_pad($cotizacion->id, 5, '0', STR_PAD_LEFT).'.pdf');
    }

    public function update(Request $request, Cotizacion $cotizacion): JsonResponse
    {
        $data = $request->validate([
            'estado' => ['sometimes', Rule::in(['borrador', 'enviada', 'aprobada', 'rechazada'])],
            'valida_hasta' => ['nullable', 'date'],
            'notas' => ['nullable', 'string'],
            'enviada_por' => ['nullable', Rule::in(['whatsapp', 'correo'])],
        ]);

        if (! empty($data['enviada_por'])) {
            $data['enviada_en'] = now();
            $data['estado_cliente'] = 'enviada';
            $data['estado'] = 'enviada';
        }

        $cotizacion->update($data);

        return response()->json($cotizacion);
    }

    public function destroy(Cotizacion $cotizacion): JsonResponse
    {
        $cotizacion->delete();

        return response()->json(['message' => 'Cotización eliminada.']);
    }

    /** Vista previa del cálculo (no persiste). Devuelve ítems con desglose + totales. */
    public function calcular(Request $request): JsonResponse
    {
        $payload = $this->validarCalculo($request);

        return response()->json($this->cotizador->preview($payload['items'], $payload['opts']));
    }

    /** Aplica (persiste) los ítems congelando factor/rendimiento, y guarda los totales. */
    public function aplicar(Request $request, Cotizacion $cotizacion): JsonResponse
    {
        $payload = $this->validarCalculo($request);
        $cotizacion = $this->cotizador->aplicar($cotizacion, $payload['items'], $payload['opts']);

        return response()->json($cotizacion->load('items'));
    }

    private function validarCalculo(Request $request): array
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.descripcion' => ['required', 'string', 'max:200'],
            'items.*.obra_seccion_id' => ['nullable', 'exists:obra_secciones,id'],
            'items.*.material_id' => ['nullable', 'exists:materiales,id'],
            'items.*.metros_cuadrados' => ['nullable', 'numeric', 'min:0'],
            'items.*.manos' => ['nullable', 'integer', 'min:1'],
            'items.*.factor_desperdicio' => ['nullable', 'numeric', 'min:1'],
            'items.*.rendimiento_usado' => ['nullable', 'numeric', 'min:0'],
            'items.*.cantidad' => ['nullable', 'numeric', 'min:0'],
            'items.*.unidad' => ['nullable', 'string', 'max:15'],
            'items.*.precio_unitario' => ['required', 'numeric', 'min:0'],
            'descuento_tipo' => ['nullable', Rule::in(['porcentaje', 'monto', 'ninguno'])],
            'descuento_valor' => ['nullable', 'numeric', 'min:0'],
            'itbis_activo' => ['nullable', 'boolean'],
        ]);

        return [
            'items' => $data['items'],
            'opts' => [
                'descuento_tipo' => $data['descuento_tipo'] ?? 'ninguno',
                'descuento_valor' => $data['descuento_valor'] ?? 0,
                'itbis_activo' => $data['itbis_activo'] ?? null,
            ],
        ];
    }
}
