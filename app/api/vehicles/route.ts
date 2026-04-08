export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehiculo from '@/models/Vehiculo';
import Usuario from '@/models/Usuario'; // Es buena práctica dejarlo para que Mongoose sepa quién es 'Usuario' al hacer el populate

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // 1. Extraemos TODOS los campos que envía el frontend
    const { patente, marca, modelo, pesoTaraKg, conductorId } = body;

    // 2. Validamos que no falte nada importante
    if (!patente || !conductorId || !marca || !pesoTaraKg) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // 3. Creamos el vehículo con toda su información
    const nuevoVehiculo = await Vehiculo.create({
      patente: patente.toUpperCase().trim(),
      marca,          // AGREGADO
      modelo,
      pesoTaraKg,     // AGREGADO
      conductorAsignado: conductorId,
      isActivo: true
    });

    return NextResponse.json({ 
      mensaje: "Vehículo registrado y asignado", 
      id: nuevoVehiculo._id 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error al crear vehículo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    // .populate busca el ID y lo reemplaza por el objeto real del usuario
    const vehiculos = await Vehiculo.find()
      .populate('conductorAsignado', 'nombre') 
      .lean(); 

    return NextResponse.json(vehiculos);
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar flota" }, { status: 500 });
  }
}