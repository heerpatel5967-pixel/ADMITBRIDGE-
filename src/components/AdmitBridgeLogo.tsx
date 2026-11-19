import React from 'react';

interface AdmitBridgeLogoProps {
  size?: 'sm' | 'md';
  showTagline?: boolean;
}

export const AdmitBridgeLogo: React.FC<AdmitBridgeLogoProps> = ({
  size = 'sm',
  showTagline = false,
}) => {
  const isMd = size === 'md';

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      {/* Architectural Bridge Emblem */}
      <span
        className={`relative inline-flex items-center justify-center shrink-0 rounded-lg bg-gradient-to-br from-[#1E1B4B] via-[#2563EB] to-[#0D9488] text-white shadow-sm shadow-blue-600/20 ring-1 ring-inset ring-white/20 ${
          isMd ? 'w-9 h-9' : 'w-8 h-8'
        }`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={isMd ? 'w-5 h-5' : 'w-[18px] h-[18px]'}
        >
          {/* Bridge deck line */}
          <path
            d="M3 14.5H21"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Left & right piers */}
          <path
            d="M6.5 8.5V18.5M17.5 8.5V18.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Sweeping suspension arch */}
          <path
            d="M3.5 14.5C5.2 10.2 8.2 8.2 12 8.2C15.8 8.2 18.8 10.2 20.5 14.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Apex keystone beacon */}
          <circle cx="12" cy="5.2" r="1.4" fill="#5EEAD4" />
        </svg>
      </span>

      {/* Stylized Wordmark */}
      <span className="flex flex-col leading-none">
        <span
          className={`font-display inline-flex items-baseline tracking-[-0.03em] ${
            isMd ? 'text-xl' : 'text-[18px] sm:text-[19px]'
          }`}
        >
          <span className="font-bold text-[#1E1B4B] dark:text-white">
            Admit
          </span>
          <span className="relative ml-1 font-extrabold italic pr-0.5 bg-gradient-to-r from-[#2563EB] via-[#0284C7] to-[#0D9488] dark:from-blue-400 dark:via-sky-300 dark:to-teal-300 bg-clip-text text-transparent">
            Bridge
            <svg
              viewBox="0 0 64 8"
              fill="none"
              preserveAspectRatio="none"
              className="absolute -bottom-1 left-0 w-full h-[5px] pointer-events-none"
              aria-hidden="true"
            >
              <path
                d="M1 6.5C18 1.5 46 1.5 63 5.5"
                stroke="url(#admitBridgeArc)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="admitBridgeArc" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </span>

        {showTagline && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            UG &amp; PG Admissions Portal
          </span>
        )}
      </span>
    </span>
  );
};
