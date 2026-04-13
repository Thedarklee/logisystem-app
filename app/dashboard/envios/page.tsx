"use client";

import { useState, useEffect } from "react";

export default function EnviosPage() {
  const [conductores, setConductores] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [envios, setEnvios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const [formData, setFormData] = useState({
    numeroEnvio: "",
    conductorId: "",
    vehiculoId: "",
    origen: "",
    destino: "",
    fechaSalida: "",
    fechaLlegada: "",
    estado: "ABIERTO",
    tipoCarga: "",
    pesoKg: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resU, resV, resE] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/vehicles'),
          fetch('/api/envios')
        ]);

        const uData = await resU.json();
        const vData = await resV.json();
        const eData = await resE.json();

        setConductores(Array.isArray(uData) ? uData : []);
        setVehiculos(Array.isArray(vData) ? vData : []);
        setEnvios(Array.isArray(eData) ? eData : []);
      } catch (err) {
        console.error("Error cargando datos base", err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/envios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', msg: "¡Envío programado correctamente!" });
        setFormData({ numeroEnvio: "", conductorId: "", vehiculoId: "", origen: "", destino: "", fechaSalida: "", fechaLlegada: "", estado: "ABIERTO", tipoCarga: "", pesoKg: "" });
        
        const refresh = await fetch('/api/envios');
        setEnvios(await refresh.json());
      } else {
        setStatus({ type: 'error', msg: data.error || "Error al crear envío" });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: "Error de conexión." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-10 py-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-violet-900 font-headline uppercase">Gestión de Envíos</h2>
          <p className="text-slate-500 font-body">Asignación de unidades y planificación de rutas.</p>
        </div>
      </div>

      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-violet-800 rounded-full"></div>
            <h3 className="text-xl font-bold font-headline">Programar Nueva Ruta</h3>
          </div>

          {status && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {status.msg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">N° de Envío</label>
                <input required value={formData.numeroEnvio} onChange={e => setFormData({...formData, numeroEnvio: e.target.value.toUpperCase()})} className="w-full bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-mono font-bold uppercase" placeholder="Ej: TR-8090" type="text" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Estado Inicial</label>
                <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-bold text-slate-700">
                  <option value="ABIERTO">ABIERTO (En preparación)</option>
                  <option value="PROGRAMADO">PROGRAMADO (Listo para salir)</option>
                  <option value="EN_RUTA">EN RUTA</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Responsable (Conductores)</label>
                <select required value={formData.conductorId} onChange={e => setFormData({...formData, conductorId: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700">
                  <option value="">Seleccione un conductor...</option>
                  {conductores.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.nombre} - RUT: {c.rut}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Vehículo (Camión)</label>
                <select required value={formData.vehiculoId} onChange={e => setFormData({...formData, vehiculoId: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700">
                  <option value="">Seleccione un camión...</option>
                  {vehiculos.map(v => (
                    <option key={v._id} value={v._id}>{v.patente} - {v.marca}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tipo de Carga</label>
                <input required value={formData.tipoCarga} onChange={e => setFormData({...formData, tipoCarga: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" placeholder="Ej: Materiales" type="text" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Peso Total (Kg)</label>
                {/* ⚖️ CAMBIO AQUÍ: min="0" para bloquear negativos desde el HTML */}
                <input required min="0" value={formData.pesoKg} onChange={e => setFormData({...formData, pesoKg: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" placeholder="Ej: 5000" type="number" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Origen</label>
                <input required value={formData.origen} onChange={e => setFormData({...formData, origen: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" placeholder="Bodega Central" type="text" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Destino</label>
                <input required value={formData.destino} onChange={e => setFormData({...formData, destino: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" placeholder="Ciudad destino" type="text" />
              </div>

              {/* 📅 CAMBIO AQUÍ: required condicionado al estado */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Fecha Salida Est.</label>
                <input required={formData.estado !== 'ABIERTO'} value={formData.fechaSalida} onChange={e => setFormData({...formData, fechaSalida: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" type="date" />
                {formData.estado !== 'ABIERTO' && <p className="text-[10px] text-red-500 font-bold mt-1">Obligatorio para estado {formData.estado}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Fecha Llegada Est.</label>
                <input required={formData.estado !== 'ABIERTO'} value={formData.fechaLlegada} onChange={e => setFormData({...formData, fechaLlegada: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" type="date" />
                {formData.estado !== 'ABIERTO' && <p className="text-[10px] text-red-500 font-bold mt-1">Obligatorio para estado {formData.estado}</p>}
              </div>

            </div>

            <div className="pt-6 flex justify-end">
              <button disabled={loading} className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-black shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 active:scale-95 w-full md:w-auto" type="submit">
                {loading ? "PROCESANDO..." : "CONFIRMAR ENVÍO"}
              </button>
            </div>
          </form>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-violet-900 p-8 rounded-3xl text-white relative overflow-hidden h-full flex flex-col justify-between">
            <div className="relative z-10">
              <h4 className="text-2xl font-black font-headline leading-tight">Envíos Activos</h4>
              <p className="mt-2 text-violet-200 opacity-80">Rutas en progreso actual.</p>
            </div>
            <div className="relative z-10 space-y-4 mt-8">
              <div className="flex justify-between items-end">
                <span className="text-5xl font-black font-headline">{envios.filter(e => e.estado === 'EN_RUTA').length}</span>
                <span className="material-symbols-outlined text-4xl opacity-40">local_shipping</span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 border-t border-white/10 pt-2">Vehículos en terreno</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-headline">Registro de Operaciones</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                <th className="px-6 py-2">ID Envío</th>
                <th className="px-6 py-2">Ruta (Origen &gt; Destino)</th>
                <th className="px-6 py-2">Conductor</th>
                <th className="px-6 py-2">Patente</th>
                <th className="px-6 py-2">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {envios.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-slate-400 italic">No hay envíos registrados.</td></tr>
              ) : envios.map((envio) => (
                <tr key={envio._id} className="bg-slate-50 group hover:shadow-md transition-shadow">
                  <td className="px-6 py-5 rounded-l-2xl font-black font-mono text-violet-900">
                    {envio.numeroEnvio}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{envio.logistica?.origen}</span>
                      <span className="material-symbols-outlined text-slate-400 text-xs">east</span>
                      <span className="font-semibold">{envio.logistica?.destino}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                    {envio.recursos?.conductorId?.nombre || 'Sin asignar'}
                  </td>
                  <td className="px-6 py-5 font-mono font-bold text-slate-600">
                    {envio.recursos?.patente || 'N/A'}
                  </td>
                  <td className="px-6 py-5 rounded-r-2xl">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      envio.estado === 'ABIERTO' ? 'bg-slate-200 text-slate-600' :
                      envio.estado === 'PROGRAMADO' ? 'bg-blue-100 text-blue-800' :
                      envio.estado === 'FINALIZADO' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {envio.estado}
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