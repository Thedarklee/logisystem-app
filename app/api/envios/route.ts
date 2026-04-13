export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Envio from '@/models/Envio';
import Vehiculo from '@/models/Vehiculo';
import Usuario from '@/models/Usuario'; // Para el populate

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const { numeroEnvio, origen, destino, fechaSalida, fechaLlegada, tipoCarga, pesoKg, conductorId, vehiculoId, estado } = body;

    // 1. Validaciones básicas de campos vacíos
    if (!numeroEnvio || !origen || !destino || !tipoCarga || pesoKg === undefined || pesoKg === "") {
      return NextResponse.json({ error: "Faltan campos obligatorios de logística" }, { status: 400 });
    }

    // ⚖️ 2. VALIDACIÓN DE PESO (No puede ser negativo)
    const pesoNumerico = Number(pesoKg);
    if (pesoNumerico < 0) {
      return NextResponse.json({ error: "El peso de la carga no puede ser un número negativo" }, { status: 400 });
    }

    // 📅 3. VALIDACIÓN DE FECHAS (Obligatorias si NO es "ABIERTO")
    const estadoActual = estado || 'ABIERTO';
    if (estadoActual !== 'ABIERTO') {
      if (!fechaSalida || !fechaLlegada) {
        return NextResponse.json({ error: `Para pasar a estado ${estadoActual}, debes asignar las Fechas de Salida y Llegada` }, { status: 400 });
      }
    }

    // 4. Buscamos el vehículo para copiar su patente
    let patenteVehiculo = null;
    if (vehiculoId) {
      const vehiculo = await Vehiculo.findById(vehiculoId);
      if (vehiculo) patenteVehiculo = vehiculo.patente;
    }

    // 5. Creamos el Envío estructurado
    const nuevoEnvio = await Envio.create({
      numeroEnvio: numeroEnvio.toUpperCase(),
      estado: estadoActual,
      logistica: {
        origen,
        destino,
        fechaSalidaEstimada: fechaSalida || null,
        fechaLlegadaEstimada: fechaLlegada || null
      },
      carga: {
        tipo: tipoCarga,
        pesoKg: pesoNumerico
      },
      recursos: {
        conductorId: conductorId || null,
        vehiculoId: vehiculoId || null,
        patente: patenteVehiculo
      }
    });

    return NextResponse.json({ mensaje: "Envío programado con éxito", id: nuevoEnvio._id }, { status: 201 });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Este Número de Envío ya existe" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const envios = await Envio.find()
      .populate('recursos.conductorId', 'nombre')
      .sort({ fechaCreacion: -1 })
      .lean();

    return NextResponse.json(envios);
  } catch (error: any) {
    return NextResponse.json({ error: "Error al cargar envíos" }, { status: 500 });
  }
}