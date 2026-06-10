<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $usuarios = [
            ['nombre' => 'José Ormandy (Dueño)', 'telefono' => '8091110001', 'email' => 'dueno@klika.do', 'rol' => 'dueno'],
            ['nombre' => 'Secretaria',           'telefono' => '8091110002', 'email' => 'secretaria@klika.do', 'rol' => 'secretaria'],
            ['nombre' => 'Supervisor',            'telefono' => '8091110003', 'email' => 'supervisor@klika.do', 'rol' => 'supervisor'],
            ['nombre' => 'Aplicador',             'telefono' => '8091110004', 'email' => null,                  'rol' => 'aplicador'],
        ];

        foreach ($usuarios as $u) {
            Usuario::updateOrCreate(
                ['telefono' => $u['telefono']],
                [
                    'nombre' => $u['nombre'],
                    'email' => $u['email'],
                    'password' => Hash::make('Klika2024!'),
                    'rol' => $u['rol'],
                    'activo' => true,
                ],
            );
        }
    }
}
