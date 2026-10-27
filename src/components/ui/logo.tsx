import React from 'react';

interface BahiBarIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function BahiBarIcon({ size = 32, className = '', ...props }: BahiBarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="BahiBar Icon"
      {...props}
    >
      {/* Right B-Bowl (Primary Blue #087FDB) */}
      <path
        d="M48 14H62C76 14 86 21 86 33.5C86 42 79 48 70 50C81 52 89 59 89 69.5C89 82.5 77 88 62 88H48V14Z"
        fill="#087FDB"
      />
      {/* Upper Inner Counter of B */}
      <path
        d="M52 24H60C68 24 73 27 73 33.5C73 40 68 43 60 43H52V24Z"
        fill="#FFFFFF"
      />
      {/* Lower Inner Counter of B */}
      <path
        d="M52 57H60C70 57 76 61 76 69.5C76 78 70 80 60 80H52V57Z"
        fill="#FFFFFF"
      />
      {/* Left Ledger Page Base */}
      <rect x="22" y="14" width="30" height="74" rx="2" fill="#FFFFFF" />
      {/* Left Navy Spine & Base (#101F33) */}
      <path
        d="M32 14H20C15.58 14 12 17.58 12 22V80C12 84.42 15.58 88 20 88H48V78H22V14H32Z"
        fill="#101F33"
      />
      {/* Ledger Folded Dog-Ear Top Left (#12BBDD) */}
      <path d="M22 14H36L22 28V14Z" fill="#12BBDD" />
      {/* Ledger Rule Lines (#087FDB) */}
      <rect x="24" y="34" width="22" height="3.5" rx="1.75" fill="#087FDB" />
      <rect x="24" y="42" width="22" height="3.5" rx="1.75" fill="#087FDB" />
      {/* Barbell Horizontal Bar (#101F33) */}
      <rect x="22" y="65" width="56" height="5" rx="2.5" fill="#101F33" />
      {/* Barbell Left Weight (#12BBDD) */}
      <rect x="28" y="55" width="7" height="25" rx="3.5" fill="#12BBDD" stroke="#FFFFFF" strokeWidth="1.5" />
      <rect x="21" y="60" width="5" height="15" rx="2.5" fill="#12BBDD" />
      {/* Barbell Right Weight (#12BBDD) */}
      <rect x="68" y="55" width="7" height="25" rx="3.5" fill="#12BBDD" stroke="#FFFFFF" strokeWidth="1.5" />
      <rect x="77" y="60" width="5" height="15" rx="2.5" fill="#12BBDD" />
    </svg>
  );
}

interface BahiBarLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export function BahiBarLogo({
  size = 'md',
  showTagline = false,
  className = '',
  theme = 'light',
}: BahiBarLogoProps) {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const taglineSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-[#101F33]';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="shrink-0 flex items-center justify-center">
        <BahiBarIcon size={iconSizes[size]} />
      </div>
      <div className="flex flex-col justify-center leading-none">
        <span className={`font-extrabold tracking-tight ${textSizes[size]} ${textColor} flex items-center`}>
          <span>Bah</span>
          <span className="relative inline-block">
            <span>ı</span>
            <span
              className="absolute bg-[#12BBDD] rounded-full"
              style={{
                width: size === 'sm' ? '4px' : size === 'lg' ? '6px' : '5px',
                height: size === 'sm' ? '4px' : size === 'lg' ? '6px' : '5px',
                top: size === 'sm' ? '2px' : '3px',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          </span>
          <span className="text-[#087FDB]">Bar</span>
        </span>
        {showTagline && (
          <span className={`font-medium text-slate-500 mt-0.5 tracking-tight ${taglineSizes[size]}`}>
            Gym records, sorted.
          </span>
        )}
      </div>
    </div>
  );
}
