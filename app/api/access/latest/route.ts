export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LecturaAcceso from '@/models/LecturaAcceso';

export async function GET() {
  try {
    await dbConnect();
    // Traemos SOLO el último registro de la base de datos
    const ultimoAcceso = await LecturaAcceso.findOne()
      .sort({ fechaHora: -1 })
      .select('conductor vehiculo tipoMovimiento metodo estado fechaHora')
      .lean();

    return NextResponse.json(ultimoAcceso);
  } catch (error) {
    return NextResponse.json({ error: "Error consultando último acceso" }, { status: 500 });
  }
}