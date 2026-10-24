import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Dock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('mx-auto flex w-fit max-w-full items-end gap-4 rounded-2xl border border-slate-200 bg-white/70 px-8 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-md', className)}
      aria-label="Dashboard navigation"
    >
      {children}
    </motion.nav>
  );
}

export function DockItem({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return (
    <div className="group relative flex flex-col items-center">
      <motion.button
        type="button"
        whileHover={{ y: -5, scale: 1.12 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 420, damping: 20 }}
        onClick={onClick}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
        aria-label={label}
      >
        {children}
      </motion.button>
    </div>
  );
}

export function DockIcon({ children }: { children: ReactNode }) {
  return children;
}
