'use client';

interface TopbarProps {
  title: string;
  plan?: string;
  email?: string;
}

export default function Topbar({ title, plan = 'Free', email }: TopbarProps) {
  return (
    <div className="mb-8 flex justify-between items-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="flex items-center space-x-4">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {plan}
        </span>
        {email && <span className="text-gray-600">{email}</span>}
      </div>
    </div>
  );
}
