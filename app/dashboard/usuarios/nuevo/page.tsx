"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistroUsuarioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    email: "",
    password: "",
    cargo: "CONDUCTOR",
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', msg: "¡Usuario creado correctamente!" });
        setFormData({ nombre: "", rut: "", email: "", password: "", cargo: "CONDUCTOR" });
        // Opcional: Redirigir después de 2 segundos
        // setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setStatus({ type: 'error', msg: data.error || "Error al registrar" });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: "Error de conexión con el servidor" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-violet-900 font-headline">NUEVO USUARIO</h1>
        <p className="text-slate-500">Registra conductores, operadores o administradores al sistema.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Nombre Completo */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre Completo</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-violet-800 outline-none transition-all"
              placeholder="Ej: Juan Pérez"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          {/* RUT */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">RUT</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-violet-800 outline-none transition-all"
              placeholder="12.345.678-9"
              value={formData.rut}
              onChange={(e) => setFormData({...formData, rut: e.target.value})}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
            <input 
              required
              type="email" 
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-violet-800 outline-none transition-all"
              placeholder="usuario@logisystem.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Contraseña Temporal</label>
            <input 
              required
              type="password" 
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-violet-800 outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {/* Cargo Selector */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Rol en el Sistema</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-violet-800 outline-none appearance-none cursor-pointer"
              value={formData.cargo}
              onChange={(e) => setFormData({...formData, cargo: e.target.value})}
            >
              <option value="CONDUCTOR">Conductor (Acceso RFID)</option>
              <option value="OPERADOR">Operador (Gestión de Envíos)</option>
              <option value="ADMIN">Administrador Total</option>
            </select>
          </div>
        </div>

        {/* Mensajes de Status */}
        {status && (
          <div className={`mx-8 p-4 rounded-xl font-bold text-sm ${status.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            {status.msg}
          </div>
        )}

        {/* Footer con Botones */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="bg-violet-800 hover:bg-violet-900 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-violet-800/20 transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? "Registrando..." : "Guardar Usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}