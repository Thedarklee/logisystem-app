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
    

    // EL CEREBRO: Deducción automática de Entrada/Salida
    // Buscamos el último movimiento de este vehículo ordenado por fecha (el más reciente primero)
    const ultimoMovimiento = await LecturaAcceso.findOne({ 'vehiculo.vehiculoId': vehiculo._id })
                                                .sort({ fechaHora: -1 });

    // Si el último movimiento fue ENTRADA, entonces ahora debe ser SALIDA. Si no, es ENTRADA.
    const movimientoDeducido = (ultimoMovimiento && ultimoMovimiento.tipoMovimiento === 'ENTRADA') 
                               ? 'SALIDA' 
                               : 'ENTRADA';

    // 5. ¡Todo en orden! Registramos el acceso automáticamente usando nuestra deducción
    await LecturaAcceso.create({
      tipoMovimiento: movimientoDeducido, 
      metodo: 'AUTOMATICO',
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
      movimiento: movimientoDeducido,
      conductor: conductor.nombre 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error en sensor RFID:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}