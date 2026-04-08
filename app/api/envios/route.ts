import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Envio from '@/models/Envio';

// 1. MÉTODO POST: Para crear un nuevo envío (HU06)
export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // Obtenemos los datos que envía el frontend
    const body = await req.json();

    // Mongoose se encarga de validar la estructura automáticamente
    // usando el modelo Envio.ts que creamos antes.
    const nuevoEnvio = await Envio.create(body);

    return NextResponse.json({ 
      mensaje: "Envío creado exitosamente", 
      envio: nuevoEnvio 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error al crear el envío:", error);
    // Si Mongoose rechaza el guardado (ej. falta un campo obligatorio), devolvemos error 400
    return NextResponse.json({ 
      error: "No se pudo crear el envío, revisa los datos", 
      detalle: error.message 
    }, { status: 400 });
  }
}

// 2. MÉTODO GET: Para listar los envíos en la tabla del Dashboard
export async function GET() {
  try {
    await dbConnect();
    
    // Buscamos los envíos ordenados por los más recientes primero
    const envios = await Envio.find().sort({ fechaCreacion: -1 }).limit(50);

    return NextResponse.json(envios, { status: 200 });
    
  } catch (error) {
    console.error("Error al obtener envíos:", error);
    return NextResponse.json({ error: "Error de servidor al obtener la lista de envíos" }, { status: 500 });
  }
}