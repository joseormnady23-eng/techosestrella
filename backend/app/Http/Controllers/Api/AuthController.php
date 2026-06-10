<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login por teléfono o correo + contraseña. Devuelve token Sanctum + usuario.
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'login' => ['required', 'string'],      // teléfono o email
            'password' => ['required', 'string'],
            'device' => ['nullable', 'string'],
        ]);

        $campo = filter_var($data['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'telefono';

        $usuario = Usuario::where($campo, $data['login'])->first();

        if (! $usuario || ! Hash::check($data['password'], $usuario->password)) {
            throw ValidationException::withMessages([
                'login' => ['Las credenciales no coinciden.'],
            ]);
        }

        if (! $usuario->activo) {
            throw ValidationException::withMessages([
                'login' => ['Este usuario está desactivado. Contacta al dueño.'],
            ]);
        }

        $token = $usuario->createToken($data['device'] ?? 'klika')->plainTextToken;

        return response()->json([
            'token' => $token,
            'usuario' => $this->perfil($usuario),
        ]);
    }

    /**
     * Revoca el token actual.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada.']);
    }

    /**
     * Usuario autenticado con su rol.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(['usuario' => $this->perfil($request->user())]);
    }

    private function perfil(Usuario $usuario): array
    {
        return [
            'id' => $usuario->id,
            'nombre' => $usuario->nombre,
            'telefono' => $usuario->telefono,
            'email' => $usuario->email,
            'rol' => $usuario->rol,
            'activo' => $usuario->activo,
        ];
    }
}
