import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LecturaAcceso from '@/models/LecturaAcceso';

export async function GET() {
  try {
    await dbConnect();

    const dias = [];
    const nombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    for (let i = 6; i >= 0; i--) {
      const desde = new Date();
      desde.setDate(desde.getDate() - i);
      desde.setHours(0, 0, 0, 0);

      const hasta = new Date(desde);
      hasta.setDate(hasta.getDate() + 1);

      const entradas = await LecturaAcceso.countDocuments({
        tipoMovimiento: 'ENTRADA',
        fechaHora: { $gte: desde, $lt: hasta }
      });

      const salidas = await LecturaAcceso.countDocuments({
        tipoMovimiento: 'SALIDA',
        fechaHora: { $gte: desde, $lt: hasta }
      });

      const alertas = await LecturaAcceso.countDocuments({
        estado: 'ALERTA',
        fechaHora: { $gte: desde, $lt: hasta }
      });

      dias.push({
        dia: nombres[desde.getDay()],
        fecha: desde.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }),
        entradas,
        salidas,
        alertas
      });
    }

    const totalSemana = dias.reduce((s, d) => s + d.entradas + d.salidas, 0);
    const alertasSemana = dias.reduce((s, d) => s + d.alertas, 0);

    return NextResponse.json({ dias, totalSemana, alertasSemana });
  } catch {
    return NextResponse.json({ error: 'Error al cargar tendencia semanal' }, { status: 500 });
  }
}
