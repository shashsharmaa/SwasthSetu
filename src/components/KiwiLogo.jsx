import { motion } from 'framer-motion';

export default function KiwiLogo({ className = 'h-14 w-14' }) {
  const eyeAnimation = {
    scaleY: [1, 1, 0.08, 1, 1],
    x: [0, 2, 2, -2, 0],
  };

  return (
    <div className={`relative overflow-visible ${className}`} aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,#ffffff_0%,#67e8f9_18%,#2563eb_48%,#7c3aed_68%,#ef4444_88%,#facc15_100%)] shadow-[inset_-8px_-10px_18px_rgba(30,41,59,0.35),inset_8px_8px_14px_rgba(255,255,255,0.65),0_8px_20px_rgba(13,148,136,0.3)]" />
      <div className="absolute -inset-2 -z-10 rounded-full bg-black/10 blur-md" />
      <div className="absolute inset-0 flex items-center justify-center gap-2">
        <motion.div
          className="h-5 w-2.5 rounded-full bg-white shadow-sm"
          animate={eyeAnimation}
          transition={{ duration: 3.4, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
        />
        <motion.div
          className="h-5 w-2.5 rounded-full bg-white shadow-sm"
          animate={eyeAnimation}
          transition={{ duration: 3.4, delay: 0.08, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
