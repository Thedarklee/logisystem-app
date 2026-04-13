import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Envio from '@/models/Envio';

export async function PUT(
  req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await req.json();

    const { estado } = body;
    const updateData: any = { estado };

    // Si el operador marca el envío como finalizado, guardamos la fecha real de cierre
    if (estado === 'FINALIZADO') {
      updateData['logistica.fechaCierreReal'] = new Date();
    }

    const envioActualizado = await Envio.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!envioActualizado) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ mensaje: "Estado del envío actualizado", envio: envioActualizado }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}