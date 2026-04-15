"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

type Hora = { hora: string; entradas: number; salidas: number };

export default function BarrasChart({ data }: { data: Hora[] }) {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="hora"
          width={52}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
        />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          cursor={{ fill: "#f8fafc" }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
        <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[0, 4, 4, 0]} />
        <Bar dataKey="salidas" name="Salidas" fill="#f97316" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
