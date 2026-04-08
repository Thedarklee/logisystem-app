import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LecturaAcceso from '@/models/LecturaAcceso';
import Usuario from '@/models/Usuario';
import Vehiculo from '@/models/Vehiculo';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { uid } = await req.json();

    if (!uid) return NextResponse.json({ error: "UID requerido" }, { status: 400 });

    // 1. Buscamos al usuario por su UID de tarjeta
    const usuario = await Usuario.findOne({ rfidUid: uid });
    if (!usuario) {
      // Registramos intento fallido para seguridad
      await LecturaAcceso.create({ metodo: 'RFID', estado: 'FALLIDO', observaciones: `UID desconocido: ${uid}` });
      return NextResponse.json({ error: "Tarjeta no autorizada" }, { status: 401 });
    }

    // 2. Buscamos el vehículo asociado a este conductor
    const vehiculo = await Vehiculo.findOne({ conductorAsignado: usuario._id });

    // 3. Lógica de Entrada/Salida: Miramos el último registro de este vehículo
    const ultimoRegistro = await LecturaAcceso.findOne({ "vehiculo.patente": vehiculo?.patente }).sort({ fechaHora: -1 });
    const tipoMovimiento = !ultimoRegistro || ultimoRegistro.tipoMovimiento === 'SALIDA' ? 'ENTRADA' : 'SALIDA';

    // 4. Guardamos el acceso exitoso
    const nuevoAcceso = await LecturaAcceso.create({
      tipoMovimiento,
      metodo: 'RFID',
      estado: 'EXITOSO',
      conductor: { usuarioId: usuario._id, nombre: usuario.nombre },
      vehiculo: { vehiculoId: vehiculo?._id, patente: vehiculo?.patente || "SIN-PATENTE" }
    });

    return NextResponse.json({ 
      mensaje: `Acceso concedido: ${tipoMovimiento}`, 
      conductor: usuario.nombre 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}