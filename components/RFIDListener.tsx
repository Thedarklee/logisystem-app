"use client";
import { useEffect, useState } from "react";

export default function RFIDListener() {
  const [latestId, setLatestId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [toast, setToast] = useState<any | null>(null);

  useEffect(() => {
    const checkLatestAccess = async () => {
      try {
        const res = await fetch('/api/access/latest');
        if (!res.ok) return;
        const data = await res.json();

        if (!data) return;

        // Si es la primera vez que carga la página, solo guardamos el ID para no mostrar un pop-up viejo
        if (isInitialLoad) {
          setLatestId(data._id);
          setIsInitialLoad(false);
          return;
        }

        // Si el ID que llegó es distinto al que teníamos guardado... ¡ES UN ACCESO NUEVO!
        if (data._id !== latestId) {
          setLatestId(data._id);
          
          // Mostramos el Pop-up
          setToast(data);

          // Ocultamos el Pop-up después de 5 segundos
          setTimeout(() => {
            setToast(null);
          }, 5000);
        }
      } catch (error) {
        console.error("Error en RFID Listener", error);
      }
    };

    // Revisamos cada 3 segundos (3000 ms)
    const interval = setInterval(checkLatestAccess, 3000);
    return () => clearInterval(interval);
  }, [latestId, isInitialLoad]);

  // Si no hay toast que mostrar, no renderizamos nada
  if (!toast) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex flex-col w-80 rounded-2xl shadow-2xl border overflow-hidden bg-white ${
        toast.estado === 'EXITOSO' ? 'border-emerald-500' : 'border-red-500'
      }`}>
        
        {/* Cabecera del Pop-up */}
        <div className={`px-4 py-3 flex items-center justify-between text-white ${
          toast.estado === 'EXITOSO' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase">
            <span className="material-symbols-outlined">
              {toast.metodo === 'RFID' ? 'sensors' : 'notifications_active'}
            </span>
            NUEVO ACCESO {toast.metodo}
          </div>
          <button onClick={() => setToast(null)} className="hover:opacity-70 transition-opacity">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Cuerpo del Pop-up */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner ${
              toast.tipoMovimiento === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
            }`}>
              <span className="material-symbols-outlined">
                {toast.tipoMovimiento === 'ENTRADA' ? 'login' : 'logout'}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {toast.tipoMovimiento} REGISTRADA
              </p>
              <h4 className="font-bold text-slate-800 text-lg leading-tight">
                {toast.conductor?.nombre || 'Desconocido'}
              </h4>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center border border-slate-100">
             <span className="text-xs font-bold text-slate-500">Patente:</span>
             <span className="font-mono font-black text-violet-900">{toast.vehiculo?.patente || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}