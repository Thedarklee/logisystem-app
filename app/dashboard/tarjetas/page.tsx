"use client";

import { useState, useEffect } from "react";

export default function GestionRFIDPage() {
  const [tarjetas, setTarjetas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  // Estado para NUEVA tarjeta
  const [newCard, setNewCard] = useState({ uid: "", usuarioAsignado: "", estado: "ACTIVA" });
  
  // Estado para EDITAR tarjeta existente
  const [tarjetaEditando, setTarjetaEditando] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const [resT, resU] = await Promise.all([
        fetch('/api/cards'),
        fetch('/api/users')
      ]);
      setTarjetas(await resT.json());
      setUsuarios(await resU.json());
      setLoading(false);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACCIÓN: REGISTRAR NUEVA TARJETA ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard)
      });
      
      if (res.ok) {
        setStatus({ type: 'success', msg: "¡Nueva tarjeta vinculada con éxito!" });
        setNewCard({ uid: "", usuarioAsignado: "", estado: "ACTIVA" }); // Limpiar
        fetchData();
      } else {
        const err = await res.json();
        setStatus({ type: 'error', msg: err.error || "Error al registrar." });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Error de conexión." });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  // --- ACCIÓN: ELIMINAR ---
  const handleDelete = async (id: string, uid: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la tarjeta UID: ${uid}?`)) return;
    try {
      const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatus({ type: 'success', msg: `Tarjeta ${uid} eliminada.` });
        fetchData();
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Error al conectar." });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  // --- ACCIÓN: ACTUALIZAR ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/cards/${tarjetaEditando._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tarjetaEditando)
      });
      if (res.ok) {
        setStatus({ type: 'success', msg: "Tarjeta actualizada correctamente." });
        setTarjetaEditando(null);
        fetchData();
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Error de conexión." });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="px-10 py-8 space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-violet-900 font-headline uppercase">Control de Tags RFID</h2>
        <p className="text-slate-500 font-body">Registro y administración de llaves maestras.</p>
      </div>

      {status && (
        <div className={`p-4 rounded-xl text-sm font-bold shadow-sm animate-bounce ${status.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: FORMULARIO DE REGISTRO */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-800">Vincular Nueva</h3>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">UID del Sensor</label>
              <input 
                required 
                placeholder="Ej: A1 B2 C3 D4"
                value={newCard.uid} 
                onChange={e => setNewCard({...newCard, uid: e.target.value.toUpperCase()})} 
                className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-mono font-bold text-violet-900" 
                type="text" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Asignar a Personal</label>
              <select 
                required
                value={newCard.usuarioAsignado}
                onChange={e => setNewCard({...newCard, usuarioAsignado: e.target.value})}
                className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700"
              >
                <option value="">Seleccione un usuario...</option>
                {usuarios.map((u: any) => (
                  <option key={u._id} value={u._id}>{u.nombre} ({u.rut})</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full bg-violet-800 text-white py-4 rounded-xl font-black shadow-lg hover:bg-violet-900 transition-all active:scale-95">
              REGISTRAR TAG
            </button>
          </form>
        </section>

        {/* COLUMNA 2 y 3: TABLA DE GESTIÓN */}
        <section className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6 bg-violet-800 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-800">Inventario de Tarjetas</h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center py-10 text-slate-400 animate-pulse">Consultando servidor...</p>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                    <th className="px-6 py-2">Nombre</th>
                    <th className="px-6 py-2">RUT</th>
                    <th className="px-6 py-2">Estado</th>
                    <th className="px-6 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {tarjetas.map((t) => (
                    <tr key={t._id} className="bg-slate-50 group hover:shadow-md transition-shadow">
                      
                      {/* 1. Columna Nombre */}
                      <td className="px-6 py-4 rounded-l-2xl font-bold text-violet-900 text-base">
                        {t.usuarioAsignado ? (
                          t.usuarioAsignado.nombre
                        ) : (
                          <span className="text-slate-400 italic font-normal">Tarjeta sin asignar</span>
                        )}
                      </td>

                      {/* 2. Columna RUT */}
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {t.usuarioAsignado ? (
                          t.usuarioAsignado.rut
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* 3. Columna Estado */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                          t.estado === 'ACTIVA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {t.estado}
                        </span>
                      </td>

                      {/* 4. Columna Acciones */}
                      <td className="px-6 py-4 rounded-r-2xl text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setTarjetaEditando(t)} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => handleDelete(t._id, t.uid)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
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
      </div>

      {/* MODAL DE EDICIÓN */}
      {tarjetaEditando && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-violet-900 mb-6 font-headline">Configurar Tarjeta</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">UID (Hardware ID)</label>
                <input required value={tarjetaEditando.uid} onChange={e => setTarjetaEditando({...tarjetaEditando, uid: e.target.value.toUpperCase()})} className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 font-mono font-bold text-violet-800 border-none outline-none focus:ring-2 focus:ring-violet-800" type="text" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Reasignar a Conductor</label>
                <select 
                  className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 font-semibold text-slate-700 border-none outline-none focus:ring-2 focus:ring-violet-800"
                  value={tarjetaEditando.usuarioAsignado?._id || tarjetaEditando.usuarioAsignado || ""}
                  onChange={e => setTarjetaEditando({...tarjetaEditando, usuarioAsignado: e.target.value})}
                >
                  <option value="">Dejar sin asignar</option>
                  {usuarios.map((u: any) => (
                    <option key={u._id} value={u._id}>{u.nombre} ({u.rut})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Estado</label>
                <select 
                  className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 font-semibold text-slate-700 border-none outline-none focus:ring-2 focus:ring-violet-800"
                  value={tarjetaEditando.estado}
                  onChange={e => setTarjetaEditando({...tarjetaEditando, estado: e.target.value})}
                >
                  <option value="ACTIVA">ACTIVA</option>
                  <option value="INACTIVA">BLOQUEADA</option>
                  <option value="PERDIDA">REPORTADA COMO PERDIDA</option>
                </select>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setTarjetaEditando(null)} className="font-bold text-slate-500 px-4">Cancelar</button>
                <button type="submit" className="bg-violet-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}