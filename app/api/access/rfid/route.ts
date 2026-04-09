export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tarjeta from '@/models/Tarjeta';
import Usuario from '@/models/Usuario';
import Vehiculo from '@/models/Vehiculo';
import LecturaAcceso from '@/models/LecturaAcceso';
import Envio from '@/models/Envio'; // IMPORTANTE: Agregamos el modelo de Envío

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { uid } = body;

    if (!uid) return NextResponse.json({ error: "UID no proporcionado" }, { status: 400 });
    const uidLimpio = uid.toUpperCase().trim();

    // 1 y 2. Buscamos Tarjeta y Verificamos Estado
    const tarjeta = await Tarjeta.findOne({ uid: uidLimpio });
    if (!tarjeta) return NextResponse.json({ error: "Tarjeta no registrada" }, { status: 404 });
    if (tarjeta.estado !== 'ACTIVA') return NextResponse.json({ error: `Tarjeta ${tarjeta.estado}` }, { status: 403 });

    // 3. Buscamos al Conductor
    if (!tarjeta.usuarioAsignado) return NextResponse.json({ error: "Tarjeta sin conductor" }, { status: 403 });
    const conductor = await Usuario.findById(tarjeta.usuarioAsignado);

    // ----------------------------------------------------------------------
    // 🧠 EL NUEVO CEREBRO: Buscamos el Vehículo a través del Envío
    // Buscamos si el conductor tiene un envío 'PROGRAMADO' (para salir) o 'EN_RUTA' (para volver)
    // ----------------------------------------------------------------------
    const envioActivo = await Envio.findOne({
      'recursos.conductorId': conductor._id,
      estado: { $in: ['PROGRAMADO', 'EN_RUTA'] }
    });

    if (!envioActivo) {
      return NextResponse.json({ 
        error: "Acceso denegado: El conductor no tiene una ruta asignada para hoy." 
      }, { status: 403 });
    }

    // Extraemos la patente y el ID del vehículo directamente desde el Envío
    const vehiculoId = envioActivo.recursos.vehiculoId;
    const patente = envioActivo.recursos.patente;

    // ----------------------------------------------------------------------
    // Lógica de deducción de Entrada/Salida
    // ----------------------------------------------------------------------
    const ultimoMovimiento = await LecturaAcceso.findOne({ 'vehiculo.vehiculoId': vehiculoId }).sort({ fechaHora: -1 });
    const movimientoDeducido = (ultimoMovimiento && ultimoMovimiento.tipoMovimiento === 'ENTRADA') ? 'SALIDA' : 'ENTRADA';

    // 4. Registramos el Acceso con los datos cruzados
    await LecturaAcceso.create({
      tipoMovimiento: movimientoDeducido,
      metodo: 'AUTOMATICO',
      estado: 'EXITOSO',
      conductor: { usuarioId: conductor._id, nombre: conductor.nombre },
      vehiculo: { vehiculoId: vehiculoId, patente: patente },
      observaciones: `Asociado al envío ${envioActivo.numeroEnvio}`
    });

    // ----------------------------------------------------------------------
    // 🚀 MAGIA LOGÍSTICA: Actualizamos el estado del Envío automáticamente
    // ----------------------------------------------------------------------
    if (movimientoDeducido === 'SALIDA' && envioActivo.estado === 'PROGRAMADO') {
      envioActivo.estado = 'EN_RUTA';
      envioActivo.logistica.fechaSalidaReal = new Date(); // Opcional
      await envioActivo.save();
    } else if (movimientoDeducido === 'ENTRADA' && envioActivo.estado === 'EN_RUTA') {
      envioActivo.estado = 'FINALIZADO';
      envioActivo.logistica.fechaCierreReal = new Date();
      await envioActivo.save();
    }

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