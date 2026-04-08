export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tarjeta from '@/models/Tarjeta';
import Usuario from '@/models/Usuario';

// --- REGISTRAR NUEVA TARJETA ---
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { uid, usuarioAsignado, estado } = await req.json();

    // 1. Validación básica
    if (!uid) {
      return NextResponse.json({ error: "El UID del sensor es obligatorio" }, { status: 400 });
    }

    const uidLimpio = uid.toUpperCase().trim();

    // 2. Verificar que nadie más tenga este Tag físico
    const existeTag = await Tarjeta.findOne({ uid: uidLimpio });
    if (existeTag) {
      return NextResponse.json({ error: "Este código RFID ya está registrado en el sistema" }, { status: 400 });
    }

    // 3. Crear la tarjeta en la base de datos
    const nuevaTarjeta = await Tarjeta.create({
      uid: uidLimpio,
      usuarioAsignado: usuarioAsignado || null,
      estado: estado || 'ACTIVA'
    });

    // 4. (MAGIA) Si elegiste un conductor, le guardamos esta tarjeta en su perfil
    if (usuarioAsignado) {
      await Usuario.findByIdAndUpdate(usuarioAsignado, { 
        tarjetaId: nuevaTarjeta._id 
      });
    }

    return NextResponse.json({ 
      mensaje: "Tarjeta vinculada exitosamente", 
      id: nuevaTarjeta._id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error al registrar tarjeta:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- OBTENER LISTA DE TARJETAS ---
export async function GET() {
  try {
    await dbConnect();
    
    // Traemos todas las tarjetas y usamos .populate para ver el nombre del dueño
    const tarjetas = await Tarjeta.find()
      .populate('usuarioAsignado', 'nombre rut')
      .lean();

    return NextResponse.json(tarjetas);
  } catch (error: any) {
    return NextResponse.json({ error: "Error al cargar el inventario de RFID" }, { status: 500 });
  }
}