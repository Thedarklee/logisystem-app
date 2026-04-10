import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tarjeta from '@/models/Tarjeta';

// MODIFICAR Tarjeta (Cambiar estado o usuario)
export async function PUT(
  req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await req.json();
    
    const { uid, usuarioAsignado, estado } = body;

    const tarjetaActualizada = await Tarjeta.findByIdAndUpdate(
      id,
      { 
        uid: uid.toUpperCase().trim(), 
        usuarioAsignado: usuarioAsignado || null, 
        estado 
      },
      { new: true }
    ).populate('usuarioAsignado', 'nombre rut');

    if (!tarjetaActualizada) {
      return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ mensaje: "Tarjeta actualizada", tarjeta: tarjetaActualizada }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ELIMINAR Tarjeta
export async function DELETE(
  req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const tarjetaEliminada = await Tarjeta.findByIdAndDelete(id);

    if (!tarjetaEliminada) {
      return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ mensaje: "Tarjeta eliminada del sistema" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}