<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function crearUsuario(string $rol = 'dueno', array $extra = []): Usuario
    {
        return Usuario::create(array_merge([
            'nombre' => 'Test '.$rol,
            'telefono' => '809'.random_int(1000000, 9999999),
            'email' => $rol.random_int(1, 9999).'@klika.do',
            'password' => Hash::make('Klika2024!'),
            'rol' => $rol,
            'activo' => true,
        ], $extra));
    }

    public function test_login_por_telefono_devuelve_token(): void
    {
        $u = $this->crearUsuario('dueno', ['telefono' => '8091110001']);

        $res = $this->postJson('/api/auth/login', [
            'login' => '8091110001',
            'password' => 'Klika2024!',
        ]);

        $res->assertOk()
            ->assertJsonStructure(['token', 'usuario' => ['id', 'nombre', 'rol']])
            ->assertJsonPath('usuario.rol', 'dueno');
    }

    public function test_login_por_email_funciona(): void
    {
        $this->crearUsuario('secretaria', ['email' => 'sec@klika.do']);

        $this->postJson('/api/auth/login', ['login' => 'sec@klika.do', 'password' => 'Klika2024!'])
            ->assertOk();
    }

    public function test_login_con_password_incorrecta_falla(): void
    {
        $this->crearUsuario('dueno', ['telefono' => '8090000000']);

        $this->postJson('/api/auth/login', ['login' => '8090000000', 'password' => 'malo'])
            ->assertStatus(422);
    }

    public function test_usuario_inactivo_no_entra(): void
    {
        $this->crearUsuario('aplicador', ['telefono' => '8090000001', 'activo' => false]);

        $this->postJson('/api/auth/login', ['login' => '8090000001', 'password' => 'Klika2024!'])
            ->assertStatus(422);
    }

    public function test_ruta_protegida_sin_token_da_401(): void
    {
        $this->getJson('/api/dashboard')->assertStatus(401);
    }

    public function test_aplicador_no_puede_crear_usuarios(): void
    {
        Sanctum::actingAs($this->crearUsuario('aplicador'));

        $this->postJson('/api/usuarios', [
            'nombre' => 'X', 'telefono' => '8091234567', 'password' => '123456', 'rol' => 'aplicador',
        ])->assertStatus(403);
    }

    public function test_dueno_si_puede_crear_usuarios(): void
    {
        Sanctum::actingAs($this->crearUsuario('dueno'));

        $this->postJson('/api/usuarios', [
            'nombre' => 'Nuevo', 'telefono' => '8097654321', 'password' => '123456', 'rol' => 'secretaria',
        ])->assertStatus(201);

        $this->assertDatabaseHas('usuarios', ['telefono' => '8097654321', 'rol' => 'secretaria']);
    }

    public function test_me_devuelve_usuario_autenticado(): void
    {
        $u = $this->crearUsuario('supervisor');
        Sanctum::actingAs($u);

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('usuario.id', $u->id)
            ->assertJsonPath('usuario.rol', 'supervisor');
    }
}
