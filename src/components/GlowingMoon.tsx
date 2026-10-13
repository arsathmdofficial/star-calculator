import React, { useState } from 'react';

interface GlowingMoonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showAura?: boolean;
}

export const GlowingMoon: React.FC<GlowingMoonProps> = ({
  size = 'md',
  className = '',
  showAura = true,
}) => {
  const [imageError, setImageError] = useState(false);

  // Size configurations
  const sizeClasses = {
    sm: 'w-16 h-16 md:w-20 md:h-20',
    md: 'w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40',
    lg: 'w-36 h-36 md:w-48 md:h-48 lg:w-56 lg:h-56',
  };

  const moonImagePath = '/src/assets/images/lunar_glowing_moon_1791883379016.jpg';

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Outer soft cosmic radial aura */}
      {showAura && (
        <div
          className="absolute -inset-6 md:-inset-10 rounded-full pointer-events-none opacity-60 animate-pulse transition-opacity duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(186, 230, 253, 0.28) 0%, rgba(125, 211, 252, 0.12) 40%, rgba(99, 102, 241, 0.04) 70%, transparent 80%)',
            filter: 'blur(20px)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Moon Orb Container */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden transition-transform duration-700 hover:scale-105 animate-moon-glow border border-slate-200/20 shadow-2xl`}
        style={{
          boxShadow: '0 0 30px rgba(224, 242, 254, 0.35), 0 0 60px rgba(186, 230, 253, 0.18)',
        }}
      >
        {!imageError ? (
          <img
            src={moonImagePath}
            alt="Luminous glowing moon with craters"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-full"
            loading="eager"
          />
        ) : (
          /* High-Fidelity CSS & SVG Fallback in case of asset path change */
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-300 via-slate-100 to-white relative overflow-hidden">
            {/* Crater illusions */}
            <div className="absolute top-[20%] left-[25%] w-[25%] h-[25%] rounded-full bg-slate-400/20 blur-[1px]" />
            <div className="absolute bottom-[30%] left-[45%] w-[35%] h-[35%] rounded-full bg-slate-400/25 blur-[1px]" />
            <div className="absolute top-[50%] left-[15%] w-[18%] h-[18%] rounded-full bg-slate-400/30 blur-[1px]" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-slate-900/10 via-transparent to-white/40 pointer-events-none" />
          </div>
        )}

        {/* Ethereal edge lighting shimmer */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none ring-1 ring-inset ring-white/30"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.35) 0%, transparent 60%)',
          }}
        />
      </div>
    </div>
  );
};
