"use client";

import { useState, useEffect } from "react";

export default function GestionRFIDPage() {
  const [tarjetas, setTarjetas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
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
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-violet-900 font-headline uppercase">Gestión de Tarjetas RFID</h2>
          <p className="text-slate-500 font-body">Administración de tags y vinculación con conductores.</p>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl text-sm font-bold shadow-sm ${status.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {status.msg}
        </div>
      )}

      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center py-10 text-slate-400 font-bold">Cargando llaves maestras...</p>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                  <th className="px-6 py-2">UID Tarjeta</th>
                  <th className="px-6 py-2">Asignada A</th>
                  <th className="px-6 py-2">Estado</th>
                  <th className="px-6 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {tarjetas.map((t) => (
                  <tr key={t._id} className="bg-slate-50 group hover:shadow-md transition-shadow">
                    <td className="px-6 py-4 rounded-l-2xl font-mono font-bold text-violet-800 text-lg">
                      {t.uid}
                    </td>
                    <td className="px-6 py-4">
                      {t.usuarioAsignado ? (
                        <div>
                          <p className="font-bold text-slate-700">{t.usuarioAsignado.nombre}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{t.usuarioAsignado.rut}</p>
                        </div>
                      ) : <span className="text-slate-400 italic">No vinculada</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        t.estado === 'ACTIVA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {t.estado}
                      </span>
                    </td>
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

      {/* MODAL DE EDICIÓN */}
      {tarjetaEditando && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-violet-900 mb-6">Configurar Tarjeta</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">UID (ID de Hardware)</label>
                <input required value={tarjetaEditando.uid} onChange={e => setTarjetaEditando({...tarjetaEditando, uid: e.target.value.toUpperCase()})} className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 font-mono font-bold text-violet-800" type="text" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Conductor Responsable</label>
                <select 
                  className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 font-semibold text-slate-700"
                  value={tarjetaEditando.usuarioAsignado?._id || tarjetaEditando.usuarioAsignado || ""}
                  onChange={e => setTarjetaEditando({...tarjetaEditando, usuarioAsignado: e.target.value})}
                >
                  <option value="">Desvincular tarjeta</option>
                  {usuarios.map((u: any) => (
                    <option key={u._id} value={u._id}>{u.nombre} ({u.rut})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Estado Operativo</label>
                <select 
                  className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 font-semibold text-slate-700"
                  value={tarjetaEditando.estado}
                  onChange={e => setTarjetaEditando({...tarjetaEditando, estado: e.target.value})}
                >
                  <option value="ACTIVA">ACTIVA (Permitir acceso)</option>
                  <option value="INACTIVA">INACTIVA (Bloqueada)</option>
                  <option value="PERDIDA">REPORTADA COMO PERDIDA</option>
                </select>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setTarjetaEditando(null)} className="font-bold text-slate-500 px-4">Cancelar</button>
                <button type="submit" className="bg-violet-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}