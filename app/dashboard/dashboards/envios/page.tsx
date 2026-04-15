"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const DonutChart = dynamic(() => import("./_DonutChart"), { ssr: false });

type EnviosData = {
  porEstado: { estado: string; count: number }[];
  pesoTotalMes: number;
  conRetraso: number;
  rutasFrecuentes: { ruta: string; count: number }[];
};

export default function DashboardEnviosPage() {
  const [data, setData] = useState<EnviosData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboards/envios")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error)
    return <p className="p-10 text-red-500 font-bold">Error: {error}</p>;
  if (!data)
    return <p className="p-10 text-violet-900 font-bold">Cargando análisis de envíos...</p>;

  const totalEnvios = data.porEstado.reduce((s, e) => s + e.count, 0);
  const enRuta = data.porEstado.find((e) => e.estado === "En Ruta")?.count ?? 0;
  const peso =
    data.pesoTotalMes >= 1000
      ? `${(data.pesoTotalMes / 1000).toFixed(1)} t`
      : `${data.pesoTotalMes} kg`;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-black text-violet-900 uppercase tracking-tight">
          Análisis de Envíos
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Pipeline logístico · {totalEnvios} envíos en total
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-violet-900 uppercase tracking-widest mb-6">
            Estado de Envíos
          </h3>
          {totalEnvios === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400 italic text-sm">
              No hay envíos registrados aún
            </div>
          ) : (
            <DonutChart data={data.porEstado} />
          )}
        </div>

        {/* KPIs */}
        <div className="flex flex-col gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-emerald-500 flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">En Ruta</p>
            <h2 className="text-4xl font-black text-emerald-600 mt-1">{enRuta}</h2>
            <p className="text-xs text-slate-400 mt-2">Envíos activos en camino</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-red-500 flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Con Retraso</p>
            <h2 className="text-4xl font-black text-red-600 mt-1">{data.conRetraso}</h2>
            <p className="text-xs text-slate-400 mt-2">Fecha estimada vencida</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-violet-500 flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Peso del Mes</p>
            <h2 className="text-3xl font-black text-violet-700 mt-1">{peso}</h2>
            <p className="text-xs text-slate-400 mt-2">Carga finalizada este mes</p>
          </div>
        </div>
      </div>

      {/* Rutas frecuentes */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-violet-900 uppercase tracking-widest mb-6">
          Rutas Más Frecuentes
        </h3>
        {data.rutasFrecuentes.length === 0 ? (
          <p className="text-slate-400 italic text-sm text-center py-8">Sin datos de rutas aún</p>
        ) : (
          <ul className="space-y-3">
            {data.rutasFrecuentes.map((r, i) => {
              const max = data.rutasFrecuentes[0]?.count || 1;
              const pct = Math.round((r.count / max) * 100);
              return (
                <li key={i} className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-700">{r.ruta}</span>
                      <span className="text-xs font-black text-slate-400">{r.count} envíos</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
