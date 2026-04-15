import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LecturaAcceso from '@/models/LecturaAcceso';

export async function GET() {
  try {
    await dbConnect();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Vehículos dentro: último movimiento por vehículo = ENTRADA
    const vehiculosAgg = await LecturaAcceso.aggregate([
      { $sort: { fechaHora: -1 } },
      { $group: { _id: '$vehiculo.vehiculoId', ultimo: { $first: '$tipoMovimiento' } } },
      { $match: { _id: { $ne: null }, ultimo: 'ENTRADA' } },
      { $count: 'total' }
    ]);
    const vehiculosDentro = vehiculosAgg[0]?.total || 0;

    const alertasHoy = await LecturaAcceso.countDocuments({ estado: 'ALERTA', fechaHora: { $gte: hoy } });
    const fallosHoy = await LecturaAcceso.countDocuments({ estado: 'FALLIDO', fechaHora: { $gte: hoy } });
    const automatico = await LecturaAcceso.countDocuments({ metodo: 'AUTOMATICO', fechaHora: { $gte: hoy } });
    const manual = await LecturaAcceso.countDocuments({ metodo: 'MANUAL', fechaHora: { $gte: hoy } });

    // Accesos por hora hoy (5am–21pm)
    const horasAgg = await LecturaAcceso.aggregate([
      { $match: { fechaHora: { $gte: hoy } } },
      {
        $group: {
          _id: { hora: { $hour: '$fechaHora' }, tipo: '$tipoMovimiento' },
          count: { $sum: 1 }
        }
      }
    ]);

    const horasMap: Record<number, { hora: string; entradas: number; salidas: number }> = {};
    for (let h = 5; h <= 21; h++) {
      horasMap[h] = { hora: `${String(h).padStart(2, '0')}:00`, entradas: 0, salidas: 0 };
    }
    for (const item of horasAgg) {
      const h = item._id.hora as number;
      if (h >= 5 && h <= 21) {
        if (item._id.tipo === 'ENTRADA') horasMap[h].entradas = item.count;
        else horasMap[h].salidas = item.count;
      }
    }

    return NextResponse.json({
      vehiculosDentro,
      alertasHoy,
      fallosHoy,
      metodos: { automatico, manual },
      accesosPorHora: Object.values(horasMap)
    });
  } catch {
    return NextResponse.json({ error: 'Error al cargar estadísticas operacionales' }, { status: 500 });
  }
}
