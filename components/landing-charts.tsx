"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const data = [
  { date: "May 1", meetings: 2, words: 450, searches: 1 },
  { date: "May 5", meetings: 4, words: 1200, searches: 3 },
  { date: "May 10", meetings: 1, words: 300, searches: 0 },
  { date: "May 15", meetings: 5, words: 1800, searches: 5 },
  { date: "May 20", meetings: 3, words: 900, searches: 2 },
];

const axisTickStyle = { fill: "#ffffff", fontSize: 12 };
const axisProps = {
  stroke: "#ffffff",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
  tick: axisTickStyle,
} as const;

export function LandingBarChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="date" {...axisProps} />
          <YAxis {...axisProps} allowDecimals={false} />
          <Tooltip 
            cursor={{ fill: '#F9FAFB' }}
            contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="meetings" fill="#4B5563" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LandingLineChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="date" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line type="monotone" dataKey="words" name="Words Captured" stroke="#1F2937" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
