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
    // Limpia puntos y espacios
    const valor = rut.replace(/\./g, '').replace(/\s/g, '');
    if (!/^[0-9]+-[0-9kK]{1}$/.test(valor)) return false; // Verifica formato básico 12345678-9
    
    const [numero, digitoVerificador] = valor.split('-');
    let rutNum = parseInt(numero, 10);
    let m = 0, s = 1;
    for (; rutNum; rutNum = Math.floor(rutNum / 10)) {
      s = (s + rutNum % 10 * (9 - m++ % 6)) % 11;
    }
    const dvEsperado = s ? (s - 1).toString() : 'K';
    return dvEsperado === digitoVerificador.toUpperCase();
  };

  const validarPatenteChilena = (patente: string) => {
    // Remueve guiones y espacios, todo a mayúsculas
    const valor = patente.replace(/-/g, '').replace(/\s/g, '').toUpperCase();
    // Verifica Formato Viejo (2 letras, 4 números) o Nuevo (4 letras, 2 números)
    return /^([A-Z]{2}[0-9]{4}|[A-Z]{4}[0-9]{2})$/.test(valor);
  };

  // --- MANEJO DEL FORMULARIO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // 1. Validar el RUT
    if (!validarRutChileno(formData.rut)) {
      setStatus({ type: 'error', msg: "El RUT ingresado no es válido (Ej: 12345678-9)" });
      setLoading(false);
      return; // Detiene el envío
    }

    // 2. Validar la Patente
    if (!validarPatenteChilena(formData.patente)) {
      setStatus({ type: 'error', msg: "La Patente no es válida (Ej: ABCD12 o AB1234)" });
      setLoading(false);
      return; // Detiene el envío
    }

    // Si todo está bien, lo enviamos a la API
    try {
      const res = await fetch("/api/access/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rut: formData.rut.replace(/\./g, ''), // Enviamos el RUT limpio a la base de datos
          patente: formData.patente.replace(/-/g, '').toUpperCase(), // Enviamos patente limpia
          tipoMovimiento: formData.tipoMovimiento
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', msg: "¡Acceso registrado correctamente!" });
        setFormData({ rut: "", patente: "", tipoMovimiento: "ENTRADA" }); // Limpiar
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
        <h1 className="text-3xl font-black text-violet-900 uppercase">Registro Manual de Acceso</h1>
        <p className="text-slate-500">Usa este formulario si el sistema RFID no detecta al conductor.</p>
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

          {/* RUT del Conductor */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">RUT del Conductor</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">badge</span>
              <input 
                required
                type="text" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-violet-800 outline-none transition-all font-mono font-bold text-lg"
                placeholder="12345678-9"
                value={formData.rut}
                onChange={(e) => setFormData({...formData, rut: e.target.value})}
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
            {loading ? "VALIDANDO..." : "CONFIRMAR REGISTRO"}
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