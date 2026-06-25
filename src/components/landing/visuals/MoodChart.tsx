import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const SCHOOL = [
  { d: "Sen", v: 78 }, { d: "Sel", v: 82 }, { d: "Rab", v: 75 },
  { d: "Kam", v: 80 }, { d: "Jum", v: 88 },
];
const HOME = [
  { d: "Sen", v: 62 }, { d: "Sel", v: 58 }, { d: "Rab", v: 64 },
  { d: "Kam", v: 50 }, { d: "Jum", v: 55 },
];
const DARK = [
  { d: "W1", v: 70 }, { d: "W2", v: 72 }, { d: "W3", v: 65 },
  { d: "W4", v: 78 }, { d: "W5", v: 60 }, { d: "W6", v: 74 },
  { d: "W7", v: 82 }, { d: "W8", v: 68 }, { d: "W9", v: 86 },
];

export function MoodChart({ variant }: { variant: "school" | "home" | "dark" }) {
  const data = variant === "school" ? SCHOOL : variant === "home" ? HOME : DARK;
  const stroke =
    variant === "school"
      ? "oklch(0.42 0.10 165)"
      : variant === "home"
      ? "oklch(0.36 0.13 265)"
      : "oklch(0.80 0.16 165)";
  const id = `g-${variant}`;
  const grid = variant === "dark" ? "rgba(255,255,255,0.08)" : "var(--color-border)";
  const tick = variant === "dark" ? "rgba(255,255,255,0.6)" : "var(--color-muted-foreground)";

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="d" stroke={tick} tickLine={false} axisLine={false} fontSize={11} />
          <YAxis stroke={tick} tickLine={false} axisLine={false} fontSize={11} domain={[40, 100]} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              fontSize: 12,
              background: variant === "dark" ? "rgba(20,20,30,0.95)" : "white",
              color: variant === "dark" ? "white" : "inherit",
            }}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={2.5}
            fill={`url(#${id})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
