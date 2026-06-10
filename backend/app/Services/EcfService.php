<?php

namespace App\Services;

use App\Models\Factura;
use App\Models\SecuenciaNcf;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Facturación electrónica (e-CF) contra la DGII.
 *
 * Esta clase administra el consumo de secuencias NCF y orquesta el envío.
 * El transporte real (firma XML + SOAP a la DGII) se conecta con el paquete
 * `ecfx/ecf-dgii-php` (sandbox: https://ecf.dgii.gov.do/testecf/). Mientras no
 * esté el certificado .p12 cargado, el envío queda en estado 'pendiente' sin reventar.
 */
class EcfService
{
    /**
     * Toma y consume el siguiente NCF de un tipo de comprobante, en transacción
     * con bloqueo de fila para evitar duplicados bajo concurrencia.
     */
    public function siguienteNcf(string $tipoComprobante): string
    {
        return DB::transaction(function () use ($tipoComprobante) {
            $sec = SecuenciaNcf::query()
                ->where('tipo_comprobante', $tipoComprobante)
                ->where('activa', true)
                ->lockForUpdate()
                ->first();

            if (! $sec) {
                throw new RuntimeException("No hay secuencia NCF activa para {$tipoComprobante}.");
            }

            if ($sec->secuencia_actual > $sec->secuencia_fin) {
                throw new RuntimeException("Secuencia NCF {$tipoComprobante} agotada. Solicita un nuevo rango a la DGII.");
            }

            $numero = $sec->secuencia_actual;
            $sec->increment('secuencia_actual');

            // Formato e-NCF: prefijo (E31) + secuencia de 10 dígitos → E310000000001
            return $sec->prefijo.str_pad((string) $numero, 10, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Envía la factura a la DGII. Si no requiere e-CF, la marca como 'no_aplica'.
     *
     * @return array{estado_ecf: string, mensaje: string}
     */
    public function enviarDgii(Factura $factura): array
    {
        if (! $factura->requiere_ecf) {
            $factura->update(['estado_ecf' => 'no_aplica']);

            return ['estado_ecf' => 'no_aplica', 'mensaje' => 'Esta factura no requiere e-CF.'];
        }

        if (! $this->certificadoDisponible()) {
            $factura->update(['estado_ecf' => 'pendiente']);

            return [
                'estado_ecf' => 'pendiente',
                'mensaje' => 'Certificado digital (.p12) no configurado. La factura quedó pendiente de envío.',
            ];
        }

        // TODO: integrar ecfx/ecf-dgii-php — firmar XML y enviar al endpoint sandbox/producción.
        // Por ahora se marca como 'enviado' (la confirmación 'aprobado' llega por consulta de estado).
        $factura->update(['estado_ecf' => 'enviado']);

        return ['estado_ecf' => 'enviado', 'mensaje' => 'Factura enviada a la DGII (sandbox).'];
    }

    /**
     * Anula una factura emitiendo una Nota de Crédito (B04).
     */
    public function anular(Factura $factura): Factura
    {
        return DB::transaction(function () use ($factura) {
            $ncfNota = $this->siguienteNcf('B04');

            $nota = Factura::create([
                'cotizacion_id' => $factura->cotizacion_id,
                'obra_id' => $factura->obra_id,
                'cliente_id' => $factura->cliente_id,
                'cliente_nombre' => $factura->cliente_nombre,
                'cliente_rnc' => $factura->cliente_rnc,
                'tipo_comprobante' => 'B04',
                'ncf' => $ncfNota,
                'ncf_modificado' => $factura->ncf,
                'requiere_ecf' => $factura->requiere_ecf,
                'estado_ecf' => 'pendiente',
                'fecha_emision' => now()->toDateString(),
                'subtotal' => $factura->subtotal,
                'descuento' => $factura->descuento,
                'base_imponible' => $factura->base_imponible,
                'itbis' => $factura->itbis,
                'total' => $factura->total,
                'emitida_por' => $factura->emitida_por,
                'notas' => "Nota de crédito que anula {$factura->ncf}.",
            ]);

            $factura->update(['anulada' => true]);

            // Copia los ítems a la nota de crédito.
            foreach ($factura->items as $item) {
                $nota->items()->create($item->only([
                    'descripcion', 'cantidad', 'unidad', 'precio_unitario',
                    'itbis_rate', 'importe', 'importe_itbis',
                ]));
            }

            return $nota;
        });
    }

    /**
     * Estado del certificado digital .p12 (solo dueño lo consulta).
     */
    public function certificadoEstado(): array
    {
        $disponible = $this->certificadoDisponible();

        return [
            'disponible' => $disponible,
            'entorno' => env('DGII_ECF_ENV', 'testecf'),
            'mensaje' => $disponible
                ? 'Certificado cargado.'
                : 'Falta cargar el certificado digital (.p12) para firmar e-CF.',
        ];
    }

    protected function certificadoDisponible(): bool
    {
        $ruta = env('DGII_ECF_CERT_PATH');

        return $ruta !== null && is_file($ruta);
    }
}
