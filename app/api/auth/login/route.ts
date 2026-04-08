// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
// Importante: instalar bcryptjs para las contraseñas -> npm install bcryptjs
import bcrypt from 'bcryptjs'; 

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // Verificar contraseña hasheada
    const isMatch = await bcrypt.compare(password, usuario.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    if (!usuario.isActivo) {
       return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });
    }

    // Aquí normalmente generarías un JWT o usarías NextAuth para la sesión.
    // Para simplificar, devolvemos el usuario sin el password.
    const userData = {
      id: usuario._id,
      nombre: usuario.nombre,
      cargo: usuario.cargo
    };

    return NextResponse.json({ mensaje: "Login exitoso", usuario: userData }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}