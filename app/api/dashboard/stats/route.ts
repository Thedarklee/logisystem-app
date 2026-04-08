import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LecturaAcceso from '@/models/LecturaAcceso';

export async function GET() {
  try {
    await dbConnect();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Contamos entradas y salidas de hoy
    const entradas = await LecturaAcceso.countDocuments({ tipoMovimiento: 'ENTRADA', fechaHora: { $gte: hoy } });
    const salidas = await LecturaAcceso.countDocuments({ tipoMovimiento: 'SALIDA', fechaHora: { $gte: hoy } });
    
    // Obtenemos los últimos 5 movimientos para la tabla
    const ultimosMovimientos = await LecturaAcceso.find().sort({ fechaHora: -1 }).limit(5);

    return NextResponse.json({
      stats: { entradas, salidas, alertas: 0 },
      recientes: ultimosMovimientos
    });
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar estadísticas" }, { status: 500 });
  }
}