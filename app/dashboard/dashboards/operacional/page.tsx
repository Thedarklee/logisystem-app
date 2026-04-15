"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const BarrasChart = dynamic(() => import("./_BarrasChart"), { ssr: false });

type OperacionalData = {
  vehiculosDentro: number;
  alertasHoy: number;
  fallosHoy: number;
  metodos: { automatico: number; manual: number };
  accesosPorHora: { hora: string; entradas: number; salidas: number }[];
};

export default function DashboardAccesosPage() {
  const [data, setData] = useState<OperacionalData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () =>
      fetch("/api/dashboards/operacional")
        .then((r) => r.json())
        .then((json) => {
          if (json.error) throw new Error(json.error);
          setData(json);
        })
        .catch((e: Error) => setError(e.message));
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  if (error)
    return <p className="p-10 text-red-500 font-bold">Error: {error}</p>;
  if (!data)
    return <p className="p-10 text-violet-900 font-bold">Cargando panel de accesos...</p>;

  const totalHoy = data.metodos.automatico + data.metodos.manual;
  const conActividad = data.accesosPorHora.filter(
    (h) => h.entradas > 0 || h.salidas > 0
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-black text-violet-900 uppercase tracking-tight">
          Accesos por Hora
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Tiempo real · Actualización automática cada 30 s
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border-l-4 border-violet-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dentro ahora</p>
          <h2 className="text-3xl font-black text-violet-700 mt-1">{data.vehiculosDentro}</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border-l-4 border-amber-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alertas hoy</p>
          <h2 className="text-3xl font-black text-amber-600 mt-1">{data.alertasHoy}</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border-l-4 border-red-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fallos hoy</p>
          <h2 className="text-3xl font-black text-red-600 mt-1">{data.fallosHoy}</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border-l-4 border-emerald-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total hoy</p>
          <h2 className="text-3xl font-black text-emerald-600 mt-1">{totalHoy}</h2>
        </div>
      </div>

      {/* Barras horizontales por hora */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-violet-900 uppercase tracking-widest mb-6">
          Distribución de Accesos — Hoy
        </h3>
        {conActividad.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 italic text-sm">
            Sin movimientos registrados hoy
          </div>
        ) : (
          <BarrasChart data={conActividad} />
        )}
      </div>

      {/* RFID vs Manual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-violet-600">nfc</span>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Automático (RFID)</p>
            <p className="text-3xl font-black text-violet-700">{data.metodos.automatico}</p>
            <p className="text-xs text-slate-400">
              {totalHoy > 0 ? Math.round((data.metodos.automatico / totalHoy) * 100) : 0}% del total hoy
            </p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-500">edit_note</span>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Manual</p>
            <p className="text-3xl font-black text-slate-700">{data.metodos.manual}</p>
            <p className="text-xs text-slate-400">
              {totalHoy > 0 ? Math.round((data.metodos.manual / totalHoy) * 100) : 0}% del total hoy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
