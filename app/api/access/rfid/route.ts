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
    const { uid } = body;

    // 1. Validación básica (Si no hay UID, rechazamos sin guardar nada)
    if (!uid) {
      return NextResponse.json({ error: "UID no proporcionado" }, { status: 400 });
    }

    const uidLimpio = uid.toUpperCase().trim();

    // 2. Buscamos la Tarjeta
    const tarjeta = await Tarjeta.findOne({ uid: uidLimpio });
    if (!tarjeta) {
      return NextResponse.json({ error: "Tarjeta no registrada" }, { status: 404 });
    }

    if (tarjeta.estado !== 'ACTIVA') {
      return NextResponse.json({ error: "Tarjeta bloqueada o inactiva" }, { status: 403 });
    }

    // 3. Buscamos al Conductor
    if (!tarjeta.usuarioAsignado) {
      return NextResponse.json({ error: "Tarjeta sin conductor" }, { status: 403 });
    }
    
    const conductor = await Usuario.findById(tarjeta.usuarioAsignado);
    if (!conductor) {
      return NextResponse.json({ error: "Conductor fantasma" }, { status: 404 });
    }

    // 4. Verificamos el Envío (El Cerebro)
    const envioActivo = await Envio.findOne({
      'recursos.conductorId': conductor._id,
      estado: { $in: ['PROGRAMADO', 'EN_RUTA'] }
    });

    if (!envioActivo) {
      return NextResponse.json({ error: "Sin ruta asignada" }, { status: 403 });
    }

    // Extraemos datos para el registro exitoso
    const vehiculoId = envioActivo.recursos.vehiculoId;
    const patente = envioActivo.recursos.patente;

    // Lógica de Entrada/Salida
    const ultimoMovimiento = await LecturaAcceso.findOne({ 'vehiculo.vehiculoId': vehiculoId }).sort({ fechaHora: -1 });
    const movimientoDeducido = (ultimoMovimiento && ultimoMovimiento.tipoMovimiento === 'ENTRADA') ? 'SALIDA' : 'ENTRADA';

    // 5. ACCESO EXITOSO - (ESTE ES EL ÚNICO MOMENTO DONDE GUARDAMOS EN LA BD)
    await LecturaAcceso.create({
      tipoMovimiento: movimientoDeducido,
      metodo: 'AUTOMATICO', 
      estado: 'EXITOSO',
      conductor: {
        usuarioId: conductor._id,
        nombre: conductor.nombre,
        rut: conductor.rut
      },
      vehiculo: { vehiculoId: vehiculoId, patente: patente },
      observaciones: `Asociado automáticamente al envío: ${envioActivo.numeroEnvio}`
    });

    // Actualizamos estado logístico
    if (movimientoDeducido === 'SALIDA' && envioActivo.estado === 'PROGRAMADO') {
      envioActivo.estado = 'EN_RUTA';
      envioActivo.logistica.fechaSalidaEstimada = new Date(); 
      await envioActivo.save();
    } else if (movimientoDeducido === 'ENTRADA' && envioActivo.estado === 'EN_RUTA') {
      envioActivo.estado = 'FINALIZADO';
      envioActivo.logistica.fechaCierreReal = new Date(); 
      await envioActivo.save();
    }

    // Le damos luz verde al Arduino
    return NextResponse.json({ mensaje: "Acceso autorizado", movimiento: movimientoDeducido, conductor: conductor.nombre }, { status: 201 });

  } catch (error: any) {
    console.error("Error en sensor RFID:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}