// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import bcrypt from 'bcryptjs'; 

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // 1. Verificar que recibimos datos
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
        return NextResponse.json({ error: "Faltan datos en el cuerpo de la petición" }, { status: 400 });
    }

    // 2. Buscar usuario (con depuración de email)
    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });

    if (!usuario) {
      return NextResponse.json({ 
        error: `Usuario no encontrado. Busqué: "${email}"` 
      }, { status: 401 });
    }

    // 3. Verificar contraseña con depuración
    const isMatch = await bcrypt.compare(password, usuario.password);

    if (!isMatch) {
      return NextResponse.json({ 
        error: `Clave incorrecta. Recibí: "${password}" (largo: ${password.length}). En BD el hash empieza con: ${usuario.password.substring(0, 10)}` 
      }, { status: 401 });
    }

    // 4. Verificar si está activo
    if (!usuario.isActivo) {
       return NextResponse.json({ error: "Usuario inactivo en la base de datos" }, { status: 403 });
    }

    // 🚨 5. EL NUEVO GUARDIA DE SEGURIDAD VIP 🚨
    if (usuario.cargo === 'CONDUCTOR') {
      return NextResponse.json({ 
        error: "Acceso denegado: Plataforma exclusiva para Administración y Operadores." 
      }, { status: 403 });
    }

    // 6. Login exitoso (Solo pasa si es ADMIN u OPERADOR)
    const userData = {
      id: usuario._id,
      nombre: usuario.nombre,
      cargo: usuario.cargo
    };

    return NextResponse.json({ mensaje: "Login exitoso", usuario: userData }, { status: 200 });

  } catch (error: any) {
    console.error("DEBUG LOGIN ERROR:", error);
    return NextResponse.json({ 
        error: "Error de servidor", 
        details: error.message 
    }, { status: 500 });
  }
}