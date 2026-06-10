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
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; background: {{ $config->color_primario }}; color: #fff; font-size: 9px; }
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
                    @if($config->empresa_email) {{ $config->empresa_email }}<br>@endif
                    {{ $config->empresa_direccion }}
                </div>
            </td>
            <td style="width:40%" class="right">
                <div class="doc-title">COTIZACIÓN</div>
                <div class="muted">No. {{ str_pad($cotizacion->id, 5, '0', STR_PAD_LEFT) }} · v{{ $cotizacion->version }}</div>
                <div class="muted">{{ $cotizacion->created_at?->format('d/m/Y') }}</div>
                <span class="badge">{{ ucfirst($cotizacion->estado) }}</span>
            </td>
        </tr>
    </table>
</div>

<table class="meta">
    <tr>
        <td style="width:50%">
            <strong>Cliente</strong><br>
            {{ $cotizacion->cliente->nombre ?? $cotizacion->cliente_nombre ?? '—' }}<br>
            <span class="muted">{{ $cotizacion->cliente->telefono ?? '' }}</span>
        </td>
        <td style="width:50%">
            @if($cotizacion->obra)
                <strong>Obra</strong><br>
                {{ $cotizacion->obra->codigo }} — {{ $cotizacion->obra->titulo }}<br>
                <span class="muted">{{ $cotizacion->obra->direccion_obra }}</span>
            @endif
            @if($cotizacion->valida_hasta)
                <br><span class="muted">Válida hasta: {{ $cotizacion->valida_hasta->format('d/m/Y') }}</span>
            @endif
        </td>
    </tr>
</table>

<table class="items">
    <thead>
        <tr>
            <th style="width:38%">Descripción</th>
            <th class="right">m²</th>
            <th class="right">Manos</th>
            <th class="right">Factor</th>
            <th class="right">Cant.</th>
            <th>Und</th>
            <th class="right">Precio</th>
            <th class="right">Importe</th>
        </tr>
    </thead>
    <tbody>
        @foreach($cotizacion->items as $it)
        <tr>
            <td>{{ $it->descripcion }}</td>
            <td class="right">{{ $it->metros_cuadrados ? number_format($it->metros_cuadrados, 2) : '—' }}</td>
            <td class="right">{{ $it->metros_cuadrados ? $it->manos : '—' }}</td>
            <td class="right">{{ $it->metros_cuadrados ? number_format($it->factor_desperdicio, 2) : '—' }}</td>
            <td class="right">{{ number_format($it->cantidad, 2) }}</td>
            <td>{{ $it->unidad }}</td>
            <td class="right">{{ $m($it->precio_unitario) }}</td>
            <td class="right">{{ $m($it->importe) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<table class="totals">
    <tr><td>Subtotal</td><td class="right">{{ $m($cotizacion->subtotal) }}</td></tr>
    @if($cotizacion->descuento_aplicado > 0)
    <tr><td>Descuento</td><td class="right">- {{ $m($cotizacion->descuento_aplicado) }}</td></tr>
    <tr><td>Base imponible</td><td class="right">{{ $m($cotizacion->base_imponible) }}</td></tr>
    @endif
    @if($cotizacion->itbis > 0)
    <tr><td>ITBIS ({{ rtrim(rtrim(number_format($config->itbis_porcentaje,2),'0'),'.') }}%)</td><td class="right">{{ $m($cotizacion->itbis) }}</td></tr>
    @endif
    <tr class="grand"><td>TOTAL</td><td class="right">{{ $m($cotizacion->total) }}</td></tr>
</table>

<div class="foot">
    {{ $config->pdf_pie_pagina ?? 'Gracias por confiar en '.$config->empresa_nombre.'. Esta cotización es un estimado sujeto a inspección.' }}
</div>
</body>
</html>
