"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function AccesosPage() {
  const router = useRouter();
  const [accesos, setAccesos] = useState([]);
  const [stats, setStats] = useState({ entradas: 0, salidas: 0, manuales: 0, alertas: 0 });
  const [loading, setLoading] = useState(true);

  // Función para cargar los datos desde la API
  const cargarDatos = async () => {
    try {
      // Usamos la API de stats que ya creamos para el dashboard
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      
      setAccesos(data.recientes || []);
      setStats({
        entradas: data.stats.entradas || 0,
        salidas: data.stats.salidas || 0,
        manuales: data.recientes.filter((a: any) => a.metodo === 'MANUAL').length,
        alertas: data.stats.alertas || 0
      });
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-violet-900 font-headline uppercase">Historial de Accesos</h1>
          <p className="text-slate-500 font-medium mt-1">Monitoreo en tiempo real de entradas y salidas de flota.</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/accesos/nuevo')}
          className="bg-violet-800 hover:bg-violet-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">Añadir</span>
          Registro Manual
        </button>
      </div>

      {/* KPI Cards Dinámicos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">Entradas Hoy</p>
          <h3 className="text-3xl font-black mt-2 font-headline text-slate-800">{stats.entradas}</h3>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">Salidas Hoy</p>
          <h3 className="text-3xl font-black mt-2 font-headline text-slate-800">{stats.salidas}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-violet-800">
          <p className="text-[10px] font-bold tracking-widest text-violet-800 uppercase">Manuales</p>
          <h3 className="text-3xl font-black mt-2 font-headline text-slate-800">{stats.manuales}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
          <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase">Alertas</p>
          <h3 className="text-3xl font-black mt-2 font-headline text-red-600">{stats.alertas}</h3>
        </div>
      </div>

      {/* Data Table Dinámica */}
      <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Fecha/Hora</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Tipo</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Método</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Conductor</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Vehículo</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Cargando historial...</td></tr>
              ) : accesos.map((acceso: any) => (
                <tr key={acceso._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">
                        {new Date(acceso.fechaHora).toLocaleDateString('es-CL')}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(acceso.fechaHora).toLocaleTimeString('es-CL')}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                      acceso.tipoMovimiento === 'ENTRADA' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      <span className="material-symbols-outlined text-xs">
                        {acceso.tipoMovimiento === 'ENTRADA' ? 'login' : 'logout'}
                      </span> 
                      {acceso.tipoMovimiento}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-violet-600">
                        {acceso.metodo === 'RFID' ? 'sensors' : ''}
                      </span> 
                      {acceso.metodo}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-slate-800">{acceso.conductor.nombre}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-mono text-sm font-semibold bg-slate-100 px-2 py-1 rounded text-slate-700 uppercase">
                      {acceso.vehiculo.patente}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      acceso.estado === 'EXITOSO' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {acceso.estado}
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