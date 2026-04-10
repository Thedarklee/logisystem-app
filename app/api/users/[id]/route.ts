import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Usuario from '@/models/Usuario';

// ACTUALIZAR (Modificar) un usuario
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Extraemos los datos que queremos permitir que se modifiquen
    const { nombre, rut, email, cargo, isActivo } = body;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      params.id,
      { nombre, rut, email, cargo, isActivo },
      { new: true } // Esto devuelve el documento ya actualizado
    );

    if (!usuarioActualizado) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ mensaje: "Usuario modificado con éxito", usuario: usuarioActualizado }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ELIMINAR un usuario
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const usuarioEliminado = await Usuario.findByIdAndDelete(params.id);

    if (!usuarioEliminado) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ mensaje: "Usuario eliminado del sistema" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}