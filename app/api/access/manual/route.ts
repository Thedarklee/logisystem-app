import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LecturaAcceso from '@/models/LecturaAcceso';
import Usuario from '@/models/Usuario';
import Vehiculo from '@/models/Vehiculo';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { rut, patente, tipoMovimiento } = await req.json();

    if (!rut || !patente || !tipoMovimiento) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // 1. Buscamos si existe el conductor por RUT
    const conductor = await Usuario.findOne({ rut: rut });
    
    // 2. Buscamos si existe el vehículo por Patente
    const vehiculo = await Vehiculo.findOne({ patente: patente });

    // 3. Registramos el acceso (incluso si no están en la BD, se registra manualmente)
    const nuevoRegistro = await LecturaAcceso.create({
      tipoMovimiento,
      metodo: 'MANUAL', // Indicamos que fue por teclado, no por RFID
      estado: conductor && vehiculo ? 'EXITOSO' : 'ALERTA', // Alerta si entró alguien no registrado
      conductor: {
        usuarioId: conductor ? conductor._id : null,
        nombre: conductor ? conductor.nombre : `Desconocido (RUT: ${rut})`
      },
      vehiculo: {
        vehiculoId: vehiculo ? vehiculo._id : null,
        patente: patente
      }
    });

    return NextResponse.json({ mensaje: "Registro manual guardado" }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}