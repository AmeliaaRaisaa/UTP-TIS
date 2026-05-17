/**
 * Logo aplikasi Event Kampus — kalender + toga
 * Props:
 *   size  : number (default 32) — lebar & tinggi dalam px
 *   style : object — style tambahan
 */
export default function AppLogo({ size = 32, style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={style}
    >
      <defs>
        <linearGradient id="appLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F8EF7" />
          <stop offset="100%" stopColor="#7B3FE4" />
        </linearGradient>
      </defs>
      {/* Calendar body */}
      <rect x="8" y="18" width="84" height="74" rx="14" ry="14" fill="url(#appLogoGrad)" />
      {/* Calendar rings */}
      <rect x="30" y="10" width="10" height="18" rx="5" ry="5" fill="url(#appLogoGrad)" />
      <rect x="60" y="10" width="10" height="18" rx="5" ry="5" fill="url(#appLogoGrad)" />
      {/* White inner area */}
      <rect x="16" y="34" width="68" height="50" rx="8" ry="8" fill="white" />
      {/* Folded corner */}
      <path d="M68 84 L84 84 L84 70 Z" fill="#e8e0f8" />
      {/* Graduation cap — board */}
      <polygon points="50,42 72,52 50,62 28,52" fill="url(#appLogoGrad)" />
      {/* Graduation cap — body */}
      <path d="M36,55 L36,67 Q50,73 64,67 L64,55 L50,62 Z" fill="url(#appLogoGrad)" />
      {/* Tassel string */}
      <line x1="72" y1="52" x2="72" y2="65" stroke="url(#appLogoGrad)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tassel end */}
      <circle cx="72" cy="67" r="3" fill="url(#appLogoGrad)" />
    </svg>
  )
}
