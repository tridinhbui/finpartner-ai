
import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';
import { ChartConfig } from '../types';
import { COLORS } from '../constants';

interface FinancialChartProps {
  config: ChartConfig;
}

const FinancialChart: React.FC<FinancialChartProps> = ({ config }) => {
  if (!config.data || config.data.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">No data available</div>;
  }

  const renderChart = () => {
    const commonProps = {
        data: config.data,
        margin: { top: 20, right: 30, left: 0, bottom: 20 }
    };

    const AxisProps = {
        stroke: "#94a3b8",
        fontSize: 12,
        tickLine: false,
        axisLine: false,
        dy: 10
    };

    // Note: Recharts styles are inline, so we use CSS variables or detect theme if possible.
    // However, for simplicity in XML output without context hooks here, we use neutral/transparent colors that work on both.
    const TooltipStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        fontSize: '13px',
        padding: '12px 16px',
        color: '#1e293b'
    };

    return (
      <div className="w-full h-full">
         {/* Switch logic based on type */}
         {config.type === 'line' && (
            <LineChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey={config.xAxisKey} {...AxisProps} />
                <YAxis {...AxisProps} tickFormatter={(val) => typeof val === 'number' ? val.toLocaleString() : val} />
                <Tooltip contentStyle={TooltipStyle} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                {config.dataKeys.map((key, index) => (
                <Line 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    stroke={COLORS[index % COLORS.length]} 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#fff', stroke: COLORS[index % COLORS.length], strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
                ))}
            </LineChart>
         )}
         {config.type === 'area' && (
             <AreaChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey={config.xAxisKey} {...AxisProps} />
                <YAxis {...AxisProps} />
                <Tooltip contentStyle={TooltipStyle} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                {config.dataKeys.map((key, index) => (
                <Area 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    stroke={COLORS[index % COLORS.length]} 
                    fill={COLORS[index % COLORS.length]} 
                    fillOpacity={0.15}
                    strokeWidth={2}
                />
                ))}
            </AreaChart>
         )}
         {config.type === 'composed' && (
            <ComposedChart {...commonProps}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                 <XAxis dataKey={config.xAxisKey} {...AxisProps} />
                 <YAxis {...AxisProps} />
                 <Tooltip contentStyle={TooltipStyle} />
                 <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                 <Bar dataKey={config.dataKeys[0]} barSize={40} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                 {config.dataKeys.slice(1).map((key, index) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={COLORS[(index + 1) % COLORS.length]} strokeWidth={3} dot={{r:4}} />
                 ))}
            </ComposedChart>
         )}
         {(config.type === 'bar' || !config.type) && (
             <BarChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey={config.xAxisKey} {...AxisProps} />
                <YAxis {...AxisProps} tickFormatter={(val) => typeof val === 'number' ? val.toLocaleString() : val} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TooltipStyle} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                {config.dataKeys.map((key, index) => (
                <Bar 
                    key={key} 
                    dataKey={key} 
                    fill={COLORS[index % COLORS.length]} 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                />
                ))}
            </BarChart>
         )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-800 p-6 transition-colors duration-300">
      <div className="mb-8 border-l-4 border-slate-800 dark:border-slate-400 pl-4">
         <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight uppercase">
            {config.title}
         </h3>
         {config.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-3xl">{config.description}</p>}
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialChart;
