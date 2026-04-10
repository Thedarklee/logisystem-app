import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehiculo from '@/models/Vehiculo';

// ACTUALIZAR (Modificar) un vehículo
export async function PUT(
  req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = await context.params;

    // Extraemos los datos del vehículo
    const { patente, marca, modelo, pesoTaraKg, isActivo, tagRFID } = body;

    const vehiculoActualizado = await Vehiculo.findByIdAndUpdate(
      id,
      { 
        patente: patente.toUpperCase().trim(), 
        marca, 
        modelo, 
        pesoTaraKg: Number(pesoTaraKg), 
        isActivo, 
        tagRFID 
      },
      { new: true }
    );

    if (!vehiculoActualizado) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ mensaje: "Vehículo modificado con éxito", vehiculo: vehiculoActualizado }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ELIMINAR un vehículo
export async function DELETE(
  req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const vehiculoEliminado = await Vehiculo.findByIdAndDelete(id);

    if (!vehiculoEliminado) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ mensaje: "Vehículo eliminado del sistema" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}