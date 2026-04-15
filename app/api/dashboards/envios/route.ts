import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Envio from '@/models/Envio';

export async function GET() {
  try {
    await dbConnect();

    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const estadosAgg = await Envio.aggregate([
      { $group: { _id: '$estado', count: { $sum: 1 } } }
    ]);
    const estadosMap: Record<string, number> = { ABIERTO: 0, PROGRAMADO: 0, EN_RUTA: 0, FINALIZADO: 0 };
    for (const e of estadosAgg) estadosMap[e._id as string] = e.count as number;

    const pesoAgg = await Envio.aggregate([
      { $match: { estado: 'FINALIZADO', fechaCreacion: { $gte: inicioMes } } },
      { $group: { _id: null, total: { $sum: '$carga.pesoKg' } } }
    ]);
    const pesoTotalMes = (pesoAgg[0]?.total as number) || 0;

    const conRetraso = await Envio.countDocuments({
      estado: { $nin: ['FINALIZADO'] },
      'logistica.fechaLlegadaEstimada': { $lt: ahora, $exists: true }
    });

    const rutasAgg = await Envio.aggregate([
      {
        $group: {
          _id: { origen: '$logistica.origen', destino: '$logistica.destino' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          ruta: { $concat: ['$_id.origen', ' → ', '$_id.destino'] },
          count: 1,
          _id: 0
        }
      }
    ]);

    return NextResponse.json({
      porEstado: [
        { estado: 'Abierto', count: estadosMap.ABIERTO },
        { estado: 'Programado', count: estadosMap.PROGRAMADO },
        { estado: 'En Ruta', count: estadosMap.EN_RUTA },
        { estado: 'Finalizado', count: estadosMap.FINALIZADO }
      ],
      pesoTotalMes,
      conRetraso,
      rutasFrecuentes: rutasAgg
    });
  } catch {
    return NextResponse.json({ error: 'Error al cargar estadísticas de envíos' }, { status: 500 });
  }
}
