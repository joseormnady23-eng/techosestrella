<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Usuario::query();

        if ($request->filled('rol')) {
            $q->where('rol', $request->rol);
        }
        if ($request->filled('buscar')) {
            $b = $request->buscar;
            $q->where(fn ($w) => $w->where('nombre', 'like', "%$b%")->orWhere('telefono', 'like', "%$b%"));
        }
        if ($request->boolean('incluir_inactivos') === false && ! $request->has('incluir_inactivos')) {
            // por defecto muestra todos
        }

        return response()->json($q->orderBy('nombre')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:120'],
            'telefono' => ['required', 'string', 'max:20', 'unique:usuarios,telefono'],
            'email' => ['nullable', 'email', 'max:150', 'unique:usuarios,email'],
            'password' => ['required', 'string', 'min:6'],
            'rol' => ['required', Rule::in(['dueno', 'secretaria', 'supervisor', 'aplicador'])],
            'activo' => ['boolean'],
        ]);

        $data['password'] = Hash::make($data['password']);
        $usuario = Usuario::create($data);

        return response()->json($usuario, 201);
    }

    public function show(Usuario $usuario): JsonResponse
    {
        return response()->json($usuario->load('empleadoInfo'));
    }

    public function update(Request $request, Usuario $usuario): JsonResponse
    {
        $data = $request->validate([
            'nombre' => ['sometimes', 'string', 'max:120'],
            'telefono' => ['sometimes', 'string', 'max:20', Rule::unique('usuarios', 'telefono')->ignore($usuario->id)],
            'email' => ['nullable', 'email', 'max:150', Rule::unique('usuarios', 'email')->ignore($usuario->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'rol' => ['sometimes', Rule::in(['dueno', 'secretaria', 'supervisor', 'aplicador'])],
            'activo' => ['sometimes', 'boolean'],
        ]);

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $usuario->update($data);

        return response()->json($usuario);
    }

    /** Desactivar (no se borra). */
    public function destroy(Usuario $usuario): JsonResponse
    {
        $usuario->update(['activo' => false]);
        $usuario->tokens()->delete();

        return response()->json(['message' => 'Usuario desactivado.']);
    }
}
