import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const gradientCardVariants = cva(
  'group relative isolate flex min-h-[330px] flex-col overflow-hidden rounded-3xl p-6 text-slate-800 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-shadow duration-300 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:p-8',
  {
    variants: {
      gradient: {
        teal: 'border border-teal-100 bg-gradient-to-br from-teal-50 to-teal-100/50',
        blue: 'border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50',
        slate: 'border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50',
        emerald: 'border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50',
      },
    },
    defaultVariants: {
      gradient: 'teal',
    },
  },
);

type GradientCardProps = VariantProps<typeof gradientCardVariants> & {
  badgeText: string;
  badgeColor: string;
  title: string;
  description: string;
  imageUrl?: string;
  icon?: ReactNode;
};

export function GradientCard({
  badgeText,
  badgeColor,
  title,
  description,
  imageUrl = '',
  icon,
  gradient,
}: GradientCardProps) {
  return (
    <motion.article
      className={cn(gradientCardVariants({ gradient }))}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
      {imageUrl ? (
        <img src={imageUrl} alt="" className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-20 mix-blend-screen" />
      ) : null}
      {icon ? (
        <div className="pointer-events-none absolute right-7 top-7 -z-0 text-teal-700/20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
          {icon}
        </div>
      ) : null}

      <div className="relative z-10 flex items-center justify-between gap-4">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-sm"
          style={{ backgroundColor: badgeColor }}
        >
          {badgeText}
        </span>
      </div>
      <div className="relative z-10 mt-auto max-w-xl">
        <h3 className="text-3xl font-bold tracking-tight text-slate-800">{title}</h3>
        <p className="mt-4 max-w-lg text-base leading-7 text-slate-800/80">{description}</p>
      </div>
    </motion.article>
  );
}
