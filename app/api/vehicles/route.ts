export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehiculo from '@/models/Vehiculo';
import Usuario from '@/models/Usuario'; // Es buena práctica dejarlo para que Mongoose sepa quién es 'Usuario' al hacer el populate

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // 1. Ya no extraemos conductorId
    const { patente, marca, modelo, pesoTaraKg } = body;

    // 2. Ya no validamos el conductorId
    if (!patente || !marca || !pesoTaraKg || !modelo) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // 3. Creamos el vehículo "soltero"
    const nuevoVehiculo = await Vehiculo.create({
      patente: patente.toUpperCase().trim(),
      marca,          
      modelo,
      pesoTaraKg,     
      isActivo: true
    });

    return NextResponse.json({ 
      mensaje: "Vehículo registrado en la flota", 
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
    // Traemos TODOS los vehículos sin importar si están activos o inactivos
    const vehiculos = await Vehiculo.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(vehiculos);
  } catch (error: any) {
    return NextResponse.json({ error: "Error al cargar vehículos" }, { status: 500 });
  }
}