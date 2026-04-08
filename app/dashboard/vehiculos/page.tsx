"use client";
import { useState, useEffect } from "react";

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({ patente: "", modelo: "", conductorId: "" });

  useEffect(() => {
    const loadData = async () => {
      const [resV, resU] = await Promise.all([fetch('/api/vehicles'), fetch('/api/users')]);
      setVehiculos(await resV.json());
      setUsuarios(await resU.json());
    };
    loadData();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setFormData({ patente: "", modelo: "", conductorId: "" });
      const updated = await fetch('/api/vehicles');
      setVehiculos(await updated.json());
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-black text-violet-900 uppercase">Gestión de Vehículos</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleRegister} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 h-fit">
          <h2 className="font-bold italic">Registrar Camión</h2>
          <input 
            placeholder="Patente (ABCD-12)"
            className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800 font-mono font-bold"
            value={formData.patente}
            onChange={e => setFormData({...formData, patente: e.target.value.toUpperCase()})}
            required
          />
          <input 
            placeholder="Modelo (Ej: Volvo FH16)"
            className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800"
            value={formData.modelo}
            onChange={e => setFormData({...formData, modelo: e.target.value})}
          />
          <select 
            className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800"
            value={formData.conductorId}
            onChange={e => setFormData({...formData, conductorId: e.target.value})}
            required
          >
            <option value="">Responsable...</option>
            {usuarios.map((u: any) => (
              <option key={u._id} value={u._id}>{u.nombre}</option>
            ))}
          </select>
          <button className="w-full bg-violet-800 text-white py-3 rounded-xl font-bold">ALTA DE VEHÍCULO</button>
        </form>

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-black uppercase text-slate-400">
                <th className="px-6 py-4">Patente</th>
                <th className="px-6 py-4">Modelo</th>
                <th className="px-6 py-4">Conductor Asignado</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v: any) => (
                <tr key={v._id} className="border-t border-slate-50">
                  <td className="px-6 py-4 font-mono font-black text-violet-900">{v.patente}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{v.modelo}</td>
                  <td className="px-6 py-4 text-sm font-bold">{v.conductorAsignado?.nombre || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}