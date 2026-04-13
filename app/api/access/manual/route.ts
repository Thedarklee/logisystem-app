export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LecturaAcceso from '@/models/LecturaAcceso';
import Usuario from '@/models/Usuario';
import Vehiculo from '@/models/Vehiculo';
import Envio from '@/models/Envio';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // Agregamos isVisitante a lo que recibimos del guardia
    const { rut, patente, tipoMovimiento, isVisitante } = await req.json();

    if (!rut || !tipoMovimiento) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // ----------------------------------------------------------------------
    // 🛑 RUTA EXCEPCIONAL PARA VISITANTES
    // ----------------------------------------------------------------------
    if (isVisitante) {
      const nuevoRegistro = await LecturaAcceso.create({
        tipoMovimiento,
        metodo: 'MANUAL', 
        estado: 'EXITOSO', 
        conductor: {
          usuarioId: null, // No está en la BDD
          nombre: `Visitante`
        },
        vehiculo: {
          vehiculoId: null, // No es de la flota
          patente: patente ? patente.toUpperCase().trim() : 'A PIE / SIN REGISTRO'
        },
        observaciones: `Registro manual (Guardia). Ingreso de VISITANTE. RUT: ${rut}`
      });

      return NextResponse.json({ mensaje: "Acceso de visitante autorizado" }, { status: 201 });
    }

    // ----------------------------------------------------------------------
    // 🚚 RUTA ESTRICTA PARA FLOTA Y CONDUCTORES (La que ya tenías)
    // ----------------------------------------------------------------------
    if (!patente) {
       return NextResponse.json({ error: "Falta la patente del vehículo" }, { status: 400 });
    }

    // 1. Buscamos si existe el conductor por RUT
    const conductor = await Usuario.findOne({ rut: rut.trim() });
    if (!conductor) {
      return NextResponse.json({ error: "Conductor no registrado en el sistema" }, { status: 404 });
    }
    
    // 2. Buscamos si existe el vehículo por Patente
    const vehiculo = await Vehiculo.findOne({ patente: patente.toUpperCase().trim() });
    if (!vehiculo) {
      return NextResponse.json({ error: "Vehículo no registrado en la flota" }, { status: 404 });
    }

    // 3. LA REGLA LOGÍSTICA: Bloqueo por falta de Envío
    const envioActivo = await Envio.findOne({
      'recursos.conductorId': conductor._id,
      estado: { $in: ['PROGRAMADO', 'EN_RUTA'] }
    });

    if (!envioActivo) {
      return NextResponse.json({ 
        error: "Acceso denegado: Este conductor no tiene un envío activo para el día de hoy." 
      }, { status: 403 });
    }

    // 4. BONUS DE SEGURIDAD: ¿El camión es el correcto?
    if (envioActivo.recursos.vehiculoId.toString() !== vehiculo._id.toString()) {
      return NextResponse.json({ 
        error: `Alerta de seguridad: El conductor tiene un envío asignado, pero debe usar el camión ${envioActivo.recursos.patente}.` 
      }, { status: 403 });
    }

    // Todo está en regla. Guardamos el registro manual
    const nuevoRegistro = await LecturaAcceso.create({
      tipoMovimiento,
      metodo: 'MANUAL', 
      estado: 'EXITOSO', 
      conductor: {
        usuarioId: conductor._id,
        nombre: conductor.nombre
      },
      vehiculo: {
        vehiculoId: vehiculo._id,
        patente: vehiculo.patente
      },
      observaciones: `Registro manual (Guardia). Asociado al envío: ${envioActivo.numeroEnvio}`
    });

    // ACTUALIZACIÓN AUTOMÁTICA DEL ENVÍO
    if (tipoMovimiento === 'SALIDA' && envioActivo.estado === 'PROGRAMADO') {
      envioActivo.estado = 'EN_RUTA';
      envioActivo.logistica.fechaSalidaEstimada = new Date(); 
      await envioActivo.save();
    } else if (tipoMovimiento === 'ENTRADA' && envioActivo.estado === 'EN_RUTA') {
      envioActivo.estado = 'FINALIZADO';
      envioActivo.logistica.fechaCierreReal = new Date(); 
      await envioActivo.save();
    }

    return NextResponse.json({ 
      mensaje: "Acceso autorizado manualmente",
      envioAsociado: envioActivo.numeroEnvio 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error en acceso manual:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}