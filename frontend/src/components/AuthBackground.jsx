export function AuthBackground({ theme }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        <g
          stroke={theme === "dark" ? "#8FB4FF" : "#2F5EA8"}
          strokeOpacity="0.14"
          strokeWidth="1"
        >
          <line x1="0" y1="100" x2="1440" y2="100" />
          <line x1="0" y1="220" x2="1440" y2="220" />
          <line x1="0" y1="340" x2="1440" y2="340" />
          <line x1="0" y1="460" x2="1440" y2="460" />
          <line x1="0" y1="580" x2="1440" y2="580" />

          <line x1="-320" y1="0" x2="1120" y2="900" />
          <line x1="0" y1="0" x2="1440" y2="560" />
          <line x1="420" y1="0" x2="1440" y2="330" />
          <line x1="920" y1="0" x2="1440" y2="170" />
          <line x1="1440" y1="0" x2="0" y2="900" />
        </g>
        <g fill={theme === "dark" ? "#8FB4FF" : "#2F5EA8"} fillOpacity="0.55">
          <rect x="120" y="170" width="7" height="7" rx="1.5" />
          <rect x="1180" y="210" width="8" height="8" rx="1.5" />
          <rect x="1240" y="330" width="6" height="6" rx="1.5" />
          <rect x="260" y="530" width="6" height="6" rx="1.5" />
          <rect x="1320" y="600" width="7" height="7" rx="1.5" />
          <rect x="1390" y="120" width="7" height="7" rx="1.5" />
        </g>
      </svg>
    </div>
  );
}
