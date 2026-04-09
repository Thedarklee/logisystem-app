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

    // 1. Validaciones básicas
    if (!numeroEnvio || !origen || !destino || !tipoCarga || !pesoKg) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // 2. Buscamos el vehículo para copiar su patente (como lo pide tu modelo)
    let patenteVehiculo = null;
    if (vehiculoId) {
      const vehiculo = await Vehiculo.findById(vehiculoId);
      if (vehiculo) patenteVehiculo = vehiculo.patente;
    }

    // 3. Creamos el Envío estructurado como dicta tu Modelo
    const nuevoEnvio = await Envio.create({
      numeroEnvio: numeroEnvio.toUpperCase(),
      estado: estado || 'ABIERTO',
      logistica: {
        origen,
        destino,
        fechaSalidaEstimada: fechaSalida || null,
        fechaLlegadaEstimada: fechaLlegada || null
      },
      carga: {
        tipo: tipoCarga,
        pesoKg: Number(pesoKg)
      },
      recursos: {
        conductorId: conductorId || null,
        vehiculoId: vehiculoId || null,
        patente: patenteVehiculo
      }
    });

    return NextResponse.json({ mensaje: "Envío programado con éxito", id: nuevoEnvio._id }, { status: 201 });

  } catch (error: any) {
    // Si el numeroEnvio ya existe, MongoDB lanza el error 11000
    if (error.code === 11000) {
      return NextResponse.json({ error: "Este Número de Envío ya existe" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    // Traemos los envíos y "poblamos" los datos del conductor para ver su nombre en la tabla
    const envios = await Envio.find()
      .populate('recursos.conductorId', 'nombre')
      .sort({ fechaCreacion: -1 })
      .lean();

    return NextResponse.json(envios);
  } catch (error: any) {
    return NextResponse.json({ error: "Error al cargar envíos" }, { status: 500 });
  }
}