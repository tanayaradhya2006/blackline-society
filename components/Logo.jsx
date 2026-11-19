export function DiscMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="40" fill="none" stroke="#D8D1C6" strokeWidth="9"></circle><circle cx="80.00" cy="25.36" r="2.2" fill="#080808"></circle><circle cx="100.00" cy="60.00" r="2.2" fill="#080808"></circle><circle cx="80.00" cy="94.64" r="2.2" fill="#080808"></circle><circle cx="40.00" cy="94.64" r="2.2" fill="#080808"></circle><circle cx="20.00" cy="60.00" r="2.2" fill="#080808"></circle><circle cx="40.00" cy="25.36" r="2.2" fill="#080808"></circle><circle cx="60" cy="60" r="9" fill="none" stroke="#D8D1C6" strokeWidth="3"></circle><path d="M99.39 24.54 A53 53 0 0 1 110.41 76.38" fill="none" stroke="#501018" strokeWidth="11"></path>
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-3">
      <DiscMark />
      <span className="leading-none">
        <span className="block font-display text-[22px] font-extrabold uppercase tracking-[0.01em] text-bone">Blackline</span>
        <span className="block font-display text-[10px] font-semibold uppercase tracking-[0.62em] text-steel">Society</span>
      </span>
    </span>
  );
}
