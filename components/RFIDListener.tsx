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

        if (isInitialLoad) {
          setLatestId(data._id);
          setIsInitialLoad(false);
          return;
        }

        if (data._id !== latestId) {
          setLatestId(data._id);
          setToast(data);
          
          // El pop-up dura 6 segundos en pantalla
          setTimeout(() => setToast(null), 6000);
        }
      } catch (error) {
        console.error("Error en RFID Listener", error);
      }
    };

    const interval = setInterval(checkLatestAccess, 3000);
    return () => clearInterval(interval);
  }, [latestId, isInitialLoad]);

  if (!toast) return null;

  // 🚨 Deducimos si es un error
  const isError = toast.estado === 'FALLIDO' || toast.estado === 'ALERTA';

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex flex-col w-80 rounded-2xl shadow-2xl border overflow-hidden bg-white ${
        isError ? 'border-red-500 shadow-red-900/20' : 'border-emerald-500 shadow-emerald-900/20'
      }`}>
        
        {/* CABECERA */}
        <div className={`px-4 py-3 flex items-center justify-between text-white ${
          isError ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase">
            <span className="material-symbols-outlined">
              {isError ? 'warning' : (toast.metodo === 'RFID' ? 'sensors' : 'edit_document')}
            </span>
            {isError ? 'ALERTA DE SEGURIDAD' : `NUEVO ACCESO ${toast.metodo}`}
          </div>
          <button onClick={() => setToast(null)} className="hover:opacity-70 transition-opacity">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* CUERPO */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-4">
            
            {/* ICONO CENTRAL */}
            <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-black text-xl shadow-inner ${
              isError ? 'bg-red-100 text-red-700' : 
              (toast.tipoMovimiento === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700')
            }`}>
              <span className="material-symbols-outlined">
                {isError ? 'block' : (toast.tipoMovimiento === 'ENTRADA' ? 'login' : 'logout')}
              </span>
            </div>
            
            {/* TEXTOS PRINCIPALES */}
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isError ? 'text-red-500' : 'text-slate-400'}`}>
                {isError ? 'ACCESO DENEGADO' : `${toast.tipoMovimiento} REGISTRADA`}
              </p>
              <h4 className={`font-bold text-lg leading-tight ${isError ? 'text-red-700' : 'text-slate-800'}`}>
                {toast.conductor?.nombre || 'Desconocido'}
              </h4>
            </div>
          </div>

          {/* DETALLE INFERIOR (Error vs Patente) */}
          {isError ? (
            <div className="bg-red-50 p-3 rounded-xl border border-red-100 mt-2">
              <p className="text-xs font-bold text-red-800 leading-tight">
                {toast.observaciones}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center border border-slate-100 mt-2">
               <span className="text-xs font-bold text-slate-500">Patente:</span>
               <span className="font-mono font-black text-violet-900">{toast.vehiculo?.patente || 'N/A'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}