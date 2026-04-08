import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehiculo from '@/models/Vehiculo';
import Usuario from '@/models/Usuario';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { patente, modelo, conductorId } = body;

    if (!patente || !conductorId) {
      return NextResponse.json({ error: "Patente y Conductor son obligatorios" }, { status: 400 });
    }

    const nuevoVehiculo = await Vehiculo.create({
      patente: patente.toUpperCase().trim(),
      modelo,
      conductorAsignado: conductorId,
      isActivo: true
    });

    return NextResponse.json({ mensaje: "Vehículo registrado y asignado", id: nuevoVehiculo._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    // Traemos los vehículos y "poblamos" la info del conductor asociado
    const vehiculos = await Vehiculo.find().populate('conductorAsignado', 'nombre email');
    return NextResponse.json(vehiculos);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener flota" }, { status: 500 });
  }
}