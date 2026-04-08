"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsuarios(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 w-full">
      {/* Encabezado */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-violet-900 font-headline uppercase">Directorio de Conductores</h1>
          <p className="text-slate-500 font-medium mt-1">Gestión del personal autorizado en la planta.</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/usuarios/nuevo')}
          className="bg-violet-800 hover:bg-violet-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo Conductor
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Nombre</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">RUT</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={3} className="text-center py-10 text-slate-400">Cargando directorio...</td></tr>
              ) : usuarios.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-10 text-slate-400 italic">No hay conductores registrados.</td></tr>
              ) : usuarios.map((user: any) => (
                <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-800 font-black">
                      {user.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    {user.nombre}
                  </td>
                  <td className="px-8 py-6 font-mono text-sm font-semibold text-slate-600">
                    {user.rut}
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}