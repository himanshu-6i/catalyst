import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { FeasibilityMetric, ProjectPhase } from '../types';

interface DashboardProps {
  metrics: FeasibilityMetric[];
  timeline: ProjectPhase[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 p-3 rounded shadow-xl">
        <p className="font-semibold text-zinc-100">{label}</p>
        <p className="text-zinc-400 text-sm">Score: {payload[0].value}</p>
        {payload[0].payload.reasoning && (
           <p className="text-zinc-500 text-xs mt-1 max-w-[200px]">{payload[0].payload.reasoning}</p>
        )}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ metrics, timeline }) => {
  
  // Transform timeline for visualization
  const timelineData = timeline.map(t => ({
    name: t.phase,
    weeks: t.duration_weeks,
    complexity: t.complexity
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Feasibility Radar */}
      <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          Feasibility Analysis
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#71717a" />
              <YAxis dataKey="name" type="category" width={100} stroke="#e4e4e7" fontSize={12} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff10'}} />
              <Bar dataKey="score" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline Complexity Bubble/Bar */}
      <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
           Project Timeline & Complexity
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
              <YAxis yAxisId="left" orientation="left" stroke="#10b981" label={{ value: 'Weeks', angle: -90, position: 'insideLeft', fill: '#10b981' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" domain={[0, 10]} label={{ value: 'Complexity (1-10)', angle: 90, position: 'insideRight', fill: '#f43f5e' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="weeks" name="Duration (Weeks)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="complexity" name="Complexity Score" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;