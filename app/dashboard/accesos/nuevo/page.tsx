"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistroManualPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  const [formData, setFormData] = useState({
    nombreConductor: "",
    patente: "",
    tipoMovimiento: "ENTRADA"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/access/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', msg: "Acceso registrado correctamente." });
        // Limpiamos el formulario para el siguiente camión
        setFormData({ nombreConductor: "", patente: "", tipoMovimiento: "ENTRADA" });
      } else {
        setStatus({ type: 'error', msg: data.error || "Error al registrar acceso." });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: "Fallo de conexión con el servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-violet-900 font-headline uppercase">Registro Manual de Acceso</h1>
        <p className="text-slate-500">Usa este formulario si el sistema RFID no detecta al conductor.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-6">
          
          {/* Selector de Movimiento (Botones grandes) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, tipoMovimiento: 'ENTRADA'})}
              className={`py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border-2 ${
                formData.tipoMovimiento === 'ENTRADA' 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined">login</span> ENTRADA
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, tipoMovimiento: 'SALIDA'})}
              className={`py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border-2 ${
                formData.tipoMovimiento === 'SALIDA' 
                ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200' 
                : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined">logout</span> SALIDA
            </button>
          </div>

          <hr className="border-slate-100" />

          {/* Nombre del Conductor */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre del Conductor</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
              <input 
                required
                type="text" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-violet-800 outline-none transition-all font-semibold"
                placeholder="Nombre completo"
                value={formData.nombreConductor}
                onChange={(e) => setFormData({...formData, nombreConductor: e.target.value})}
              />
            </div>
          </div>

          {/* Patente */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Patente del Vehículo</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">local_shipping</span>
              <input 
                required
                type="text" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-violet-800 outline-none transition-all font-mono font-bold uppercase text-lg tracking-wider"
                placeholder="ABCD-12"
                value={formData.patente}
                onChange={(e) => setFormData({...formData, patente: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          {/* Mensaje de Feedback */}
          {status && (
            <div className={`p-4 rounded-2xl font-bold text-center text-sm ${status.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {status.msg}
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-violet-800 hover:bg-violet-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-violet-800/20 transition-all disabled:opacity-50 active:scale-95 text-lg"
          >
            {loading ? "PROCESANDO..." : "CONFIRMAR REGISTRO"}
          </button>
          <button 
            type="button"
            onClick={() => router.back()}
            className="w-full py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Volver al listado
          </button>
        </div>
      </form>
    </div>
  );
}