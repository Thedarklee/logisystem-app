// src/app/api/access/rfid/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tarjeta from '@/models/Tarjeta'; // Asume que creaste este modelo
import Usuario from '@/models/Usuario';
import LecturaAcceso from '@/models/LecturaAcceso';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { codigoRFID, dispositivoId } = body;

    if (!codigoRFID) {
      return NextResponse.json({ error: "Falta código RFID" }, { status: 400 });
    }

    // 1. Buscar la tarjeta en la BD
    const tarjeta = await Tarjeta.findOne({ codigoRFID, estado: 'ASIGNADA' });
    
    if (!tarjeta) {
      // HU10: Registrar fallo si la tarjeta no existe o no está asignada
      await LecturaAcceso.create({
        tipoMovimiento: 'ENTRADA', // Por defecto en fallos
        metodo: 'AUTOMATICO',
        estado: 'FALLIDO',
        dispositivoId,
        observaciones: `Intento fallido con RFID: ${codigoRFID}`
      });
      return NextResponse.json({ error: "Tarjeta no válida", status: "FALLIDO" }, { status: 403 });
    }

    // 2. Buscar al usuario dueño de esa tarjeta
    const usuario = await Usuario.findOne({ tarjetaId: tarjeta._id });
    
    if (!usuario || !usuario.isActivo) {
      return NextResponse.json({ error: "Usuario inactivo o no encontrado" }, { status: 403 });
    }

    // 3. Determinar si es Entrada o Salida
    // Buscamos el último registro exitoso de este usuario
    const ultimoRegistro = await LecturaAcceso.findOne({ 
        'conductor.usuarioId': usuario._id,
        estado: 'EXITOSO'
    }).sort({ fechaHora: -1 });

    // Si el último fue ENTRADA, ahora es SALIDA. Si no hay registro o fue SALIDA, ahora es ENTRADA.
    const tipoMovimiento = (ultimoRegistro && ultimoRegistro.tipoMovimiento === 'ENTRADA') ? 'SALIDA' : 'ENTRADA';

    // 4. Crear el registro final
    const nuevoAcceso = await LecturaAcceso.create({
      tipoMovimiento,
      metodo: 'AUTOMATICO',
      estado: 'EXITOSO',
      conductor: {
        usuarioId: usuario._id,
        nombre: usuario.nombre
      },
      // Nota: Aquí podrías añadir lógica para buscar el vehículo asignado al usuario
      dispositivoId,
      observaciones: "Acceso automático vía ESP32"
    });

    // 5. Responder al ESP32 (Puedes usar 'nombre' para mostrar en una pantalla LCD)
    return NextResponse.json({ 
      mensaje: "Acceso registrado", 
      movimiento: tipoMovimiento,
      conductor: usuario.nombre,
      status: "EXITOSO"
    }, { status: 200 });

  } catch (error) {
    console.error("Error en API RFID:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}