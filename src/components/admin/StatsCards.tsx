"use client";

interface StatItem {
  label: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
}

interface StatsCardsProps {
  stats: StatItem[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 relative overflow-hidden flex flex-col justify-between h-full">
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${stat.color}`}></div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-500 text-sm font-medium leading-tight">{stat.label}</h3>
            {stat.icon && <div className="text-slate-400">{stat.icon}</div>}
          </div>
          <div className="text-2xl md:text-3xl font-bold text-slate-800">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
