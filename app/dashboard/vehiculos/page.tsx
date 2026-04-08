"use client";
import { useState, useEffect } from "react";

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<any[]>([]); // <--- Agregamos <any[]>
const [usuarios, setUsuarios] = useState<any[]>([]);   // <--- Agregamos <any[]>
  const [formData, setFormData] = useState({ 
    patente: "", 
    marca: "",    // Agregado
    modelo: "", 
    pesoTaraKg: "", // Agregado
    conductorId: "" 
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resV, resU] = await Promise.all([fetch('/api/vehicles'), fetch('/api/users')]);
        const vData = await resV.json();
        const uData = await resU.json();
        
        // Filtramos para que solo salgan los usuarios que son CONDUCTORES en el select
        // Como la API ya nos manda solo a los conductores, los guardamos directo
        setUsuarios(Array.isArray(uData) ? uData : []);
        setVehiculos(Array.isArray(vData) ? vData : []);
      } catch (err) {
        console.error("Error al cargar datos", err);
      }
    };
    loadData();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (res.ok) {
      setStatus({ type: 'success', msg: "¡Vehículo registrado con éxito!" });
      setFormData({ patente: "", marca: "", modelo: "", pesoTaraKg: "", conductorId: "" });
      const updated = await fetch('/api/vehicles');
      setVehiculos(await updated.json());
    } else {
      setStatus({ type: 'error', msg: data.error || "Error al registrar" });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-violet-900 uppercase font-headline">Gestión de Vehículos</h1>
        <p className="text-slate-500 font-medium">Administra la flota y asigna conductores responsables.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Registro */}
        <form onSubmit={handleRegister} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 h-fit">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-600">add_box</span>
            Registrar Nuevo Camión
          </h2>

          {status && (
            <div className={`p-3 rounded-xl text-xs font-bold ${status.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {status.msg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input 
              placeholder="Patente (ABCD-12)"
              className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800 font-mono font-bold uppercase"
              value={formData.patente}
              onChange={e => setFormData({...formData, patente: e.target.value.toUpperCase()})}
              required
            />
            <input 
              placeholder="Marca (Ej: Volvo)"
              className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800"
              value={formData.marca}
              onChange={e => setFormData({...formData, marca: e.target.value})}
              required
            />
          </div>

          <input 
            placeholder="Modelo (Ej: FH16)"
            className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800"
            value={formData.modelo}
            onChange={e => setFormData({...formData, modelo: e.target.value})}
            required
          />

          <input 
            type="number"
            placeholder="Peso Tara (Kg)"
            className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800"
            value={formData.pesoTaraKg}
            onChange={e => setFormData({...formData, pesoTaraKg: e.target.value})}
            required
          />

          <select 
            className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800 cursor-pointer"
            value={formData.conductorId}
            onChange={e => setFormData({...formData, conductorId: e.target.value})}
            required
          >
            <option value="">Seleccionar Conductor...</option>
            {usuarios.map((u: any) => (
              <option key={u._id} value={u._id}>{u.nombre}</option>
            ))}
          </select>

          <button className="w-full bg-violet-800 text-white py-4 rounded-xl font-bold hover:bg-violet-900 transition-all shadow-lg shadow-violet-800/20 active:scale-95">
            GUARDAR EN FLOTA
          </button>
        </form>

        {/* Tabla de Flota */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-6 py-4">Vehículo</th>
                  <th className="px-6 py-4">Tara</th>
                  <th className="px-6 py-4">Responsable</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vehiculos.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-400 italic">No hay vehículos registrados</td></tr>
                ) : vehiculos.map((v: any) => (
                  <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-black text-violet-900">{v.patente}</span>
                        <span className="text-xs text-slate-500">{v.marca} {v.modelo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {v.pesoTaraKg} Kg
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-800 text-[10px] font-bold uppercase">
                          {v.conductorAsignado?.nombre.substring(0, 2)}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{v.conductorAsignado?.nombre || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">Operativo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}