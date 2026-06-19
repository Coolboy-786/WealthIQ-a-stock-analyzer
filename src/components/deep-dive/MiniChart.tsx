"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid,
} from "recharts";
import type { ChartPoint } from "@/types/report";

interface MiniChartProps {
  data:    ChartPoint[];
  type?:   "bar" | "line";
  color?:  string;
  label?:  string;
  height?: number;
}

const TOOLTIP_STYLE = {
  fontSize:        11,
  borderRadius:    8,
  border:          "1px solid rgba(255,255,255,0.08)",
  background:      "#0F172A",
  boxShadow:       "0 8px 24px rgba(0,0,0,0.5)",
  padding:         "6px 10px",
  color:           "#F1F5F9",
};

export function MiniChart({
  data,
  type   = "bar",
  color  = "#3B82F6",
  label,
  height = 160,
}: MiniChartProps) {
  const chartData = data
    .filter((p) => p.value.available)
    .map((p) => ({ label: p.label, value: p.value.available ? p.value.value : 0 }));

  if (chartData.length === 0) return null;

  return (
    <div>
      {label && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {type === "bar" ? (
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#64748B", fontFamily: "IBM Plex Sans" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#94A3B8", fontWeight: 600 }}
              itemStyle={{ color }}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#64748B", fontFamily: "IBM Plex Sans" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#94A3B8", fontWeight: 600 }}
              itemStyle={{ color }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 4, fill: color, stroke: "#0F172A", strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
