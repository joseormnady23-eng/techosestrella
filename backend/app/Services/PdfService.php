<?php

namespace App\Services;

use App\Models\Configuracion;
use App\Models\Cotizacion;
use App\Models\Factura;
use App\Models\Obra;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as PdfInstance;

/**
 * Generación de documentos PDF (cotización, factura, expediente de garantía).
 * Usa barryvdh/laravel-dompdf con la identidad de la empresa desde configuración.
 */
class PdfService
{
    public function cotizacion(Cotizacion $cotizacion): PdfInstance
    {
        $cotizacion->load(['items', 'obra', 'cliente']);

        return Pdf::loadView('pdf.cotizacion', [
            'config' => Configuracion::actual(),
            'cotizacion' => $cotizacion,
        ])->setPaper('letter');
    }

    public function factura(Factura $factura): PdfInstance
    {
        $factura->load(['items', 'cliente', 'obra']);

        return Pdf::loadView('pdf.factura', [
            'config' => Configuracion::actual(),
            'factura' => $factura,
        ])->setPaper('letter');
    }

    public function garantia(Obra $obra): PdfInstance
    {
        $obra->load(['cliente', 'garantia', 'secciones', 'fotos' => fn ($q) => $q->where('tipo', 'despues')]);

        return Pdf::loadView('pdf.garantia', [
            'config' => Configuracion::actual(),
            'obra' => $obra,
            'garantia' => $obra->garantia,
        ])->setPaper('letter');
    }
}
