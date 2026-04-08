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
    tipoMovimiento: "ENTRADA"
  });

  // --- FUNCIONES DE VALIDACIÓN ---
const validarRutChileno = (rut: string) => {
    if (!rut) return false;
    // Limpia puntos y espacios
    const valor = rut.replace(/\./g, '').replace(/\s/g, '');
    
    // Solo verifica el FORMATO: (números) seguido de (-) seguido de (1 número o K)
    // No hace el cálculo matemático del Módulo 11.
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

    console.log("1. Botón presionado. Iniciando validaciones...");

    // 1. Validar el RUT
    if (!validarRutChileno(formData.rut)) {
      console.log("❌ Falló validación de RUT Frontend");
      setStatus({ type: 'error', msg: "El RUT ingresado no es válido (Recuerda poner el guion, Ej: 12345678-9)" });
      setLoading(false);
      return; 
    }

    // 2. Validar la Patente
    if (!validarPatenteChilena(formData.patente)) {
      console.log("❌ Falló validación de Patente Frontend");
      setStatus({ type: 'error', msg: "La Patente no es válida (Ej: ABCD12 o AB1234)" });
      setLoading(false);
      return; 
    }

    console.log("✅ Validaciones Frontend pasadas. Enviando a la API...");

    // Si todo está bien, lo enviamos a la API
    try {
      const payload = {
        rut: formData.rut.trim(), // Lo enviamos tal cual lo escribes
        patente: formData.patente.toUpperCase().trim(), // Lo enviamos tal cual, con guion
        tipoMovimiento: formData.tipoMovimiento
        };

      console.log("2. Datos exactos que se envían a la BD:", payload);

      const res = await fetch("/api/access/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("3. Respuesta del servidor:", res.status, data);

      if (res.ok) {
        setStatus({ type: 'success', msg: "¡Acceso registrado correctamente!" });
        setFormData({ rut: "", patente: "", tipoMovimiento: "ENTRADA" }); 
      } else {
        setStatus({ type: 'error', msg: `Error API: ${data.error}` });
      }
    } catch (err: any) {
      console.error("Error catastrófico en la conexión:", err);
      setStatus({ type: 'error', msg: `Fallo de conexión: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      
      {/* 🛠️ CAJA DE DEBUG VISUAL (Borrar cuando todo funcione) 🛠️ */}
      <div className="bg-slate-900 text-emerald-400 p-6 rounded-2xl font-mono text-sm shadow-xl border border-slate-700">
        <h3 className="text-white font-black mb-2 border-b border-slate-700 pb-2">📟 PANTALLA DE DEBUG (EN VIVO)</h3>
        <ul className="space-y-1">
          <li><strong>RUT escrito:</strong> <span className="text-white">"{formData.rut}"</span></li>
          <li><strong>¿RUT es válido matemáticamente?:</strong> {validarRutChileno(formData.rut) ? <span className="text-emerald-400">SÍ ✅</span> : <span className="text-red-400">NO ❌</span>}</li>
          <li className="pt-2"><strong>Patente escrita:</strong> <span className="text-white">"{formData.patente}"</span></li>
          <li><strong>¿Patente válida?:</strong> {validarPatenteChilena(formData.patente) ? <span className="text-emerald-400">SÍ ✅</span> : <span className="text-red-400">NO ❌</span>}</li>
          <li className="pt-2"><strong>Movimiento:</strong> <span className="text-amber-400">{formData.tipoMovimiento}</span></li>
        </ul>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-violet-900 uppercase">Registro Manual</h1>
        <p className="text-slate-500">Usa este formulario si el sistema RFID falla.</p>
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

          {/* RUT */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">RUT del Conductor (Con guion)</label>
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
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Patente</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-violet-800 outline-none transition-all font-mono font-bold uppercase text-lg tracking-wider"
              placeholder="ABCD-12"
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