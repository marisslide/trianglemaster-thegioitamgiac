import React from 'react';

interface TriangleLogoProps {
  size?: number;
  className?: string;
}

export const TriangleLogo: React.FC<TriangleLogoProps> = ({ size = 36, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tmTriFaceLeft" x1="8" y1="54" x2="34" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="tmTriFaceRight" x1="32" y1="8" x2="56" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="tmStarGold" x1="32" y1="22" x2="32" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* 3D faceted triangle body */}
      <path d="M32 6L7 54H32V6Z" fill="url(#tmTriFaceLeft)" />
      <path d="M32 6L57 54H32V6Z" fill="url(#tmTriFaceRight)" />
      {/* Subtle inner facet highlight */}
      <path d="M32 6L7 54H57L32 6Z" stroke="#1E3A8A" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M32 6V54" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      {/* Victory Star Crest */}
      <path
        d="M32 23L35.1 29.3L42 30.3L37 35.1L38.2 42L32 38.7L25.8 42L27 35.1L22 30.3L28.9 29.3L32 23Z"
        fill="url(#tmStarGold)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};
