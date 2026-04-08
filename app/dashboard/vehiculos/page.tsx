"use client";

import { useState, useEffect } from "react";

export default function GestionFlotaPage() {
  const [usuarios, setUsuarios] = useState([]); // Para el select de conductores
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ patente: "", modelo: "", conductorId: "" });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      const [resUsers, resVehicles] = await Promise.all([
        fetch('/api/users'), // Necesitas una ruta GET en /api/users que devuelva la lista
        fetch('/api/vehicles')
      ]);
      setUsuarios(await resUsers.json());
      setVehiculos(await resVehicles.json());
      setLoading(false);
    };
    cargarDatos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);      setFormData({ patente: "", modelo: "", conductorId: "" });
      // Recargar lista de vehículos...
    }
  };

  return (
    <div className="p-8 space-y-10">
      <header>
        <h1 className="text-3xl font-black text-violet-900 font-headline uppercase">Gestión de Flota</h1>
        <p className="text-slate-500 text-sm">Asigna vehículos a conductores autorizados.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Formulario de Registro */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6 h-fit">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-600">local_shipping</span>
            Vincular Vehículo
          </h2>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patente</label>
            <input 
              required
              className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800 font-mono"
              placeholder="ABCD-12"
              value={formData.patente}
              onChange={(e) => setFormData({...formData, patente: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conductor Responsable</label>
            <select 
              required
              className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800"
              value={formData.conductorId}
              onChange={(e) => setFormData({...formData, conductorId: e.target.value})}
            >
              <option value="">Seleccionar conductor...</option>
              {usuarios.map((u: any) => (
                <option key={u._id} value={u._id}>{u.nombre} ({u.rut})</option>
              ))}
            </select>
          </div>

          <button className="w-full bg-violet-800 text-white py-4 rounded-xl font-black hover:bg-violet-900 transition-all shadow-lg shadow-violet-800/20">
            REGISTRAR EN FLOTA
          </button>
        </form>

        {/* Lista de Flota Actual */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Patente</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Conductor Asignado</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Estado</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v: any) => (
                <tr key={v._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono font-bold text-violet-900">{v.patente}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{v.conductorAsignado?.nombre || 'No asignado'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Operativo</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}