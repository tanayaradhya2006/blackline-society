export default function BikeArt({ category = "Street", spin = false, className = "", glow = true }) {
  const id = `rl-${category}`;
  const sport = category === "Sport";
  const cruiser = category === "Cruiser";
  const wheel = (cx) => (
    <g>
      <circle cx={cx} cy="172" r="47" fill="#0b0b0b" />
      <circle cx={cx} cy="172" r="47" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="2" />
      <circle cx={cx} cy="172" r="33" fill="none" stroke="#1f1d1b" strokeWidth="3" />
      <g className={spin ? "wheel-spin" : ""}>
        <circle cx={cx} cy="172" r="24" fill="none" stroke="#2a2725" strokeWidth="6" strokeDasharray="10 6" />
        <circle cx={cx} cy="172" r="7" fill="#1f1d1b" stroke="#77716A" strokeWidth="1.5" />
      </g>
    </g>
  );
  return (
    <svg viewBox="0 0 400 240" className={className} role="img" aria-label={`${category} motorcycle silhouette`}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2725" />
          <stop offset="0.35" stopColor="#141312" />
          <stop offset="1" stopColor="#080808" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#501018" />
          <stop offset="0.5" stopColor="#3A0D15" />
          <stop offset="1" stopColor="#080808" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#77716A" />
          <stop offset="0.5" stopColor="#B0A69A" />
          <stop offset="1" stopColor="#4a4642" />
        </linearGradient>
        <radialGradient id={`${id}-spot`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3A0D15" stopOpacity="0.75" />
          <stop offset="1" stopColor="#080808" stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow && <ellipse cx="210" cy="140" rx="200" ry="110" fill={`url(#${id}-spot)`} />}
      <ellipse cx="200" cy="222" rx="175" ry="6" fill="#000" opacity="0.9" />
      {wheel(92)}
      {wheel(308)}
      <path d="M92 172 L190 150" stroke="#1f1d1b" strokeWidth="10" strokeLinecap="square" />
      <path d="M92 172 L190 150" stroke="#3A0D15" strokeWidth="1.5" transform="translate(0,-5)" />
      <path d="M308 172 L272 78" stroke={`url(#${id}-steel)`} strokeWidth="6" />
      <path d="M150 150 C 175 165, 235 165, 250 148 L 238 112 L 160 112 Z" fill="#0f0e0d" stroke="#1f1d1b" strokeWidth="2" />
      <rect x="172" y="120" width="56" height="34" fill="#181716" stroke="#2a2725" />
      {[127, 134, 141, 148].map((y) => (
        <line key={y} x1="176" y1={y} x2="224" y2={y} stroke="#2a2725" strokeWidth="2" />
      ))}
      <path d={cruiser ? "M176 158 L 70 150 L 66 160 L 172 168 Z" : "M190 156 C 160 150, 130 140, 112 128 L 106 136 C 125 150, 160 162, 192 166 Z"} fill={`url(#${id}-steel)`} opacity="0.55" />
      <path d={cruiser ? "M160 98 C 175 80, 250 76, 262 96 L 250 116 L 168 116 Z" : "M168 100 C 180 78, 248 72, 266 92 L 254 116 L 170 116 Z"} fill={`url(#${id}-body)`} />
      <path d={cruiser ? "M160 98 C 175 80, 250 76, 262 96" : "M168 100 C 180 78, 248 72, 266 92"} fill="none" stroke="#501018" strokeWidth="2.5" />
      <path
        d={cruiser ? "M88 112 C 110 102, 150 100, 168 104 L 166 116 C 140 116, 110 118, 92 122 Z" : sport ? "M98 92 C 120 92, 150 98, 170 102 L 168 114 C 140 112, 112 106, 96 102 Z" : "M96 104 C 120 98, 150 98, 170 102 L 168 116 C 140 114, 112 114, 96 114 Z"}
        fill="#0b0b0b"
        stroke="#1f1d1b"
      />
      <path d={cruiser ? "M58 140 C 60 115, 95 110, 112 124" : "M70 128 C 75 112, 96 104, 110 110"} fill="none" stroke="#1f1d1b" strokeWidth="6" />
      <path d={cruiser ? "M58 140 C 60 115, 95 110, 112 124" : "M70 128 C 75 112, 96 104, 110 110"} fill="none" stroke="#3A0D15" strokeWidth="1.5" />
      {sport ? (
        <>
          <path d="M262 70 C 300 70, 330 100, 326 130 L 286 140 L 250 112 Z" fill={`url(#${id}-body)`} />
          <path d="M262 70 C 300 70, 330 100, 326 130" fill="none" stroke="#501018" strokeWidth="2.5" />
          <path d="M300 104 L 322 110" stroke="#B0A69A" strokeWidth="2" opacity="0.7" />
        </>
      ) : (
        <>
          <line x1="256" y1="70" x2="284" y2="60" stroke={`url(#${id}-steel)`} strokeWidth="4" />
          <circle cx="292" cy="92" r={cruiser ? 15 : 12} fill="#121212" stroke="#77716A" strokeWidth="2" />
          <circle cx="292" cy="92" r={cruiser ? 8 : 6} fill="#B0A69A" opacity="0.35" />
        </>
      )}
      <path d="M268 140 C 290 128, 320 128, 336 140" fill="none" stroke="#1f1d1b" strokeWidth="6" />
    </svg>
  );
}
