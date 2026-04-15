import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LecturaAcceso from '@/models/LecturaAcceso';

export async function GET() {
  try {
    await dbConnect();

    const desde = new Date();
    desde.setDate(desde.getDate() - 6);
    desde.setHours(0, 0, 0, 0);

    // Una sola agregación en lugar de 21 queries
    const agg = await LecturaAcceso.aggregate([
      { $match: { fechaHora: { $gte: desde } } },
      {
        $group: {
          _id: {
            y: { $year: '$fechaHora' },
            m: { $month: '$fechaHora' },
            d: { $dayOfMonth: '$fechaHora' },
            dow: { $dayOfWeek: '$fechaHora' },
            tipo: '$tipoMovimiento',
            estado: '$estado'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const nombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const mapasDias: Record<string, { dia: string; fecha: string; entradas: number; salidas: number; alertas: number }> = {};

    // Inicializar los 7 días
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      mapasDias[key] = {
        dia: nombres[d.getDay()],
        fecha: d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }),
        entradas: 0,
        salidas: 0,
        alertas: 0
      };
    }

    // Rellenar con datos reales
    for (const item of agg) {
      const key = `${item._id.y}-${item._id.m - 1}-${item._id.d}`;
      if (!mapasDias[key]) continue;
      if (item._id.tipo === 'ENTRADA') mapasDias[key].entradas += item.count;
      if (item._id.tipo === 'SALIDA') mapasDias[key].salidas += item.count;
      if (item._id.estado === 'ALERTA') mapasDias[key].alertas += item.count;
    }

    const dias = Object.values(mapasDias);
    const totalSemana = dias.reduce((s, d) => s + d.entradas + d.salidas, 0);
    const alertasSemana = dias.reduce((s, d) => s + d.alertas, 0);

    return NextResponse.json({ dias, totalSemana, alertasSemana });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al cargar tendencia semanal' }, { status: 500 });
  }
}
