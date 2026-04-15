"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORES = ["#6366f1", "#f59e0b", "#10b981", "#94a3b8"];

type Slice = { estado: string; count: number };

export default function DonutChart({ data }: { data: Slice[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="estado"
          cx="50%"
          cy="50%"
          innerRadius={68}
          outerRadius={115}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORES[i % COLORES.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
