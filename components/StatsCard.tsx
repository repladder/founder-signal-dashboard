interface StatsCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

export default function StatsCard({ label, value, sublabel }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
      {sublabel && <div className="text-sm text-gray-500 mt-1">{sublabel}</div>}
    </div>
  );
}
