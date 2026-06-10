<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
    * { font-family: DejaVu Sans, sans-serif; }
    body { color: #1A1A1A; font-size: 11px; margin: 0; }
    .head { border-bottom: 3px solid {{ $config->color_primario }}; padding-bottom: 10px; margin-bottom: 16px; }
    .empresa { font-size: 17px; font-weight: bold; color: {{ $config->color_primario }}; }
    .muted { color: #8A8A8A; font-size: 10px; }
    .doc-title { font-size: 15px; font-weight: bold; text-align: right; }
    .ncf { font-size: 12px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; }
    .meta td { padding: 2px 0; vertical-align: top; }
    .items { margin-top: 14px; }
    .items th { background: #F5F6F8; text-align: left; padding: 6px; font-size: 10px; border-bottom: 2px solid #B5B5B5; }
    .items td { padding: 6px; border-bottom: 1px solid #E5E7EB; font-size: 10px; }
    .right { text-align: right; }
    .totals { margin-top: 12px; width: 45%; float: right; }
    .totals td { padding: 4px 6px; }
    .totals .grand { font-weight: bold; font-size: 13px; color: {{ $config->color_primario }}; border-top: 2px solid #1A1A1A; }
    .foot { clear: both; margin-top: 40px; font-size: 9px; color: #8A8A8A; border-top: 1px solid #E5E7EB; padding-top: 8px; }
    .anulada { color: #E03030; font-weight: bold; border: 2px solid #E03030; padding: 4px 10px; display: inline-block; }
</style>
</head>
<body>
@php $m = fn($v) => 'RD$ ' . number_format((float)$v, 2); @endphp

<div class="head">
    <table>
        <tr>
            <td style="width:60%">
                <div class="empresa">{{ $config->empresa_nombre }}</div>
                <div class="muted">
                    @if($config->empresa_rnc) RNC: {{ $config->empresa_rnc }}<br>@endif
                    @if($config->empresa_telefono) Tel: {{ $config->empresa_telefono }}<br>@endif
                    {{ $config->empresa_direccion }}
                </div>
            </td>
            <td style="width:40%" class="right">
                <div class="doc-title">{{ $factura->tipo_comprobante === 'B04' ? 'NOTA DE CRÉDITO' : 'FACTURA' }}</div>
                <div class="ncf">NCF: {{ $factura->ncf }}</div>
                @if($factura->ncf_modificado)<div class="muted">Modifica: {{ $factura->ncf_modificado }}</div>@endif
                <div class="muted">Emisión: {{ $factura->fecha_emision?->format('d/m/Y') }}</div>
                @if($factura->anulada)<div style="margin-top:6px"><span class="anulada">ANULADA</span></div>@endif
            </td>
        </tr>
    </table>
</div>

<table class="meta">
    <tr>
        <td>
            <strong>Cliente:</strong> {{ $factura->cliente->nombre ?? $factura->cliente_nombre ?? '—' }}<br>
            @if($factura->cliente_rnc)<span class="muted">RNC/Cédula: {{ $factura->cliente_rnc }}</span>@endif
        </td>
    </tr>
</table>

<table class="items">
    <thead>
        <tr>
            <th style="width:50%">Descripción</th>
            <th class="right">Cant.</th>
            <th>Und</th>
            <th class="right">Precio</th>
            <th class="right">ITBIS</th>
            <th class="right">Importe</th>
        </tr>
    </thead>
    <tbody>
        @foreach($factura->items as $it)
        <tr>
            <td>{{ $it->descripcion }}</td>
            <td class="right">{{ number_format($it->cantidad, 2) }}</td>
            <td>{{ $it->unidad }}</td>
            <td class="right">{{ $m($it->precio_unitario) }}</td>
            <td class="right">{{ $m($it->importe_itbis) }}</td>
            <td class="right">{{ $m($it->importe) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<table class="totals">
    <tr><td>Subtotal</td><td class="right">{{ $m($factura->subtotal) }}</td></tr>
    @if($factura->descuento > 0)<tr><td>Descuento</td><td class="right">- {{ $m($factura->descuento) }}</td></tr>@endif
    <tr><td>Base imponible</td><td class="right">{{ $m($factura->base_imponible) }}</td></tr>
    <tr><td>ITBIS</td><td class="right">{{ $m($factura->itbis) }}</td></tr>
    <tr class="grand"><td>TOTAL</td><td class="right">{{ $m($factura->total) }}</td></tr>
</table>

<div class="foot">
    {{ $config->pdf_pie_pagina ?? 'Comprobante fiscal electrónico (e-CF) emitido por '.$config->empresa_nombre.'.' }}
</div>
</body>
</html>
