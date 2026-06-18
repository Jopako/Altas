import { useNavigate } from "react-router-dom";
import { PageHeader, PageLayout, useTheme } from "../components/PageLayout";

function HomePage() {
  const [theme, setTheme] = useTheme();
  const navigate = useNavigate();

  return (
    <PageLayout theme={theme} background={<HomeBackground theme={theme} />}>
      <PageHeader theme={theme} setTheme={setTheme} />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="w-full max-w-[760px] py-10 sm:py-12 md:py-14">
          <p
            className={`text-[10px] font-semibold tracking-[0.28em] uppercase mb-6 ${
              theme === "dark" ? "text-white/45" : "text-[#1B2F55]/50"
            }`}
          >
            mapeamento institucional
          </p>
          <h1
            className={`font-extrabold text-[clamp(2rem,4.6vw,52px)] leading-[1.08] tracking-[-0.02em] mx-auto ${
              theme === "dark" ? "text-white" : "text-[#182A4C]"
            }`}
          >
            ALTAS - o seu sistema
            <br className="hidden sm:block" /> de mapeamento institucional
          </h1>
          <p
            className={`mt-8 text-[14px] sm:text-[15px] md:text-[16px] leading-[2] max-w-[560px] mx-auto ${
              theme === "dark" ? "text-white/80" : "text-[#1B2F55]/70"
            }`}
          >
            No sistema ALTAS você pode navegar pelas plantas da sua instituição,
            visualizar locais cadastrados ou adicionar novas informações.
          </p>
          <div className="mt-8">
            <button
              className={`text-white font-semibold px-8 py-3 rounded-full text-[13px] transition-colors cursor-pointer ${
                theme === "dark"
                  ? "bg-[#2563EB] hover:bg-[#1d4ed8]"
                  : "bg-[#3F64A6] hover:bg-[#2F5EA8]"
              }`}
              onClick={() => navigate("/ConhecaAltas")}
              type="button"
            >
              Conheça o ALTAS
            </button>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}

export default HomePage;

function HomeBackground({ theme }) {
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
          <line x1="0" y1="110" x2="1440" y2="110" />
          <line x1="0" y1="210" x2="1440" y2="210" />
          <line x1="0" y1="310" x2="1440" y2="310" />
          <line x1="0" y1="410" x2="1440" y2="410" />
          <line x1="0" y1="510" x2="1440" y2="510" />
          <line x1="0" y1="610" x2="1440" y2="610" />
          <line x1="0" y1="710" x2="1440" y2="710" />
          <line x1="-240" y1="0" x2="1200" y2="900" />
          <line x1="240" y1="0" x2="1440" y2="610" />
          <line x1="520" y1="0" x2="1440" y2="430" />
          <line x1="820" y1="0" x2="1440" y2="240" />
          <line x1="1440" y1="0" x2="0" y2="900" />
          <line x1="1220" y1="0" x2="0" y2="640" />
          <line x1="980" y1="0" x2="0" y2="430" />
          <line x1="760" y1="0" x2="0" y2="240" />
        </g>

        <g fill={theme === "dark" ? "#8FB4FF" : "#2F5EA8"} fillOpacity="0.55">
          <rect x="160" y="180" width="7" height="7" rx="1.2" />
          <rect x="1320" y="200" width="8" height="8" rx="1.2" />
          <rect x="1240" y="330" width="6" height="6" rx="1.2" fill="#D97706" />
          <rect x="210" y="560" width="6" height="6" rx="1.2" />
          <rect x="1245" y="590" width="7" height="7" rx="1.2" />
          <rect x="1380" y="120" width="7" height="7" rx="1.2" />
        </g>
      </svg>

      <div
        className="absolute left-0 right-0 bottom-[40px] origin-bottom-left scale-[0.84] sm:scale-[0.88] md:scale-[0.92] lg:scale-100"
        style={{ aspectRatio: "1600 / 780" }}
        aria-hidden="true"
      >
        <svg
          className="w-full h-full"
          viewBox="240 0 1440 780"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="homeRayGrad"
              x1="577.5"
              y1="315"
              x2="1920"
              y2="315"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#D9A43A" stopOpacity="0.9" />
              <stop offset="0.45" stopColor="#E4BE66" stopOpacity="0.55" />
              <stop offset="1" stopColor="#D9A43A" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="homeInnerRayGrad"
              x1="577.5"
              y1="297"
              x2="1200"
              y2="297"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#D9A43A" stopOpacity="0.22" />
              <stop offset="0.55" stopColor="#D9A43A" stopOpacity="0.12" />
              <stop offset="1" stopColor="#D9A43A" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="homeBodyGrad"
              x1="442.5"
              y1="360"
              x2="592.5"
              y2="360"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#1E3A6E" />
              <stop offset="0.4" stopColor="#3A5A9A" />
              <stop offset="0.65" stopColor="#2563EB" />
              <stop offset="1" stopColor="#1A3060" />
            </linearGradient>
            <radialGradient
              id="homeLanternGrad"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(517.5 303) scale(52.5 22.5)"
            >
              <stop stopColor="#FDE68A" />
              <stop offset="0.5" stopColor="#F59E0B" stopOpacity="0.75" />
              <stop offset="1.6" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
            <clipPath id="homeSceneClip">
              <rect width="1920" height="780" fill="white" />
            </clipPath>
          </defs>

          <g clipPath="url(#homeSceneClip)">
            <path
              opacity="0.75"
              d="M577.5 297L1920 120V510L577.5 297Z"
              fill="url(#homeRayGrad)"
            />
            <path
              d="M577.5 297L1200 232.5V367.5L577.5 297Z"
              fill="url(#homeInnerRayGrad)"
            />
            <path
              d="M577.5 297L1650 165"
              stroke="white"
              strokeOpacity="0.22"
              strokeWidth="1.2"
            />
            <path
              d="M577.5 297L1650 465"
              stroke="white"
              strokeOpacity="0.16"
              strokeWidth="1.2"
            />
            <path
              d="M442.5 735H592.5L570 360H465L442.5 735Z"
              fill="url(#homeBodyGrad)"
            />
            <rect
              x="398"
              y="718"
              width="239"
              height="90"
              rx="10"
              fill="#313f5d"
              opacity="2"
            />
            <path d="M412 738H623V780H412V738Z" fill="#14274B" opacity="0.95" />
            <path d="M423 744H612V770H423V744Z" fill="#0F2242" opacity="0.7" />
            <rect
              x="498"
              y="450"
              width="39"
              height="39"
              rx="6"
              fill="#0B1B3B"
              stroke="#87A8FF"
              strokeOpacity="0.25"
              strokeWidth="1.5"
            />
            <rect
              x="504"
              y="456"
              width="27"
              height="27"
              rx="4"
              fill="#0A1328"
            />
            <rect
              x="498"
              y="546"
              width="39"
              height="39"
              rx="6"
              fill="#0B1B3B"
              stroke="#87A8FF"
              strokeOpacity="0.25"
              strokeWidth="1.5"
            />
            <rect
              x="504"
              y="552"
              width="27"
              height="27"
              rx="4"
              fill="#0A1328"
            />
            <rect
              x="450"
              y="345"
              width="138"
              height="21"
              rx="3"
              fill="#2A4A90"
            />
            <rect x="456" y="327" width="6" height="18" fill="#2A4880" />
            <rect x="471" y="327" width="6" height="18" fill="#2A4880" />
            <rect x="486" y="327" width="6" height="18" fill="#2A4880" />
            <rect x="501" y="327" width="6" height="18" fill="#2A4880" />
            <rect x="516" y="327" width="6" height="18" fill="#2A4880" />
            <rect x="531" y="327" width="6" height="18" fill="#2A4880" />
            <rect x="546" y="327" width="6" height="18" fill="#2A4880" />
            <rect x="561" y="327" width="6" height="18" fill="#2A4880" />
            <rect x="573" y="327" width="6" height="18" fill="#2A4880" />
            <rect
              x="451.5"
              y="324"
              width="132"
              height="6"
              rx="1.5"
              fill="#3D5FA0"
            />
            <rect
              x="462"
              y="277.5"
              width="111"
              height="46"
              rx="6"
              fill="#1E3566"
              stroke="#4A6AAA"
              strokeWidth="1.5"
            />
            <rect
              x="465"
              y="280.5"
              width="105"
              height="45"
              rx="3"
              fill="url(#homeLanternGrad)"
              opacity="0.8"
            />
            <circle cx="517.5" cy="303" r="15" fill="#FDE68A" opacity="0.5" />
            <circle cx="517.5" cy="303" r="7.5" fill="white" opacity="0.9" />
            <path
              d="M480 277.5H555L532.5 237H502.5L480 277.5Z"
              fill="#2A4A90"
            />
            <path d="M502.5 237H532.5L517.5 210L502.5 237Z" fill="#1E3566" />
            <line
              x1="517.5"
              y1="210"
              x2="517.5"
              y2="180"
              stroke="#3A5A9A"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="517.5" cy="175.5" r="7.5" fill="#4A6AAA" />
            <path
              d="M442.5 735H592.5L570 360H465L442.5 735Z"
              fill="#00143C"
              fillOpacity="0.12"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
