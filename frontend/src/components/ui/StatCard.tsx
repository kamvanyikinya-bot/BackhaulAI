import { cn } from '../../lib/utils';
export function StatCard({ label, value, icon, trend, className }: { label: string; value: string | number; icon: React.ReactNode; trend?: { value: number; positive: boolean }; className?: string }) {
  return <div className={cn('bg-white rounded-xl border border-gray-200 p-4 shadow-sm', className)}>
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && <p className={`text-xs font-medium mt-0.5 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>{trend.positive ? '↑' : '↓'} {trend.value}%</p>}
      </div>
      <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 ml-3">{icon}</div>
    </div>
  </div>;
}