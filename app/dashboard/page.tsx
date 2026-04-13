"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error al cargar stats:", error);
      }
    };
    fetchStats();
    // Actualizar cada 30 segundos automáticamente
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <p className="p-10 text-violet-900 font-bold">Cargando métricas de planta...</p>;

  return (
    <div className="p-8 space-y-8">
      {/* KPIs Dinámicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-emerald-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entradas Hoy</p>
          <h2 className="text-4xl font-black text-slate-800 mt-1">{data.stats?.entradas || 0}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-orange-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Salidas Hoy</p>
          <h2 className="text-4xl font-black text-slate-800 mt-1">{data.stats?.salidas || 0}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-red-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alertas</p>
          <h2 className="text-4xl font-black text-red-600 mt-1">{data.stats?.alertas || 0}</h2>
        </div>
      </div>

      {/* Tabla de Movimientos Recientes */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-6 text-violet-900 font-headline uppercase">Actividad Reciente</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                {/* Cambiamos el encabezado aquí */}
                <th className="pb-4 px-2">Personal / RUT</th>
                <th className="pb-4 px-2">Vehículo</th>
                <th className="pb-4 px-2">Tipo</th>
                <th className="pb-4 px-2">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(!data.recientes || data.recientes.length === 0) ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 italic">No hay actividad reciente registrada hoy.</td>
                </tr>
              ) : (
                data.recientes.map((acc: any) => (
                  <tr key={acc._id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* === COLUMNA CONDUCTOR Y RUT ACTUALIZADA === */}
                    <td className="py-4 px-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">
                          {acc.conductor?.nombre || 'Desconocido'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {/* Ahora la lectura es directa y limpia */}
                          RUT: {acc.conductor?.rut || 'NO REGISTRADO'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-2 font-mono text-sm font-semibold text-slate-600 uppercase">
                      {acc.vehiculo?.patente || 'S/N'}
                    </td>
                    
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 rounded-full text-[9px] tracking-wider font-black uppercase inline-flex items-center gap-1 ${
                        acc.tipoMovimiento === 'ENTRADA' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        <span className="material-symbols-outlined text-[10px]">
                          {acc.tipoMovimiento === 'ENTRADA' ? 'login' : 'logout'}
                        </span>
                        {acc.tipoMovimiento}
                      </span>
                    </td>
                    
                    <td className="py-4 px-2 text-xs font-bold text-slate-400">
                      {new Date(acc.fechaHora).toLocaleTimeString('es-CL')}
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}