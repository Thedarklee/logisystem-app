export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tarjeta from '@/models/Tarjeta';
import Usuario from '@/models/Usuario';
import LecturaAcceso from '@/models/LecturaAcceso';
import Envio from '@/models/Envio';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // El Arduino SOLO envía el UID, no envía RUT ni patente
    const { uid } = body;

    // 1. Validación básica
    if (!uid) {
      return NextResponse.json({ error: "UID no proporcionado" }, { status: 400 });
    }

    const uidLimpio = uid.toUpperCase().trim();

    // 2. Buscamos la Tarjeta y verificamos su estado
    const tarjeta = await Tarjeta.findOne({ uid: uidLimpio });
    if (!tarjeta) {
      return NextResponse.json({ error: "Tarjeta no registrada en el sistema" }, { status: 404 });
    }

    if (tarjeta.estado !== 'ACTIVA') {
      return NextResponse.json({ error: `Acceso denegado: Tarjeta ${tarjeta.estado}` }, { status: 403 });
    }

    // 3. Buscamos a quién le pertenece (Conductor)
    if (!tarjeta.usuarioAsignado) {
      return NextResponse.json({ error: "Tarjeta sin conductor asignado" }, { status: 403 });
    }
    const conductor = await Usuario.findById(tarjeta.usuarioAsignado);

    if (!conductor) {
       return NextResponse.json({ error: "El conductor asignado a la tarjeta no existe" }, { status: 404 });
    }

    // ----------------------------------------------------------------------
    // 🧠 EL NUEVO CEREBRO: Buscamos el Vehículo a través del Envío
    // ----------------------------------------------------------------------
    const envioActivo = await Envio.findOne({
      'recursos.conductorId': conductor._id,
      estado: { $in: ['PROGRAMADO', 'EN_RUTA'] }
    });

    if (!envioActivo) {
      return NextResponse.json({ 
        error: "Acceso denegado: El conductor no tiene una ruta asignada y en progreso para hoy." 
      }, { status: 403 });
    }

    // Extraemos la patente y el ID del vehículo directamente desde el Envío
    const vehiculoId = envioActivo.recursos.vehiculoId;
    const patente = envioActivo.recursos.patente;

    // ----------------------------------------------------------------------
    // Lógica de deducción de Entrada/Salida
    // ----------------------------------------------------------------------
    const ultimoMovimiento = await LecturaAcceso.findOne({ 'vehiculo.vehiculoId': vehiculoId })
                                                .sort({ fechaHora: -1 });

    const movimientoDeducido = (ultimoMovimiento && ultimoMovimiento.tipoMovimiento === 'ENTRADA') 
                               ? 'SALIDA' 
                               : 'ENTRADA';

    // 4. Registramos el Acceso con los datos cruzados
    await LecturaAcceso.create({
      tipoMovimiento: movimientoDeducido,
      metodo: 'AUTOMATICO', // Indicamos que fue por RFID
      estado: 'EXITOSO',
      conductor: {
        usuarioId: conductor._id,
        nombre: conductor.nombre,
        rut: conductor.rut // <-- ✨ ¡AQUÍ ESTÁ LA MAGIA AÑADIDA! ✨
      },
      vehiculo: {
        vehiculoId: vehiculoId,
        patente: patente
      },
      observaciones: `Asociado automáticamente al envío: ${envioActivo.numeroEnvio}`
    });

    // ----------------------------------------------------------------------
    // 🚀 MAGIA LOGÍSTICA: Actualizamos el estado del Envío automáticamente
    // ----------------------------------------------------------------------
    if (movimientoDeducido === 'SALIDA' && envioActivo.estado === 'PROGRAMADO') {
      envioActivo.estado = 'EN_RUTA';
      envioActivo.logistica.fechaSalidaEstimada = new Date(); 
      await envioActivo.save();
    } else if (movimientoDeducido === 'ENTRADA' && envioActivo.estado === 'EN_RUTA') {
      envioActivo.estado = 'FINALIZADO';
      envioActivo.logistica.fechaCierreReal = new Date(); 
      await envioActivo.save();
    }

    // 5. Le respondemos al ESP32 que todo salió bien (para que prenda la luz verde)
    return NextResponse.json({ 
      mensaje: "Acceso autorizado", 
      movimiento: movimientoDeducido,
      conductor: conductor.nombre,
      envioAsociado: envioActivo.numeroEnvio
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error en sensor RFID:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}