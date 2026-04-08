"use client";

export default function EnviosPage() {
  return (
    <div className="px-10 py-8 space-y-8">
      {/* Header Action Row */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-violet-900 font-headline uppercase">Gestión de Envíos</h2>
          <p className="text-slate-500 font-body">Monitoreo y administración de carga global en tiempo real</p>
        </div>
        <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-transform active:scale-95">
          <span className="material-symbols-outlined">add_circle</span>
          Nuevo Envío
        </button>
      </div>

      {/* Main Form Card */}
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-violet-800 rounded-full"></div>
            <h3 className="text-xl font-bold font-headline">Detalles de la Operación</h3>
          </div>
          <form className="space-y-6" onSubmit={(e: React.FormEvent) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Número de Envío</label>
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center border-b-2 border-slate-200 focus-within:border-violet-800 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 mr-3">tag</span>
                  <input className="bg-transparent border-none w-full focus:ring-0 font-semibold text-slate-800 outline-none" placeholder="LX-8892-QT" type="text" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Responsable</label>
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center border-b-2 border-slate-200 focus-within:border-violet-800 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 mr-3">badge</span>
                  <input className="bg-transparent border-none w-full focus:ring-0 text-slate-800 outline-none" placeholder="Nombre del agente" type="text" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Origen</label>
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center border-b-2 border-slate-200 focus-within:border-violet-800 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 mr-3">location_on</span>
                  <input className="bg-transparent border-none w-full focus:ring-0 text-slate-800 outline-none" placeholder="Puerto de Salida" type="text" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Destino</label>
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center border-b-2 border-slate-200 focus-within:border-violet-800 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 mr-3">sports_score</span>
                  <input className="bg-transparent border-none w-full focus:ring-0 text-slate-800 outline-none" placeholder="Ciudad de Destino" type="text" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Fecha Salida</label>
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center border-b-2 border-slate-200 focus-within:border-violet-800 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 mr-3">calendar_today</span>
                  <input className="bg-transparent border-none w-full focus:ring-0 text-slate-800 outline-none" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Fecha Arribo</label>
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center border-b-2 border-slate-200 focus-within:border-violet-800 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 mr-3">event_available</span>
                  <input className="bg-transparent border-none w-full focus:ring-0 text-slate-800 outline-none" type="date" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Estado del Envío</label>
                <select className="bg-slate-50 rounded-xl px-4 py-3 w-full border-none border-b-2 border-slate-200 focus:ring-0 outline-none text-slate-800">
                  <option>Pendiente de Procesamiento</option>
                  <option>En Tránsito Marino</option>
                  <option>Despacho de Aduanas</option>
                  <option>En Distribución Local</option>
                  <option>Entregado</option>
                </select>
              </div>
            </div>

            <div className="pt-8 flex justify-end gap-4">
              <button className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors" type="button">
                Cancelar
              </button>
              <button className="bg-emerald-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-colors" type="submit">
                Aceptar Envío
              </button>
            </div>
          </form>
        </div>

        {/* Right Side Widget */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-violet-900 p-8 rounded-3xl text-white relative overflow-hidden h-full flex flex-col justify-between">
            <div className="relative z-10">
              <h4 className="text-2xl font-black font-headline leading-tight">Métricas de Carga</h4>
              <p className="mt-2 text-violet-200 opacity-80">Eficiencia operativa del terminal central.</p>
            </div>
            <div className="relative z-10 space-y-4 mt-8">
              <div className="flex justify-between items-end">
                <span className="text-4xl font-black font-headline">94.2%</span>
                <span className="material-symbols-outlined text-4xl opacity-40">trending_up</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-emerald-400 w-3/4 h-full rounded-full"></div>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Capacidad Utilizada</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pending Shipments Table */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-headline">Envíos Pendientes</h3>
          <button className="text-violet-700 font-bold text-sm flex items-center gap-1 hover:underline">
            Ver histórico completo
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                <th className="px-6 py-2">ID Envío</th>
                <th className="px-6 py-2">Ruta (Origen &gt; Destino)</th>
                <th className="px-6 py-2">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="bg-slate-50 group hover:shadow-md transition-shadow">
                <td className="px-6 py-5 rounded-l-2xl font-bold text-violet-900">#4491-TRX</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">Shanghai, CN</span>
                    <span className="material-symbols-outlined text-slate-400 text-xs">east</span>
                    <span className="font-semibold">Valencia, ES</span>
                  </div>
                </td>
                <td className="px-6 py-5 rounded-r-2xl">
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">En Tránsito</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}