<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Uso en rutas: ->middleware('role:dueno,secretaria')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        if (! $user->activo) {
            return response()->json(['message' => 'Usuario desactivado.'], 403);
        }

        if (! empty($roles) && ! in_array($user->rol, $roles, true)) {
            return response()->json([
                'message' => 'No tienes permiso para esta acción.',
                'rol_requerido' => $roles,
                'rol_actual' => $user->rol,
            ], 403);
        }

        return $next($request);
    }
}
