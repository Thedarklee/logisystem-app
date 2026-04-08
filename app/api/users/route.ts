// src/app/api/users/route.ts
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

    // Buscamos a los usuarios que tengan el cargo "CONDUCTOR"
    // .select() nos permite traer solo la info necesaria para el dropdown
    const conductores = await Usuario.find({ 
      cargo: 'CONDUCTOR', 
      isActivo: true 
    }).select('nombre rut');

    return NextResponse.json(conductores);
  } catch (error: any) {
    console.error("Error al obtener conductores:", error);
    return NextResponse.json(
      { error: "Error al cargar la lista de conductores" }, 
      { status: 500 }
    );
  }
}