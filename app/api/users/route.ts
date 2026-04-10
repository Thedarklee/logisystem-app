// src/app/api/users/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { nombre, rut, email, password, cargo } = body;

    // 1. Validaciones básicas
    if (!nombre || !email || !password || !rut) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    // 2. Verificar si el email ya está registrado
    const existe = await Usuario.findOne({ email: email.toLowerCase() });
    if (existe) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
    }

    // 3. Encriptar la contraseña (Genera el hash $2b$)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      rut,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      cargo: cargo || 'CONDUCTOR', // Valor por defecto
      isActivo: true
    });

    return NextResponse.json({ 
      mensaje: "Usuario creado exitosamente", 
      id: nuevoUsuario._id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: "Error interno del servidor", detalle: error.message }, { status: 500 });
  }

  
}
export async function GET() {
  try {
    await dbConnect();

    // 1. Quitamos los filtros para que traiga a TODOS (Admin, Operador, Conductor)
    // 2. Quitamos el .select() para que traiga TODOS los campos (email, isActivo, etc.)
    // 3. Agregamos .sort({ creadoEn: -1 }) para ver a los más nuevos primero
    const todosLosUsuarios = await Usuario.find().sort({ creadoEn: -1 }).lean();

    return NextResponse.json(todosLosUsuarios);
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error al cargar la lista de usuarios" }, 
      { status: 500 }
    );
  }
}