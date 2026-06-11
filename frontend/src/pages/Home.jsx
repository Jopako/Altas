import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AltasMark from "../assets/imgs/altas-mark.svg";

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
        stroke="currentColor"
        strokeOpacity="1"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2" fill="currentColor" opacity="0.92" />
      <path
        d="M12 2.8V5.1M12 18.9V21.2M2.8 12H5.1M18.9 12H21.2M4.6 4.6L6.2 6.2M17.8 17.8L19.4 19.4M19.4 4.6L17.8 6.2M6.2 17.8L4.6 19.4"
        stroke="currentColor"
        strokeOpacity="0.92"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Home() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div
      className={`min-h-screen overflow-hidden relative pb-[100px] flex flex-col ${
        theme === "dark"
          ? "bg-[#0d203b] text-white"
          : "bg-[#D7E7FF] text-[#1B2F55]"
      }`}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="#2F5EA8" strokeOpacity="0.14" strokeWidth="1">
          {/* Horizontal */}
          <line x1="0" y1="110" x2="1440" y2="110" />
          <line x1="0" y1="210" x2="1440" y2="210" />
          <line x1="0" y1="310" x2="1440" y2="310" />
          <line x1="0" y1="410" x2="1440" y2="410" />
          <line x1="0" y1="510" x2="1440" y2="510" />
          <line x1="0" y1="610" x2="1440" y2="610" />
          <line x1="0" y1="710" x2="1440" y2="710" />

          {/* Diagonals */}
          <line x1="-240" y1="0" x2="1200" y2="900" />
          <line x1="240" y1="0" x2="1440" y2="610" />
          <line x1="520" y1="0" x2="1440" y2="430" />
          <line x1="820" y1="0" x2="1440" y2="240" />
          <line x1="1440" y1="0" x2="0" y2="900" />
          <line x1="1220" y1="0" x2="0" y2="640" />
          <line x1="980" y1="0" x2="0" y2="430" />
          <line x1="760" y1="0" x2="0" y2="240" />
        </g>

        {/* Bottom chart line */}
        <polyline
          points="80,760 230,785 380,740 520,775 690,735 860,770 1010,720 1180,760 1360,730"
          stroke="#2F5EA8"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Small squares (nodes) */}
        <g fill="#2F5EA8" fillOpacity="0.55">
          <rect x="220" y="782" width="6" height="6" rx="1" />
          <rect x="375" y="737" width="6" height="6" rx="1" />
          <rect x="685" y="732" width="6" height="6" rx="1" />
          <rect x="1006" y="717" width="6" height="6" rx="1" />
          <rect x="1356" y="727" width="6" height="6" rx="1" />
          <rect x="160" y="180" width="7" height="7" rx="1.2" />
          <rect x="1320" y="200" width="8" height="8" rx="1.2" />
          <rect x="1240" y="330" width="6" height="6" rx="1.2" fill="#D97706" />
          {theme === "dark" && (
            <>
              <rect x="260" y="290" width="6" height="6" rx="1.2" />
              <rect x="460" y="160" width="7" height="7" rx="1.2" />
              <rect x="585" y="245" width="6" height="6" rx="1.2" />
              <rect x="720" y="185" width="7" height="7" rx="1.2" />
              <rect x="910" y="260" width="6" height="6" rx="1.2" />
              <rect x="1060" y="210" width="7" height="7" rx="1.2" />
              <rect x="1125" y="355" width="6" height="6" rx="1.2" />
              <rect x="1380" y="120" width="7" height="7" rx="1.2" />
              <rect x="170" y="420" width="6" height="6" rx="1.2" />
              <rect x="320" y="520" width="7" height="7" rx="1.2" />
              <rect x="520" y="470" width="6" height="6" rx="1.2" />
              <rect x="820" y="560" width="7" height="7" rx="1.2" />
              <rect x="1100" y="520" width="6" height="6" rx="1.2" />
              <rect x="1260" y="610" width="7" height="7" rx="1.2" />
              <rect x="1410" y="520" width="6" height="6" rx="1.2" />

              <circle cx="120" cy="120" r="2.2" fillOpacity="0.38" />
              <circle cx="300" cy="220" r="1.8" fillOpacity="0.34" />
              <circle cx="540" cy="120" r="2.4" fillOpacity="0.3" />
              <circle cx="760" cy="320" r="2" fillOpacity="0.34" />
              <circle cx="980" cy="150" r="2.2" fillOpacity="0.32" />
              <circle cx="1180" cy="260" r="1.8" fillOpacity="0.3" />
              <circle cx="1340" cy="380" r="2.4" fillOpacity="0.28" />

              {/* Yellow nodes */}
              <rect
                x="610"
                y="140"
                width="6"
                height="6"
                rx="1.2"
                fill="#D97706"
              />
              <rect
                x="980"
                y="340"
                width="7"
                height="7"
                rx="1.2"
                fill="#D97706"
              />
              <rect
                x="220"
                y="560"
                width="6"
                height="6"
                rx="1.2"
                fill="#D97706"
              />
              <circle
                cx="1080"
                cy="120"
                r="2.2"
                fill="#D97706"
                fillOpacity="0.35"
              />
              <circle
                cx="1420"
                cy="300"
                r="2.4"
                fill="#D97706"
                fillOpacity="0.28"
              />
            </>
          )}
        </g>
      </svg>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-5">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 select-none cursor-pointer"
          aria-label="Ir para a página inicial"
        >
          <img src={AltasMark} alt="ALTAS" className="h-9 w-9" />
          <span className="font-semibold tracking-[0.18em] text-[13px]">
            ALTAS
          </span>
        </button>

        <nav
          className={`hidden md:flex items-center gap-7 text-[17px] ${
            theme === "dark" ? "text-white/70" : "text-[#1B2F55]/75"
          }`}
        >
          <a
            onClick={() => navigate("/TeamPage")}
            className={`transition-colors ${
              theme === "dark" ? "hover:text-white" : "hover:text-[#1B2F55]"
            }`}
            href="#"
          >
            Equipe
          </a>
          <a
            onClick={(e) => {
              e.preventDefault();
              navigate("/FaleConosco");
            }}
            className={`transition-colors ${
              theme === "dark"
                ? "text-white hover:text-white"
                : "text-[#1B2F55] hover:text-[#1B2F55]"
            }`}
            href="#"
          >
            Fale conosco
          </a>
          <a
            onClick={(e) => {
              e.preventDefault();
              navigate("/Instituicoes");
            }}
            className={`transition-colors ${
              theme === "dark" ? "hover:text-white" : "hover:text-[#1B2F55]"
            }`}
            href="#"
          >
            Instituições
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="bg-[#F59E0B] text-white text-[12px] font-semibold px-5 py-2 rounded-full hover:bg-[#d97706] transition-colors cursor-pointer"
            onClick={() => navigate("/Login")}
            type="button"
          >
            LOGIN
          </button>
          <button
            className={`h-9 w-9 rounded-full grid place-items-center transition-colors cursor-pointer ${
              theme === "dark"
                ? "bg-[#4A7FD4] hover:bg-[#3f6fba] ring-1 ring-white/15 text-white"
                : "bg-[#4A7FD4] hover:bg-[#3f6fba] ring-1 ring-[#2F5EA8]/20 text-white"
            }`}
            type="button"
            aria-label={
              theme === "dark"
                ? "Mudar para modo claro"
                : "Mudar para modo escuro"
            }
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* Hero */}
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

      {/* Lighthouse / light rays */}
      {/* aqui muda altura e comprimento farol */}
      <div
        className="absolute left-0 right-0 bottom-[40px] pointer-events-none overflow-hidden origin-bottom-left scale-[0.84] sm:scale-[0.88] md:scale-[0.92] lg:scale-100"
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
              <stop offset="1.6" stopColor="#F59E0B" stopOpacity="0" />{" "}
              {/* muda a luz da bolinha do farol */}
            </radialGradient>
            <clipPath id="homeSceneClip">
              <rect width="1920" height="780" fill="white" />
            </clipPath>
          </defs>

          <g clipPath="url(#homeSceneClip)">
            {/* Light cone / rays */}
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

            {/* Lighthouse base */}
            <path
              d="M442.5 735H592.5L570 360H465L442.5 735Z"
              fill="url(#homeBodyGrad)"
            />

            {/* Lighthouse support base */}
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

            {/* Windows */}
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

            {/* Balcony */}
            <rect
              x="450"
              y="345"
              width="138"
              height="21"
              rx="3"
              fill="#2A4A90"
            />

            {/* Railing posts */}
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

            {/* Lantern room */}
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

            {/* Light source */}
            <circle cx="517.5" cy="303" r="15" fill="#FDE68A" opacity="0.5" />
            <circle cx="517.5" cy="303" r="7.5" fill="white" opacity="0.9" />

            {/* Cap and antenna */}
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

            {/* Soft shading */}
            <path
              d="M442.5 735H592.5L570 360H465L442.5 735Z"
              fill="#00143C"
              fillOpacity="0.12"
            />
          </g>
        </svg>
      </div>

      {/* Footer bar */}
      <footer className="fixed left-0 right-0 bottom-0 z-20 bg-[#4C7FC8] h-[100px] flex items-center justify-center">
        <p className="text-white/80 text-[10px] font-semibold tracking-[0.28em] uppercase">
          equipe altas - 2026
        </p>
      </footer>
    </div>
  );
}

export default Home;
