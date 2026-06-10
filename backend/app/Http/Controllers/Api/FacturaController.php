<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use App\Models\Factura;
use App\Services\EcfService;
use App\Services\PdfService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class FacturaController extends Controller
{
    public function __construct(private readonly EcfService $ecf)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $q = Factura::with(['cliente:id,nombre', 'obra:id,codigo']);

        if ($request->filled('estado_ecf')) {
            $q->where('estado_ecf', $request->estado_ecf);
        }
        if ($request->boolean('solo_pendientes')) {
            $q->where('pagada', false)->where('anulada', false);
        }

        return response()->json($q->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cotizacion_id' => ['nullable', 'exists:cotizaciones,id'],
            'obra_id' => ['nullable', 'exists:obras,id'],
            'cliente_id' => ['nullable', 'exists:clientes,id'],
            'cliente_nombre' => ['nullable', 'string', 'max:150'],
            'cliente_rnc' => ['nullable', 'string', 'max:20'],
            'tipo_comprobante' => ['required', Rule::in(['B01', 'B02', 'B03', 'B04'])],
            'requiere_ecf' => ['sometimes', 'boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.descripcion' => ['required', 'string', 'max:200'],
            'items.*.cantidad' => ['required', 'numeric', 'min:0'],
            'items.*.unidad' => ['required', 'string', 'max:15'],
            'items.*.precio_unitario' => ['required', 'numeric', 'min:0'],
            'descuento' => ['nullable', 'numeric', 'min:0'],
            'notas' => ['nullable', 'string'],
        ]);

        $factura = DB::transaction(function () use ($data, $request) {
            $config = Configuracion::actual();
            $rate = (float) $config->itbis_porcentaje;

            $subtotal = 0;
            $itemsCalc = [];
            foreach ($data['items'] as $item) {
                $importe = round($item['cantidad'] * $item['precio_unitario'], 2);
                $importeItbis = round($importe * ($rate / 100), 2);
                $subtotal += $importe;
                $itemsCalc[] = $item + ['itbis_rate' => $rate, 'importe' => $importe, 'importe_itbis' => $importeItbis];
            }

            $descuento = (float) ($data['descuento'] ?? 0);
            $base = round($subtotal - $descuento, 2);
            $itbis = $config->itbis_activo ? round($base * ($rate / 100), 2) : 0;
            $total = round($base + $itbis, 2);

            $ncf = $this->ecf->siguienteNcf($data['tipo_comprobante']);

            $factura = Factura::create([
                'cotizacion_id' => $data['cotizacion_id'] ?? null,
                'obra_id' => $data['obra_id'] ?? null,
                'cliente_id' => $data['cliente_id'] ?? null,
                'cliente_nombre' => $data['cliente_nombre'] ?? null,
                'cliente_rnc' => $data['cliente_rnc'] ?? null,
                'tipo_comprobante' => $data['tipo_comprobante'],
                'ncf' => $ncf,
                'requiere_ecf' => $data['requiere_ecf'] ?? true,
                'estado_ecf' => 'pendiente',
                'fecha_emision' => now()->toDateString(),
                'subtotal' => $subtotal,
                'descuento' => $descuento,
                'base_imponible' => $base,
                'itbis' => $itbis,
                'total' => $total,
                'emitida_por' => $request->user()->id,
                'notas' => $data['notas'] ?? null,
            ]);

            foreach ($itemsCalc as $item) {
                $factura->items()->create($item);
            }

            return $factura;
        });

        return response()->json($factura->load('items'), 201);
    }

    public function show(Factura $factura): JsonResponse
    {
        return response()->json($factura->load(['items', 'pagos', 'cliente:id,nombre', 'obra:id,codigo']));
    }

    /** Descarga la factura/nota de crédito en PDF. */
    public function pdf(Factura $factura, PdfService $pdf): Response
    {
        return $pdf->factura($factura)->download('factura-'.$factura->ncf.'.pdf');
    }

    /** Envía la factura a la DGII (sandbox). */
    public function enviarDgii(Factura $factura): JsonResponse
    {
        $resultado = $this->ecf->enviarDgii($factura);

        return response()->json(array_merge($resultado, ['factura' => $factura->fresh()]));
    }

    /** Anula la factura emitiendo una nota de crédito B04. */
    public function anular(Factura $factura): JsonResponse
    {
        if ($factura->anulada) {
            return response()->json(['message' => 'La factura ya está anulada.'], 422);
        }

        $nota = $this->ecf->anular($factura);

        return response()->json(['message' => 'Factura anulada con nota de crédito.', 'nota_credito' => $nota->load('items')]);
    }

    /** Registra un pago (parcial o total) sobre la factura. */
    public function pagos(Request $request, Factura $factura): JsonResponse
    {
        $data = $request->validate([
            'monto' => ['required', 'numeric', 'min:0.01'],
            'fecha' => ['required', 'date'],
            'metodo' => ['required', 'string', 'max:30'],
            'referencia' => ['nullable', 'string', 'max:100'],
            'nota' => ['nullable', 'string', 'max:200'],
        ]);

        $pago = $factura->pagos()->create($data + ['registrado_por' => $request->user()->id]);

        $pagado = $factura->pagos()->sum('monto');
        if ($pagado >= $factura->total) {
            $factura->update(['pagada' => true]);
        }

        return response()->json(['pago' => $pago, 'pagada' => $factura->fresh()->pagada], 201);
    }
}
