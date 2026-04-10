"use client";

import { useState, useEffect } from "react";

export default function GestionUsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  // Estado para controlar la ventana flotante de edición
  const [usuarioEditando, setUsuarioEditando] = useState<any | null>(null);

  // Cargar usuarios al iniciar
  const fetchUsuarios = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Función para ELIMINAR
  const handleDelete = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${nombre}?`)) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatus({ type: 'success', msg: `Usuario ${nombre} eliminado.` });
        fetchUsuarios(); // Recargar la tabla
      } else {
        setStatus({ type: 'error', msg: "Error al eliminar usuario." });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Error de conexión." });
    }
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => setStatus(null), 3000);
  };

  // Función para GUARDAR CAMBIOS (Modificar)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando) return;

    try {
      const res = await fetch(`/api/users/${usuarioEditando._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioEditando)
      });

      if (res.ok) {
        setStatus({ type: 'success', msg: "¡Usuario actualizado correctamente!" });
        setUsuarioEditando(null); // Cerrar el modal
        fetchUsuarios(); // Recargar la tabla
      } else {
        setStatus({ type: 'error', msg: "Error al actualizar los datos." });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Error de conexión." });
    }

    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="px-10 py-8 space-y-8 relative">
      {/* Encabezado */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-violet-900 font-headline uppercase">Gestión de Personal</h2>
          <p className="text-slate-500 font-body">Verificación, modificación y control de accesos de usuarios.</p>
        </div>
      </div>

      {/* Alerta de Éxito/Error */}
      {status && (
        <div className={`p-4 rounded-xl text-sm font-bold shadow-sm ${status.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {status.msg}
        </div>
      )}

      {/* Tabla de Usuarios */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center py-10 text-slate-400 font-bold animate-pulse">Cargando base de datos...</p>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                  <th className="px-6 py-2">Personal</th>
                  <th className="px-6 py-2">Contacto</th>
                  <th className="px-6 py-2">Cargo</th>
                  <th className="px-6 py-2">Estado</th>
                  <th className="px-6 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {usuarios.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-6 text-slate-400 italic">No hay usuarios registrados.</td></tr>
                ) : usuarios.map((user) => (
                  <tr key={user._id} className="bg-slate-50 group hover:shadow-md transition-shadow">
                    <td className="px-6 py-4 rounded-l-2xl">
                      <p className="font-bold text-violet-900">{user.nombre}</p>
                      <p className="text-xs font-mono text-slate-500">RUT: {user.rut}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        {user.cargo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActivo ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Activo</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 font-bold text-xs"><div className="w-2 h-2 rounded-full bg-red-500"></div> Inactivo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 rounded-r-2xl text-right">
                      <div className="flex justify-end gap-2">
                        {/* Botón Modificar */}
                        <button 
                          onClick={() => setUsuarioEditando(user)}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Modificar Usuario"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        {/* Botón Eliminar */}
                        <button 
                          onClick={() => handleDelete(user._id, user.nombre)}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Eliminar Permanente"
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

      {/* MODAL Flotante para Editar Usuario */}
      {usuarioEditando && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-headline text-violet-900">Modificar Datos</h3>
              <button onClick={() => setUsuarioEditando(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nombre Completo</label>
                <input required value={usuarioEditando.nombre} onChange={e => setUsuarioEditando({...usuarioEditando, nombre: e.target.value})} className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" type="text" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">RUT</label>
                  <input required value={usuarioEditando.rut} onChange={e => setUsuarioEditando({...usuarioEditando, rut: e.target.value})} className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-mono font-bold text-slate-700" type="text" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Cargo</label>
                  <select required value={usuarioEditando.cargo} onChange={e => setUsuarioEditando({...usuarioEditando, cargo: e.target.value})} className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700">
                    <option value="ADMIN">ADMIN</option>
                    <option value="OPERADOR">OPERADOR</option>
                    <option value="CONDUCTOR">CONDUCTOR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Correo Electrónico</label>
                <input required value={usuarioEditando.email} onChange={e => setUsuarioEditando({...usuarioEditando, email: e.target.value})} className="w-full mt-1 bg-slate-50 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-violet-800 outline-none font-semibold text-slate-700" type="email" />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={usuarioEditando.isActivo} onChange={e => setUsuarioEditando({...usuarioEditando, isActivo: e.target.checked})} className="w-5 h-5 rounded text-violet-600 focus:ring-violet-800" />
                  <span className="font-bold text-slate-700 text-sm">Usuario Activo en el Sistema</span>
                </label>
                <p className="text-xs text-slate-400 mt-1 ml-8">Si desactivas esta casilla, el usuario no podrá hacer login ni ser asignado a envíos.</p>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setUsuarioEditando(null)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" className="bg-violet-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-violet-900 transition-colors">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}