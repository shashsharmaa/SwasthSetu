import { CheckCircle, Landmark, ShieldCheck } from 'lucide-react';

const headerContent = {
  insurance: {
    badge: 'Private Health Insurance',
    heading: 'Find Hospitals by Insurance',
    wrapperClassName: 'border-teal-100/50 bg-gradient-to-r from-teal-50/50 to-blue-50/50',
    badgeClassName: 'border border-teal-100 bg-teal-50 text-teal-700',
    subtext: 'Explore hospitals associated with your selected provider and location.',
    Icon: ShieldCheck,
  },
  scheme: {
    badge: 'Government Scheme',
    heading: 'Find Hospitals by Government Scheme',
    wrapperClassName: 'border-green-100/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50',
    badgeClassName: 'border border-green-200 bg-green-50 text-green-700',
    subtext: 'Explore hospitals associated with your selected scheme and location.',
    Icon: Landmark,
  },
};

export default function DashboardHeader({ type, totalHospitals = 0, hasSearched = false }) {
  const content = headerContent[type] || headerContent.insurance;
  const { Icon } = content;
  const showHospitalCount = hasSearched || totalHospitals > 0;

  return (
    <div className={`mb-8 flex w-full flex-col items-center justify-between gap-6 rounded-3xl border p-8 text-left ${content.wrapperClassName} md:flex-row`}>
      <div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${content.badgeClassName}`}>
          <Icon size={16} />
          {content.badge}
        </span>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">{content.heading}</h1>
        <p className="mt-2 text-slate-500">{content.subtext}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          {showHospitalCount && <span>{totalHospitals} Hospitals found</span>}
          {showHospitalCount && <span aria-hidden="true">|</span>}
          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500" /> Verified Sources</span>
        </div>
      </div>
      <div className="hidden overflow-hidden rounded-xl md:block">
        <img src="/header-illustration.png" alt="Hospital Illustration" className="w-72 border-none object-cover" />
      </div>
    </div>
  );
}
