"use client";

import { useState, useEffect } from "react";

export default function GestionVehiculosPage() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  // 1. NUEVO ESTADO: Para capturar los datos del formulario de creación
  const [newVehiculo, setNewVehiculo] = useState({ patente: "", marca: "", modelo: "", pesoTaraKg: "" });
  
  const [vehiculoEditando, setVehiculoEditando] = useState<any | null>(null);

  // Cargar vehículos
  const fetchVehiculos = async () => {
    try {
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      setVehiculos(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando vehículos:", error);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  // 2. NUEVA FUNCIÓN: Para enviar el formulario de creación a la API
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVehiculo,
          pesoTaraKg: Number(newVehiculo.pesoTaraKg) // Convertimos a número antes de enviar
        })
      });
      
      if (res.ok) {
        setStatus({ type: 'success', msg: "¡Vehículo registrado en la flota!" });
        setNewVehiculo({ patente: "", marca: "", modelo: "", pesoTaraKg: "" }); // Limpia el formulario
        fetchVehiculos(); // Recarga la tabla inmediatamente
      } else {
        const data = await res.json();
        setStatus({ type: 'error', msg: data.error || "Error al registrar vehículo." });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Error de conexión." });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  // Eliminar
  const handleDelete = async (id: string, patente: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el vehículo patente ${patente}?`)) return;
    
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatus({ type: 'success', msg: `Vehículo ${patente} eliminado.` });
        fetchVehiculos(); 
      } else {
        setStatus({ type: 'error', msg: "Error al eliminar vehículo." });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Error de conexión." });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  // Guardar Cambios (Modificar)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculoEditando) return;

    try {
      const res = await fetch(`/api/vehicles/${vehiculoEditando._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiculoEditando)
      });

      if (res.ok) {
        setStatus({ type: 'success', msg: "¡Vehículo actualizado correctamente!" });
        setVehiculoEditando(null); 
        fetchVehiculos(); 
      } else {
        setStatus({ type: 'error', msg: "Error al actualizar los datos." });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Error de conexión." });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  // Abrir modal asegurando que los campos existan
  const abrirModalEdicion = (vehiculo: any) => {
    setVehiculoEditando({
      ...vehiculo,
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      pesoTaraKg: vehiculo.pesoTaraKg || 0,
      isActivo: vehiculo.isActivo !== false
    });
  };

  return (
    <div className="px-10 py-8 space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-violet-900 font-headline uppercase">Gestión de Flota</h2>
          <p className="text-slate-500 font-body">Mantenimiento, control y estado operativo de vehículos.</p>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl text-sm font-bold shadow-sm ${status.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {status.msg}
        </div>
      )}

      {/* 3. NUEVA GRILLA: Divide la pantalla entre el formulario (1 columna) y la tabla (2 columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === COLUMNA IZQUIERDA: FORMULARIO === */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-800">Añadir a Flota</h3>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Patente</label>
              <input 
                required 
                placeholder="Ej: ABCD-12"
                value={newVehiculo.patente} 
                onChange={e => setNewVehiculo({...newVehiculo, patente: e.target.value.toUpperCase()})} 
                className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-mono font-bold text-violet-900 uppercase" 
                type="text" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Marca</label>
                <input 
                  required 
                  placeholder="Ej: Volvo"
                  value={newVehiculo.marca} 
                  onChange={e => setNewVehiculo({...newVehiculo, marca: e.target.value})} 
                  className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" 
                  type="text" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Modelo</label>
                <input 
                  required 
                  placeholder="Ej: FH 500"
                  value={newVehiculo.modelo} 
                  onChange={e => setNewVehiculo({...newVehiculo, modelo: e.target.value})} 
                  className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" 
                  type="text" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Peso Tara (Kg)</label>
              <input 
                required 
                placeholder="Ej: 8500"
                value={newVehiculo.pesoTaraKg} 
                onChange={e => setNewVehiculo({...newVehiculo, pesoTaraKg: e.target.value})} 
                className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" 
                type="number" 
                min="0"
              />
            </div>

            <button type="submit" className="w-full bg-violet-800 text-white py-4 rounded-xl font-black shadow-lg hover:bg-violet-900 transition-all active:scale-95 mt-4">
              REGISTRAR VEHÍCULO
            </button>
          </form>
        </section>

        {/* === COLUMNA DERECHA: TABLA DE GESTIÓN === */}
        <section className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center py-10 text-slate-400 font-bold animate-pulse">Cargando flota...</p>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                    <th className="px-6 py-2">Vehículo</th>
                    <th className="px-6 py-2">Tara (Kg)</th>
                    <th className="px-6 py-2">Estado</th>
                    <th className="px-6 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {vehiculos.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-6 text-slate-400 italic">No hay vehículos registrados.</td></tr>
                  ) : vehiculos.map((vehiculo) => (
                    <tr key={vehiculo._id} className="bg-slate-50 group hover:shadow-md transition-shadow">
                      <td className="px-6 py-4 rounded-l-2xl">
                        <p className="font-bold font-mono text-violet-900 text-lg">{vehiculo.patente}</p>
                        <p className="text-xs text-slate-500 uppercase">{vehiculo.marca} - {vehiculo.modelo}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold">
                        {vehiculo.pesoTaraKg} Kg
                      </td>
                      <td className="px-6 py-4">
                        {vehiculo.isActivo !== false ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Operativo</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500 font-bold text-xs"><div className="w-2 h-2 rounded-full bg-red-500"></div> Fuera de Servicio</span>
                        )}
                      </td>
                      <td className="px-6 py-4 rounded-r-2xl text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => abrirModalEdicion(vehiculo)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Modificar Vehículo"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(vehiculo._id, vehiculo.patente)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Dar de Baja"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </div> {/* Cierre de la grilla */}

      {/* MODAL PARA EDITAR VEHÍCULO */}
      {vehiculoEditando && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-headline text-violet-900">Modificar Vehículo</h3>
              <button onClick={() => setVehiculoEditando(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Patente</label>
                <input required value={vehiculoEditando.patente} onChange={e => setVehiculoEditando({...vehiculoEditando, patente: e.target.value.toUpperCase()})} className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-mono font-bold text-slate-700 uppercase" type="text" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Marca</label>
                  <input required value={vehiculoEditando.marca} onChange={e => setVehiculoEditando({...vehiculoEditando, marca: e.target.value})} className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" type="text" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Modelo</label>
                  <input required value={vehiculoEditando.modelo} onChange={e => setVehiculoEditando({...vehiculoEditando, modelo: e.target.value})} className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" type="text" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Peso Tara (Kg)</label>
                <input required value={vehiculoEditando.pesoTaraKg} onChange={e => setVehiculoEditando({...vehiculoEditando, pesoTaraKg: e.target.value})} className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" type="number" min="0" />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={vehiculoEditando.isActivo} onChange={e => setVehiculoEditando({...vehiculoEditando, isActivo: e.target.checked})} className="w-5 h-5 rounded text-violet-600 focus:ring-violet-800" />
                  <span className="font-bold text-slate-700 text-sm">Vehículo Operativo</span>
                </label>
                <p className="text-xs text-slate-400 mt-1 ml-8">Si se desactiva, el camión pasará a "Fuera de Servicio" y no podrá ser asignado a nuevos envíos.</p>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setVehiculoEditando(null)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" className="bg-violet-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-violet-900 transition-colors">Guardar Vehículo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}