"use client";

import React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Define color schemes
const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A4DE6C",
  "#8884D8", "#82CA9D", "#FF6E76", "#4ECDC4", "#FFA600"
];

// BarChart Component
interface BarChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  layout?: "horizontal" | "vertical";
}

export function BarChart({
  data,
  categories,
  index,
  colors = COLORS,
  layout = "horizontal",
}: BarChartProps) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        {layout === "horizontal" ? (
          <>
            <XAxis dataKey={index} />
            <YAxis />
          </>
        ) : (
          <>
            <XAxis type="number" />
            <YAxis dataKey={index} type="category" />
          </>
        )}
        <Tooltip />
        <Legend />
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[i % colors.length]}
            barSize={layout === "horizontal" ? 20 : 15}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

// LineChart Component
interface LineChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
}

export function LineChart({
  data,
  categories,
  index,
  colors = COLORS,
}: LineChartProps) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey={index} />
        <YAxis />
        <Tooltip />
        <Legend />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

// PieChart Component
interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
}

export function PieChart({ data, colors = COLORS }: PieChartProps) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}