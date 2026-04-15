"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AreaChartSemanal = dynamic(() => import("./_AreaChart"), { ssr: false });

type Dia = {
  dia: string;
  fecha: string;
  entradas: number;
  salidas: number;
  alertas: number;
};

type TendenciaData = {
  dias: Dia[];
  totalSemana: number;
  alertasSemana: number;
};

export default function DashboardTendenciaPage() {
  const [data, setData] = useState<TendenciaData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboards/tendencia")
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
    return <p className="p-10 text-violet-900 font-bold">Cargando tendencia semanal...</p>;

  const hoy = data.dias[data.dias.length - 1];
  const ayer = data.dias[data.dias.length - 2];
  const totalHoy = hoy ? hoy.entradas + hoy.salidas : 0;
  const totalAyer = ayer ? ayer.entradas + ayer.salidas : 0;
  const variacion = totalAyer > 0
    ? Math.round(((totalHoy - totalAyer) / totalAyer) * 100)
    : 0;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-black text-violet-900 uppercase tracking-tight">
          Tendencia Semanal
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Actividad de los últimos 7 días
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-violet-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Total Semana
          </p>
          <h2 className="text-4xl font-black text-slate-800 mt-1">{data.totalSemana}</h2>
          <p className="text-xs text-slate-400 mt-2">Movimientos últimos 7 días</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-emerald-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Hoy vs Ayer
          </p>
          <h2 className={`text-4xl font-black mt-1 ${variacion >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {variacion >= 0 ? "+" : ""}{variacion}%
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            {totalHoy} hoy · {totalAyer} ayer
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-amber-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Alertas Semana
          </p>
          <h2 className="text-4xl font-black text-amber-600 mt-1">{data.alertasSemana}</h2>
          <p className="text-xs text-slate-400 mt-2">Accesos con estado ALERTA</p>
        </div>
      </div>

      {/* Área chart semanal */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-violet-900 uppercase tracking-widest mb-6">
          Entradas y Salidas — Últimos 7 Días
        </h3>
        {data.totalSemana === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400 italic text-sm">
            Sin movimientos en los últimos 7 días
          </div>
        ) : (
          <AreaChartSemanal data={data.dias} />
        )}
      </div>

      {/* Tabla resumen por día */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-violet-900 uppercase tracking-widest mb-6">
          Detalle por Día
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                <th className="pb-3 px-2">Día</th>
                <th className="pb-3 px-2">Fecha</th>
                <th className="pb-3 px-2">Entradas</th>
                <th className="pb-3 px-2">Salidas</th>
                <th className="pb-3 px-2">Alertas</th>
                <th className="pb-3 px-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.dias.map((d, i) => {
                const total = d.entradas + d.salidas;
                const esHoy = i === data.dias.length - 1;
                return (
                  <tr key={i} className={`transition-colors ${esHoy ? "bg-violet-50" : "hover:bg-slate-50"}`}>
                    <td className="py-3 px-2 font-black text-sm text-slate-700">
                      {d.dia}
                      {esHoy && (
                        <span className="ml-2 text-[9px] bg-violet-200 text-violet-800 px-2 py-0.5 rounded-full font-black uppercase">
                          Hoy
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-xs text-slate-400">{d.fecha}</td>
                    <td className="py-3 px-2">
                      <span className="text-sm font-bold text-emerald-600">{d.entradas}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm font-bold text-orange-500">{d.salidas}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-sm font-bold ${d.alertas > 0 ? "text-amber-500" : "text-slate-300"}`}>
                        {d.alertas}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-black text-sm text-slate-700">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
