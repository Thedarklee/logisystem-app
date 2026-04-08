export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tarjeta from '@/models/Tarjeta';
import Usuario from '@/models/Usuario';
import Vehiculo from '@/models/Vehiculo';
import LecturaAcceso from '@/models/LecturaAcceso';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // El Arduino enviará el UID de la tarjeta y si es entrada o salida
    const { uid, tipoMovimiento } = body;

    if (!uid) {
      return NextResponse.json({ error: "UID no proporcionado" }, { status: 400 });
    }

    const uidLimpio = uid.toUpperCase().trim();

    // 1. Buscamos la Tarjeta
    const tarjeta = await Tarjeta.findOne({ uid: uidLimpio });
    if (!tarjeta) {
      return NextResponse.json({ error: "Tarjeta no registrada en el sistema" }, { status: 404 });
    }

    // 2. Verificamos que no esté bloqueada
    if (tarjeta.estado !== 'ACTIVA') {
      return NextResponse.json({ error: `Acceso denegado: Tarjeta ${tarjeta.estado}` }, { status: 403 });
    }

    // 3. Buscamos a quién le pertenece (Conductor)
    if (!tarjeta.usuarioAsignado) {
      return NextResponse.json({ error: "Tarjeta sin conductor asignado" }, { status: 403 });
    }
    const conductor = await Usuario.findById(tarjeta.usuarioAsignado);

    // 4. Buscamos el vehículo de ese conductor
    const vehiculo = await Vehiculo.findOne({ conductorAsignado: conductor._id });
    if (!vehiculo) {
      return NextResponse.json({ error: "Conductor sin vehículo asignado" }, { status: 403 });
    }

    // 5. ¡Todo en orden! Registramos el acceso automáticamente
    await LecturaAcceso.create({
      tipoMovimiento: tipoMovimiento || 'ENTRADA', // Por defecto ENTRADA si el Arduino no lo manda
      metodo: 'RFID',
      estado: 'EXITOSO',
      conductor: {
        usuarioId: conductor._id,
        nombre: conductor.nombre
      },
      vehiculo: {
        vehiculoId: vehiculo._id,
        patente: vehiculo.patente
      }
    });

    // 6. Le respondemos al ESP32 que todo salió bien (para que prenda la luz verde)
    return NextResponse.json({ 
      mensaje: "Acceso autorizado", 
      conductor: conductor.nombre 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error en sensor RFID:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}