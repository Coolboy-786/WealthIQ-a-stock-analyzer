"use client";

import { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts";
import type { NavHistories } from "@/types/fund-report";
import { cn } from "@/lib/utils";

type Period = keyof NavHistories;

const PERIODS: { key: Period; label: string }[] = [
  { key: "1m",  label: "1M"  },
  { key: "3m",  label: "3M"  },
  { key: "6m",  label: "6M"  },
  { key: "1y",  label: "1Y"  },
  { key: "3y",  label: "3Y"  },
  { key: "5y",  label: "5Y"  },
];

const TOOLTIP_STYLE = {
  fontSize: 11, borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.08)", background: "#0F172A",
  boxShadow: "0 8px 24px rgba(0,0,0,0.5)", padding: "6px 10px", color: "#F1F5F9",
};

interface Props {
  histories:      NavHistories;
  color?:         string;
  defaultPeriod?: Period;
  valueLabel?:    string;
  formatValue?:   (v: number) => string;
}

export function NavChart({
  histories,
  color         = "#10B981",
  defaultPeriod = "1y",
  valueLabel    = "NAV",
  formatValue   = (v) => `₹${v.toFixed(2)}`,
}: Props) {
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const data = histories[period];

  return (
    <div>
      {/* Period selector */}
      <div className="mb-4 flex items-center gap-1">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-100",
              period === key
                ? "bg-blue-500/20 text-blue-400"
                : "text-slate-600 hover:bg-white/[0.04] hover:text-slate-400",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-600">No data for this period</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#64748B", fontFamily: "IBM Plex Sans" }}
              axisLine={false} tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#94A3B8", fontWeight: 600 }}
              itemStyle={{ color }}
              formatter={(v) =>
                typeof v === "number" ? [formatValue(v), valueLabel] : [String(v), valueLabel]
              }
            />
            <Line
              type="monotone" dataKey="nav" stroke={color} strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: "#0F172A", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
