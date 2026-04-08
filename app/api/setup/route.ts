import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();
    
    // Generamos el hash nuevo compatible ($2b$)
    const hashedPassword = await bcrypt.hash("123456", 10);
    
    // Usamos findOneAndUpdate con upsert: true
    // Esto buscará al admin y REEMPLAZARÁ su clave. Si no existe, lo crea.
    const adminActualizado = await Usuario.findOneAndUpdate(
      { email: "admin@logisystem.com" }, 
      { 
        nombre: "Admin Global",
        rut: "11.111.111-1",
        password: hashedPassword, // AQUÍ SE SOBREESCRIBE LA CLAVE VIEJA
        cargo: "ADMIN",
        isActivo: true
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ 
      mensaje: "¡CONTRASEÑA RESETEADA! Ahora la clave es 123456", 
      admin: adminActualizado.email,
      hash_generado: adminActualizado.password.substring(0, 10) // Solo para confirmar que empiece con $2b$
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error reseteando admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}