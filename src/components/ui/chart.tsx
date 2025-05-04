
import * as React from "react";
import { Line, Bar, Pie, Area, LineChart, BarChart, PieChart, AreaChart } from "recharts";
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Recharts already exports these components, so we just create an export wrapper
export {
  Line,
  Bar, 
  Pie, 
  Area,
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
};

// Create an AxisLeft component for convenience
export const AxisLeft = (props: any) => {
  return <YAxis {...props} orientation="left" />;
};

// Create an AxisBottom component for convenience
export const AxisBottom = (props: any) => {
  return <XAxis {...props} orientation="bottom" />;
};
