import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LecturaAcceso from '@/models/LecturaAcceso';
import Usuario from '@/models/Usuario';
import Vehiculo from '@/models/Vehiculo';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Extraemos los datos que enviará el formulario del Frontend
    const { nombreConductor, patente, tipoMovimiento } = body;

    // 1. Validación estricta (Criterio de aceptación HU04: rechazar datos faltantes)
    if (!nombreConductor || !patente || !tipoMovimiento) {
      return NextResponse.json({ error: "Faltan datos obligatorios para el registro manual" }, { status: 400 });
    }

    // 2. Intentar buscar los IDs en la base de datos para mantener las relaciones (Opcional pero recomendado)
    // Usamos regex para ignorar mayúsculas/minúsculas en la búsqueda
    const usuarioDb = await Usuario.findOne({ nombre: { $regex: new RegExp(nombreConductor, "i") } });
    const vehiculoDb = await Vehiculo.findOne({ patente: { $regex: new RegExp(patente, "i") } });

    // 3. Crear el registro
    const nuevoRegistroManual = await LecturaAcceso.create({
      tipoMovimiento: tipoMovimiento, // Debería ser 'ENTRADA' o 'SALIDA'
      metodo: 'MANUAL',               // Discriminador crítico para HU04
      estado: 'EXITOSO',
      conductor: {
        usuarioId: usuarioDb ? usuarioDb._id : undefined,
        nombre: nombreConductor
      },
      vehiculo: {
        vehiculoId: vehiculoDb ? vehiculoDb._id : undefined,
        patente: patente.toUpperCase() // Guardamos la patente estandarizada
      },
      observaciones: "Ingreso manual ejecutado por operador",
      // Nota: No pasamos 'fechaHora' porque el esquema de Mongoose ya tiene 'default: Date.now'
    });

    return NextResponse.json({ 
      mensaje: "Registro manual guardado con éxito", 
      acceso: nuevoRegistroManual 
    }, { status: 201 });

  } catch (error) {
    console.error("Error en API Manual:", error);
    return NextResponse.json({ error: "Error interno del servidor al guardar registro manual" }, { status: 500 });
  }
}