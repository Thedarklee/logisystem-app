"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function AccesosPage() {
  const router = useRouter();
  const [accesos, setAccesos] = useState([]);
  const [stats, setStats] = useState({ entradas: 0, salidas: 0, manuales: 0, alertas: 0 });
  const [loading, setLoading] = useState(true);

  // --- 1. ESTADOS PARA LOS FILTROS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  const cargarDatos = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      
      setAccesos(data.recientes || []);
      setStats({
        entradas: data.stats?.entradas || 0,
        salidas: data.stats?.salidas || 0,
        manuales: (data.recientes || []).filter((a: any) => a.metodo === 'MANUAL').length,
        alertas: data.stats?.alertas || 0
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

  // --- 2. LÓGICA DE FILTRADO (Se ejecuta automáticamente al cambiar un filtro) ---
  const filteredAccesos = accesos.filter((acceso: any) => {
    // A. Búsqueda por Texto (Nombre, RUT o Patente)
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      (acceso.conductor?.nombre || "").toLowerCase().includes(searchLower) ||
      (acceso.conductor?.rut || "").toLowerCase().includes(searchLower) ||
      (acceso.vehiculo?.patente || "").toLowerCase().includes(searchLower);

    // B. Filtros de Selectores
    const matchTipo = filterTipo ? acceso.tipoMovimiento === filterTipo : true;
    const matchEstado = filterEstado ? acceso.estado === filterEstado : true;

    // C. Filtros de Fecha
    // Se añade T00:00:00 y T23:59:59 para abarcar el día completo de la zona horaria local
    const matchDateFrom = dateFrom ? new Date(acceso.fechaHora) >= new Date(dateFrom + 'T00:00:00') : true;
    const matchDateTo = dateTo ? new Date(acceso.fechaHora) <= new Date(dateTo + 'T23:59:59') : true;

    // Un registro solo se muestra si cumple TODOS los filtros activos
    return matchSearch && matchTipo && matchEstado && matchDateFrom && matchDateTo;
  });

  // Función rápida para limpiar todos los filtros
  const limpiarFiltros = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setFilterTipo("");
    setFilterEstado("");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-violet-900 font-headline uppercase">Historial de Accesos</h1>
          <p className="text-slate-500 font-medium mt-1">Monitoreo en tiempo real de entradas y salidas de planta.</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/accesos/nuevo')}
          className="bg-violet-800 hover:bg-violet-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add_box</span>
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
          <p className="text-[10px] font-bold tracking-widest text-violet-800 uppercase">Manuales / Visitas</p>
          <h3 className="text-3xl font-black mt-2 font-headline text-slate-800">{stats.manuales}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
          <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase">Alertas</p>
          <h3 className="text-3xl font-black mt-2 font-headline text-red-600">{stats.alertas}</h3>
        </div>
      </div>

      {/* --- 3. BARRA DE HERRAMIENTAS Y FILTROS --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
        
        {/* Buscador de Texto */}
        <div className="flex-1 w-full md:min-w-[250px]">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Buscar personal o vehículo</label>
          <div className="relative mt-1">
            <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-sm">search</span>
            <input 
              type="text" 
              placeholder="RUT, Nombre o Patente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 rounded-xl pl-10 pr-4 py-2 border-none focus:ring-2 focus:ring-violet-800 outline-none text-sm font-semibold text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Filtro Fecha Desde */}
        <div className="w-full md:w-auto">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Desde</label>
          <input 
            type="date" 
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-2 border-none focus:ring-2 focus:ring-violet-800 outline-none text-sm font-semibold text-slate-700"
          />
        </div>

        {/* Filtro Fecha Hasta */}
        <div className="w-full md:w-auto">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hasta</label>
          <input 
            type="date" 
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-2 border-none focus:ring-2 focus:ring-violet-800 outline-none text-sm font-semibold text-slate-700"
          />
        </div>

        {/* Filtro Tipo Movimiento */}
        <div className="w-full md:w-auto">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo</label>
          <select 
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-2 border-none focus:ring-2 focus:ring-violet-800 outline-none text-sm font-semibold text-slate-700"
          >
            <option value="">Todos</option>
            <option value="ENTRADA">Entradas</option>
            <option value="SALIDA">Salidas</option>
          </select>
        </div>

        {/* Filtro Estado */}
        <div className="w-full md:w-auto">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estado</label>
          <select 
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-2 border-none focus:ring-2 focus:ring-violet-800 outline-none text-sm font-semibold text-slate-700"
          >
            <option value="">Todos</option>
            <option value="EXITOSO">Exitoso</option>
            <option value="FALLIDO">Fallido</option>
          </select>
        </div>

        {/* Botón Limpiar */}
        {(searchTerm || dateFrom || dateTo || filterTipo || filterEstado) && (
          <button 
            onClick={limpiarFiltros}
            className="w-full md:w-auto px-4 py-2 mt-2 md:mt-0 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">filter_alt_off</span>
            Limpiar
          </button>
        )}
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
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Personal / RUT</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Vehículo</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Cargando historial...</td></tr>
              ) : filteredAccesos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
                    <p className="text-slate-500 font-medium">No se encontraron accesos con esos filtros.</p>
                  </td>
                </tr>
              ) : filteredAccesos.map((acceso: any) => (
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
                        {acceso.metodo === 'RFID' ? 'sensors' : 'edit_document'}
                      </span> 
                      {acceso.metodo}
                    </span>
                  </td>
                  
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">
                        {acceso.conductor?.nombre || 'Desconocido'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                        RUT: {acceso.conductor?.rut || 'NO REGISTRADO'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-mono text-sm font-semibold bg-slate-100 px-2 py-1 rounded text-slate-700 uppercase">
                      {acceso.vehiculo?.patente || 'S/N'}
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