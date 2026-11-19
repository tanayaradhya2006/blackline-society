export default function Tach({ className = "", value = 0.86 }) {
  const ticks = Array.from({ length: 41 }, (_, i) => i);
  const angle = (t) => -120 + t * 240;
  const needle = angle(value);
  const arc = (from, to, r) => {
    const p = (t) => {
      const a = ((angle(t) - 90) * Math.PI) / 180;
      return [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
    };
    const [x1, y1] = p(from);
    const [x2, y2] = p(to);
    return `M${x1} ${y1} A${r} ${r} 0 ${to - from > 0.75 ? 1 : 0} 1 ${x2} ${y2}`;
  };
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Tachometer at the redline">
      <circle cx="100" cy="100" r="96" fill="#0b0b0b" stroke="#1f1d1b" strokeWidth="2" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#121212" strokeWidth="10" />
      <path d={arc(0, 0.75, 78)} fill="none" stroke="#2a2725" strokeWidth="3" />
      <path d={arc(0.75, 1, 78)} fill="none" stroke="#501018" strokeWidth="8" />
      {ticks.map((i) => {
        const major = i % 4 === 0;
        const red = i / 40 >= 0.75;
        return (
          <line
            key={i}
            x1="100"
            y1={major ? 24 : 28}
            x2="100"
            y2="34"
            stroke={red ? "#501018" : major ? "#B0A69A" : "#77716A"}
            strokeWidth={major ? 2 : 1}
            transform={`rotate(${angle(i / 40)} 100 100)`}
          />
        );
      })}
      {Array.from({ length: 11 }, (_, i) => {
        const a = ((angle(i / 10) - 90) * Math.PI) / 180;
        return (
          <text key={i} x={100 + 56 * Math.cos(a)} y={100 + 56 * Math.sin(a) + 4} textAnchor="middle" fontSize="10" fontFamily="'JetBrains Mono', monospace" fill={i >= 8 ? "#501018" : "#77716A"}>
            {i}
          </text>
        );
      })}
      <text x="100" y="140" textAnchor="middle" fontSize="7" letterSpacing="2" fontFamily="'JetBrains Mono', monospace" fill="#77716A">
        RPM X1000
      </text>
      <g className="needle" style={{ "--needle": `${needle}deg` }}>
        <path d="M98.5 100 L100 22 L101.5 100 Z" fill="#D8D1C6" />
      </g>
      <circle cx="100" cy="100" r="9" fill="#181716" stroke="#77716A" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="3" fill="#501018" />
    </svg>
  );
}
