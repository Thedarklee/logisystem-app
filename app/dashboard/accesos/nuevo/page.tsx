"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistroManualPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  const [formData, setFormData] = useState({
    rut: "",
    patente: "",
    tipoMovimiento: "ENTRADA",
    isVisitante: false // NUEVO ESTADO
  });

  // --- FUNCIONES DE VALIDACIÓN ---
  const validarRutChileno = (rut: string) => {
    if (!rut) return false;
    const valor = rut.replace(/\./g, '').replace(/\s/g, '');
    return /^[0-9]+-[0-9kK]{1}$/.test(valor); 
  };
  
  const validarPatenteChilena = (patente: string) => {
    if (!patente) return false;
    const valor = patente.replace(/-/g, '').replace(/\s/g, '').toUpperCase();
    return /^([A-Z]{2}[0-9]{4}|[A-Z]{4}[0-9]{2})$/.test(valor);
  };

  // --- MANEJO DEL FORMULARIO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // 1. Validar el RUT (Aplica para ambos)
    if (!validarRutChileno(formData.rut)) {
      setStatus({ type: 'error', msg: "El RUT ingresado no es válido (Recuerda poner el guion, Ej: 12345678-9)" });
      setLoading(false);
      return; 
    }

    // 2. Validar la Patente (SOLO SI NO ES VISITANTE)
    if (!formData.isVisitante && !validarPatenteChilena(formData.patente)) {
      setStatus({ type: 'error', msg: "La Patente no es válida (Ej: ABCD12 o AB1234)" });
      setLoading(false);
      return; 
    }

    // Si todo está bien, lo enviamos a la API
    try {
      const payload = {
        rut: formData.rut.trim(),
        patente: formData.patente.toUpperCase().trim(),
        tipoMovimiento: formData.tipoMovimiento,
        isVisitante: formData.isVisitante // Lo enviamos al backend
      };

      const res = await fetch("/api/access/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', msg: data.mensaje });
        // Limpiamos todo
        setFormData({ rut: "", patente: "", tipoMovimiento: "ENTRADA", isVisitante: false }); 
      } else {
        setStatus({ type: 'error', msg: `Error API: ${data.error}` });
      }
    } catch (err: any) {
      setStatus({ type: 'error', msg: `Fallo de conexión: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-violet-900 uppercase">Registro Manual</h1>
        <p className="text-slate-500">Usa este formulario si el sistema RFID falla o para visitas.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-6">
          
          {/* Botones ENTRADA / SALIDA */}
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

          {/* CHECKBOX VISITANTE */}
          <div className="bg-violet-50 p-4 rounded-xl border border-violet-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.isVisitante} 
                onChange={(e) => setFormData({...formData, isVisitante: e.target.checked})} 
                className="w-5 h-5 rounded text-violet-600 focus:ring-violet-800" 
              />
              <span className="font-bold text-violet-900 text-sm">Registrar como Visitante Externo</span>
            </label>
            <p className="text-xs text-violet-500 mt-1 ml-8">Marca esta casilla para saltar las validaciones logísticas de envíos y flota.</p>
          </div>

          {/* RUT */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">RUT de la Persona (Con guion)</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-violet-800 outline-none transition-all font-mono font-bold text-lg"
              placeholder="12345678-9"
              value={formData.rut}
              onChange={(e) => setFormData({...formData, rut: e.target.value})}
            />
          </div>

          {/* Patente */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              {formData.isVisitante ? "Patente (Opcional)" : "Patente del Camión"}
            </label>
            <input 
              required={!formData.isVisitante} // Si es visitante, ya no es obligatoria
              type="text" 
              className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-violet-800 outline-none transition-all font-mono font-bold uppercase text-lg tracking-wider"
              placeholder={formData.isVisitante ? "Dejar vacío si entra a pie" : "ABCD-12"}
              value={formData.patente}
              onChange={(e) => setFormData({...formData, patente: e.target.value.toUpperCase()})}
            />
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
        </div>
      </form>
    </div>
  );
}