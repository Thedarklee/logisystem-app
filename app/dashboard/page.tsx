"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/dashboard/stats');
      const json = await res.json();
      setData(json);
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
          <p className="text-xs font-bold text-slate-400 uppercase">Entradas Hoy</p>
          <h2 className="text-4xl font-black text-slate-800">{data.stats.entradas}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-orange-500">
          <p className="text-xs font-bold text-slate-400 uppercase">Salidas Hoy</p>
          <h2 className="text-4xl font-black text-slate-800">{data.stats.salidas}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-red-500">
          <p className="text-xs font-bold text-slate-400 uppercase">Alertas</p>
          <h2 className="text-4xl font-black text-slate-800">{data.stats.alertas}</h2>
        </div>
      </div>

      {/* Tabla de Movimientos Recientes */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-6 text-violet-900">Actividad Reciente</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <th className="pb-4">Conductor</th>
              <th className="pb-4">Vehículo</th>
              <th className="pb-4">Tipo</th>
              <th className="pb-4">Hora</th>
            </tr>
          </thead>
          <tbody>
            {data.recientes.map((acc: any) => (
              <tr key={acc._id} className="border-t border-slate-50">
                <td className="py-4 font-bold text-slate-700">{acc.conductor.nombre}</td>
                <td className="py-4 font-mono text-sm text-slate-500">{acc.vehiculo.patente}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${acc.tipoMovimiento === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {acc.tipoMovimiento}
                  </span>
                </td>
                <td className="py-4 text-xs text-slate-400">
                  {new Date(acc.fechaHora).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}