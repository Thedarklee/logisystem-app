"use client";
import { useState, useEffect } from "react";

export default function RegistrarVehiculoPage() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  // Quitamos conductorId, el vehículo se registra "soltero"
  const [formData, setFormData] = useState({ 
    patente: "", 
    marca: "",    
    modelo: "", 
    pesoTaraKg: "" 
  });

  // Cargar la lista rápida para ver lo que acabamos de agregar
  const fetchVehiculos = async () => {
    try {
      const resV = await fetch('/api/vehicles');
      const vData = await resV.json();
      setVehiculos(Array.isArray(vData) ? vData : []);
    } catch (err) {
      console.error("Error al cargar datos", err);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  // Enviar el formulario
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pesoTaraKg: Number(formData.pesoTaraKg) // Aseguramos que sea un número
        })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', msg: "¡Vehículo registrado con éxito en la flota!" });
        setFormData({ patente: "", marca: "", modelo: "", pesoTaraKg: "" });
        fetchVehiculos(); // Refrescar la tabla
      } else {
        setStatus({ type: 'error', msg: data.error || "Error al registrar" });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Error de conexión con el servidor." });
    }
    
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-violet-900 uppercase font-headline">Ingreso a Flota</h1>
        <p className="text-slate-500 font-medium">Registra nuevos camiones en el sistema central.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Registro */}
        <form onSubmit={handleRegister} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 h-fit">
          <h2 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-violet-600">add_box</span>
            Registrar Nuevo Camión
          </h2>

          {status && (
            <div className={`p-3 rounded-xl text-xs font-bold ${status.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {status.msg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Patente</label>
              <input 
                placeholder="ABCD-12"
                className="w-full mt-1 p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800 font-mono font-bold uppercase"
                value={formData.patente}
                onChange={e => setFormData({...formData, patente: e.target.value.toUpperCase()})}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Marca</label>
              <input 
                placeholder="Ej: Volvo"
                className="w-full mt-1 p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800"
                value={formData.marca}
                onChange={e => setFormData({...formData, marca: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Modelo</label>
            <input 
              placeholder="Ej: FH16"
              className="w-full mt-1 p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800"
              value={formData.modelo}
              onChange={e => setFormData({...formData, modelo: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Peso Tara (Kg)</label>
            <input 
              type="number"
              placeholder="Ej: 8500"
              className="w-full mt-1 p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-violet-800"
              value={formData.pesoTaraKg}
              onChange={e => setFormData({...formData, pesoTaraKg: e.target.value})}
              required
              min="0"
            />
          </div>

          <button type="submit" className="w-full mt-4 bg-violet-800 text-white py-4 rounded-xl font-bold hover:bg-violet-900 transition-all shadow-lg shadow-violet-800/20 active:scale-95">
            GUARDAR EN FLOTA
          </button>
        </form>

        {/* Tabla de Vista Rápida */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-50">
             <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">view_list</span>
                Últimos Registros
              </h2>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white">
                <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-6 py-4">Patente</th>
                  <th className="px-6 py-4">Marca / Modelo</th>
                  <th className="px-6 py-4">Tara (Kg)</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vehiculos.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-400 italic">No hay vehículos registrados</td></tr>
                ) : vehiculos.map((v: any) => (
                  <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-black text-violet-900 text-base">
                      {v.patente}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{v.marca}</span>
                      <span className="text-slate-500 ml-1">{v.modelo}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {v.pesoTaraKg}
                    </td>
                    <td className="px-6 py-4">
                      {v.isActivo ? (
                         <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">Operativo</span>
                      ) : (
                         <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">Inactivo</span>
                      )}
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