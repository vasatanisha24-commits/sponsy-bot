import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: 'indigo' | 'green' | 'amber' | 'rose' | 'slate';
  href?: string;
}

const accentMap = {
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  rose: 'bg-rose-50 border-rose-200 text-rose-700',
  slate: 'bg-slate-50 border-slate-200 text-slate-700',
};

const valueMap = {
  indigo: 'text-indigo-900',
  green: 'text-green-900',
  amber: 'text-amber-900',
  rose: 'text-rose-900',
  slate: 'text-slate-900',
};

export default function StatCard({
  title,
  value,
  subtitle,
  accent = 'indigo',
  href,
}: StatCardProps) {
  const content = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
        {title}
      </p>
      <p className={`text-3xl font-bold mt-2 ${valueMap[accent]}`}>{value}</p>
      {subtitle && (
        <p className="text-xs mt-1 opacity-60">{subtitle}</p>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`rounded-xl border p-5 ${accentMap[accent]} hover:shadow-md transition-shadow block`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`rounded-xl border p-5 ${accentMap[accent]}`}>
      {content}
    </div>
  );
}
