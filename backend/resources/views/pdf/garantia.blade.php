<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
    * { font-family: DejaVu Sans, sans-serif; }
    body { color: #1A1A1A; font-size: 11px; margin: 0; }
    .head { text-align: center; border-bottom: 3px solid {{ $config->color_primario }}; padding-bottom: 12px; margin-bottom: 18px; }
    .empresa { font-size: 18px; font-weight: bold; color: {{ $config->color_primario }}; }
    .muted { color: #8A8A8A; font-size: 10px; }
    .title { font-size: 22px; font-weight: bold; text-align: center; margin: 18px 0 6px; color: #1A1A1A; }
    .num { text-align: center; color: {{ $config->color_primario }}; font-weight: bold; margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; }
    .info td { padding: 5px 6px; border-bottom: 1px solid #E5E7EB; }
    .info .lbl { color: #8A8A8A; width: 35%; font-size: 10px; }
    .section { margin-top: 18px; }
    .section h3 { color: {{ $config->color_primario }}; font-size: 12px; border-bottom: 1px solid #B5B5B5; padding-bottom: 4px; }
    .big { font-size: 16px; font-weight: bold; }
    .foot { margin-top: 50px; font-size: 9px; color: #8A8A8A; border-top: 1px solid #E5E7EB; padding-top: 8px; }
    .firma { margin-top: 60px; }
    .firma td { text-align: center; padding-top: 30px; border-top: 1px solid #1A1A1A; font-size: 10px; }
</style>
</head>
<body>
<div class="head">
    <div class="empresa">{{ $config->empresa_nombre }}</div>
    <div class="muted">
        @if($config->empresa_rnc) RNC: {{ $config->empresa_rnc }} · @endif
        {{ $config->empresa_telefono }} · {{ $config->empresa_direccion }}
    </div>
</div>

<div class="title">CERTIFICADO DE GARANTÍA</div>
<div class="num">No. {{ $garantia->numero_garantia }}</div>

<table class="info">
    <tr><td class="lbl">Cliente</td><td>{{ $obra->cliente->nombre ?? '—' }}</td></tr>
    <tr><td class="lbl">Obra</td><td>{{ $obra->codigo }} — {{ $obra->titulo }}</td></tr>
    <tr><td class="lbl">Dirección</td><td>{{ $obra->direccion_obra }}</td></tr>
    <tr><td class="lbl">Cobertura</td><td class="big">{{ $garantia->anios_cobertura }} {{ $garantia->anios_cobertura == 1 ? 'año' : 'años' }}</td></tr>
    <tr><td class="lbl">Vigencia</td><td>{{ $garantia->fecha_inicio?->format('d/m/Y') }} — {{ $garantia->fecha_fin?->format('d/m/Y') }}</td></tr>
    @if($garantia->material_referencia)
    <tr><td class="lbl">Material aplicado</td><td>{{ $garantia->material_referencia }}</td></tr>
    @endif
</table>

@if($obra->secciones->count())
<div class="section">
    <h3>Áreas cubiertas</h3>
    <table>
        @foreach($obra->secciones as $s)
        <tr><td style="padding:3px 6px">{{ $s->nombre }}</td><td style="padding:3px 6px" class="muted">{{ number_format($s->metros_cuadrados, 2) }} m² · {{ ucfirst($s->condicion) }}</td></tr>
        @endforeach
    </table>
</div>
@endif

<div class="section">
    <h3>Cobertura</h3>
    <p>{{ $garantia->cobertura ?? 'Cubre defectos de aplicación e impermeabilización en las áreas trabajadas durante el período indicado.' }}</p>
</div>

<div class="section">
    <h3>Condiciones</h3>
    <p style="white-space: pre-line">{{ $garantia->condiciones ?? $config->garantia_condiciones_default ?? 'La garantía no cubre daños por causas ajenas a la aplicación (golpes, modificaciones, fenómenos naturales extremos, falta de mantenimiento).' }}</p>
</div>

<table class="firma">
    <tr>
        <td style="width:45%">{{ $config->empresa_nombre }}</td>
        <td style="width:10%"></td>
        <td style="width:45%">Cliente</td>
    </tr>
</table>

<div class="foot">
    Documento emitido el {{ now()->format('d/m/Y') }}. Conserve este certificado; será requerido para cualquier reclamación.
</div>
</body>
</html>
