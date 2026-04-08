"use client";
import { useState, useEffect } from "react";

export default function TarjetasPage() {
  const [tarjetas, setTarjetas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ uid: "", usuarioAsignado: "", estado: "ACTIVA" });

  useEffect(() => {
    const loadData = async () => {
      const [resT, resU] = await Promise.all([
        fetch('/api/cards'),
        fetch('/api/users')
      ]);
      setTarjetas(await resT.json());
      setUsuarios(await resU.json());
      setLoading(false);
    };
    loadData();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      // Refrescar y limpiar
      setFormData({ uid: "", usuarioAsignado: "", estado: "ACTIVA" });
      const updated = await fetch('/api/cards');
      setTarjetas(await updated.json());
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-black text-violet-900 uppercase">Gestión de Tarjetas RFID</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <form onSubmit={handleRegister} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-bold">Vincular Nueva Tarjeta</h2>
          <input 
            placeholder="UID del Sensor (Ej: A1 B2 C3 D4)"
            className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800 font-mono"
            value={formData.uid}
            onChange={e => setFormData({...formData, uid: e.target.value.toUpperCase()})}
            required
          />
          <select 
            className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800"
            value={formData.usuarioAsignado}
            onChange={e => setFormData({...formData, usuarioAsignado: e.target.value})}
            required
          >
            <option value="">Asignar a Conductor...</option>
            {usuarios.map((u: any) => (
              <option key={u._id} value={u._id}>{u.nombre} ({u.rut})</option>
            ))}
          </select>
          <button className="w-full bg-violet-800 text-white py-3 rounded-xl font-bold">REGISTRAR TAG</button>
        </form>

        {/* Listado */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-black uppercase text-slate-400">
                <th className="px-6 py-4">UID</th>
                <th className="px-6 py-4">Asignada a</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {tarjetas.map((t: any) => (
                <tr key={t._id} className="border-t border-slate-50">
                  <td className="px-6 py-4 font-mono font-bold text-violet-800">{t.uid}</td>
                  <td className="px-6 py-4 text-sm">{t.usuarioAsignado?.nombre || 'Sin asignar'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold">{t.estado}</span>
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