import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();
    
    // Revisamos si el admin ya existe para no duplicarlo
    const existe = await Usuario.findOne({ email: "admin@logisystem.com" });
    if (existe) {
      return NextResponse.json({ mensaje: "El usuario admin ya existe en la BD." });
    }

    // Encriptamos la contraseña "123456" de forma segura aquí mismo
    const hashedPassword = await bcrypt.hash("123456", 10);
    
    const nuevoAdmin = await Usuario.create({
      nombre: "Admin Global",
      rut: "11.111.111-1",
      email: "admin@logisystem.com",
      password: hashedPassword,
      cargo: "ADMIN",
      isActivo: true
    });

    return NextResponse.json({ 
      mensaje: "¡Administrador creado con éxito!", 
      admin: nuevoAdmin.email 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creando admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}