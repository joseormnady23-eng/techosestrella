<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS — Klika
    |--------------------------------------------------------------------------
    | Autenticación por token Bearer (Sanctum), no por cookies, así que no se
    | requiere `supports_credentials`. Orígenes permitidos: el frontend ERP y
    | el portal del cliente / PWA de campo. Ajusta para producción.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'portal/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:8765',   // frontend ERP (python http.server)
        'http://127.0.0.1:8765',
        'http://localhost:5173',   // por si se migra a Vite
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [
        '#^http://(localhost|127\.0\.0\.1)(:\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Disposition'],

    'max_age' => 0,

    'supports_credentials' => false,

];
