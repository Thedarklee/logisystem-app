"use client";

export default function AccesosPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-violet-900 font-headline">Historial de Accesos</h1>
          <p className="text-slate-500 font-medium mt-1">Monitoreo en tiempo real de entradas y salidas de flota.</p>
        </div>
        <button className="bg-violet-800 hover:bg-violet-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 active:scale-95">
          <span className="material-symbols-outlined text-lg">add</span>
          Registro Manual
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Entradas Hoy</p>
          <h3 className="text-3xl font-black mt-2 font-headline text-slate-800">1,284</h3>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Salidas Hoy</p>
          <h3 className="text-3xl font-black mt-2 font-headline text-slate-800">942</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-violet-800">
          <p className="text-xs font-bold tracking-widest text-violet-800 uppercase">Manuales</p>
          <h3 className="text-3xl font-black mt-2 font-headline text-slate-800">24</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
          <p className="text-xs font-bold tracking-widest text-red-500 uppercase">Alertas Fallos</p>
          <h3 className="text-3xl font-black mt-2 font-headline text-red-600">3</h3>
        </div>
      </div>

      {/* Filters */}
      <section className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-wrap items-end gap-6 shadow-sm">
        <div className="flex-1 min-w-[200px] space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Rango de Fecha</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">calendar_today</span>
            <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-violet-800 outline-none" placeholder="Hoy, 24 Oct 2023" type="text" />
          </div>
        </div>
        <div className="flex-1 min-w-[200px] space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Conductor</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">person</span>
            <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-violet-800 outline-none" placeholder="Filtrar por conductor..." type="text" />
          </div>
        </div>
        <div className="flex-1 min-w-[200px] space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Patente</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">directions_car</span>
            <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-violet-800 outline-none uppercase" placeholder="Ej: ABC-1234" type="text" />
          </div>
        </div>
        <button className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-bold transition-all">
          Limpiar
        </button>
      </section>

      {/* Data Table */}
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
              
              {/* Fila Exitoso Automático */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">24 Oct, 2023</span>
                    <span className="text-xs text-slate-400">14:23:45</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">login</span> Entrada
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-violet-600">sensors</span> Auto
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-800">Carlos Mendoza</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="font-mono text-sm font-semibold bg-slate-100 px-2 py-1 rounded text-slate-700">KL-342-PP</span>
                </td>
                <td className="px-8 py-6">
                  <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Exitoso</span>
                </td>
              </tr>

              {/* Fila Error / Fallido */}
              <tr className="bg-red-50/50 hover:bg-red-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">24 Oct, 2023</span>
                    <span className="text-xs text-slate-400">12:45:18</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">login</span> Entrada
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-violet-600">sensors</span> Auto
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-800">Desconocido</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="font-mono text-sm font-semibold bg-slate-100 px-2 py-1 rounded text-slate-700">--</span>
                </td>
                <td className="px-8 py-6">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Fallido</span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}