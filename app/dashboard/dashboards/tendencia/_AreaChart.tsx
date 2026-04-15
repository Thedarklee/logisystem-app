"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

type Dia = { dia: string; fecha: string; entradas: number; salidas: number; alertas: number };

export default function AreaChartSemanal({ data }: { data: Dia[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradSalidas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
        <Area
          type="monotone"
          dataKey="entradas"
          name="Entradas"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#gradEntradas)"
          dot={{ r: 4, fill: "#10b981" }}
        />
        <Area
          type="monotone"
          dataKey="salidas"
          name="Salidas"
          stroke="#f97316"
          strokeWidth={2}
          fill="url(#gradSalidas)"
          dot={{ r: 4, fill: "#f97316" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
