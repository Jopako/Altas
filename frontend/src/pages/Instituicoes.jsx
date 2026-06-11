import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AltasMark from "../assets/imgs/altas-mark.svg";
import LagoImage from "../assets/imgs/lago.jpeg";
import LogosImage from "../assets/imgs/logos.webp";

const Instituicoes = () => {
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

  const styles = null;

  return (
    <div
      className={`min-h-[100svh] overflow-hidden relative flex flex-col pb-[110px] ${
        theme === "dark"
          ? "bg-[#0d203b] text-white"
          : "bg-[#D7E7FF] text-[#1B2F55]"
      }`}
    >
      <InstituicoesBackground theme={theme} />

      <div
        className={`absolute left-0 right-0 bottom-0 h-[78px] ${
          theme === "dark" ? "bg-[#071427]" : "bg-[#1B2F55]"
        }`}
        aria-hidden="true"
      />

      <header className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-10 lg:px-16 py-5">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 select-none justify-self-start cursor-pointer"
          aria-label="Ir para a página inicial"
        >
          <img src={AltasMark} alt="ALTAS" className="h-9 w-9" />
          <span className="font-semibold tracking-[0.18em] text-[13px]">
            ALTAS
          </span>
        </button>

        <nav
          className={`hidden md:flex items-center gap-7 text-[16px] justify-self-center ${
            theme === "dark" ? "text-white/70" : "text-[#1B2F55]/75"
          }`}
          aria-label="Navegação principal"
        >
          <a
            onClick={(e) => {
              e.preventDefault();
              navigate("/TeamPage");
            }}
            className={`transition-colors cursor-pointer ${
              theme === "dark"
                ? "text-white/70 hover:text-white"
                : "text-[#1B2F55]/75 hover:text-[#1B2F55]"
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
            className={`transition-colors cursor-pointer ${
              theme === "dark"
                ? "text-white/70 hover:text-white"
                : "text-[#1B2F55]/75 hover:text-[#1B2F55]"
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
            className={`transition-colors cursor-pointer font-semibold ${
              theme === "dark"
                ? "text-white hover:text-white"
                : "text-[#1B2F55] hover:text-[#1B2F55]"
            }`}
            href="#"
            aria-current="page"
          >
            Instituições
          </a>
        </nav>

        <div className="flex items-center gap-3 justify-self-end">
          <p
            className={`hidden sm:block text-[10px] font-semibold tracking-[0.28em] uppercase ${
              theme === "dark" ? "text-white/50" : "text-[#1B2F55]/50"
            }`}
          >
            Mapeamento institucional
          </p>
          <button
            className="h-9 w-9 rounded-full grid place-items-center transition-colors cursor-pointer bg-[#1B2F55] text-white hover:bg-[#152133]"
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

      <main className="relative z-10 flex-1 min-h-0 px-6 sm:px-10 lg:px-16 flex flex-col">
        <section className="pt-8 sm:pt-10 md:pt-12 text-center">
          <h1 className="font-extrabold tracking-[-0.02em] text-[clamp(2rem,4vw,46px)] text-[#F59E0B]">
            Instituições
          </h1>

          <h2
            className={`mt-3 text-[14px] sm:text-[16px] font-semibold ${
              theme === "dark" ? "text-white" : "text-[#1B2F55]"
            }`}
          >
            <span className="font-extrabold">IFC</span> - Instituto Federal
            Catarinense <span className="italic">Campus Videira</span>
          </h2>
        </section>

        <section className="mt-9 sm:mt-10 md:mt-12">
          <div className="mx-auto max-w-[980px] grid gap-7 sm:gap-8 md:grid-cols-2 items-stretch">
            <InstitutionImage theme={theme} src={LagoImage} alt="Lago" />
            <InstitutionImage theme={theme} src={LogosImage} alt="Logos" />
          </div>

          <div className="mx-auto max-w-[980px] mt-7 sm:mt-8 text-center">
            <p
              className={`text-[12px] sm:text-[13px] leading-[1.9] ${
                theme === "dark" ? "text-white/75" : "text-[#1B2F55]/70"
              }`}
            >
              O IFC oferece educação em todos os níveis, desde a formação
              inicial e continuada até a pós-graduação. Nosso objetivo é formar
              profissionais e cidadãos, contribuindo para o desenvolvimento
              social e econômico da região.
            </p>
            <p
              className={`mt-3 text-[12px] sm:text-[13px] leading-[1.9] ${
                theme === "dark" ? "text-white/75" : "text-[#1B2F55]/70"
              }`}
            >
              No ALTAS você encontra as plantas-baixas de diversos blocos da
              instituição, descrição de salas e muito mais.
            </p>
          </div>
        </section>
      </main>

      <footer className="absolute left-0 right-0 bottom-0 h-[78px] grid place-items-center z-10">
        <p
          className={`text-[10px] font-semibold tracking-[0.28em] uppercase ${
            theme === "dark" ? "text-white/55" : "text-white/70"
          }`}
        >
          Equipe Altas - 2026
        </p>
      </footer>
    </div>
  );
};

export default Instituicoes;

function InstituicoesBackground({ theme }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke={theme === "dark" ? "#8FB4FF" : "#2F5EA8"}
        strokeOpacity={theme === "dark" ? "0.12" : "0.14"}
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

      <g
        fill={theme === "dark" ? "#8FB4FF" : "#2F5EA8"}
        fillOpacity={theme === "dark" ? "0.35" : "0.55"}
      >
        <rect x="160" y="180" width="7" height="7" rx="1.2" />
        <rect x="1320" y="200" width="8" height="8" rx="1.2" />
        <rect x="1240" y="330" width="6" height="6" rx="1.2" fill="#D97706" />
        <rect x="210" y="560" width="6" height="6" rx="1.2" />
        <rect x="1245" y="590" width="7" height="7" rx="1.2" />
        <rect x="1380" y="120" width="7" height="7" rx="1.2" />
        <circle cx="250" cy="260" r="2.2" fillOpacity="0.32" />
        <circle cx="1180" cy="300" r="2.4" fillOpacity="0.28" />
        <circle cx="980" cy="150" r="2.0" fillOpacity="0.28" />
        <circle cx="90" cy="360" r="2.0" fill="#D97706" fillOpacity="0.28" />
        <circle cx="1415" cy="360" r="2.4" fill="#D97706" fillOpacity="0.26" />
      </g>
    </svg>
  );
}

function InstitutionImage({ src, alt, theme }) {
  return (
    <figure
      className={`rounded-2xl overflow-hidden shadow-[0_18px_50px_rgba(15,32,68,0.18)] ring-2 ${
        theme === "dark" ? "ring-[#8FB4FF]/35" : "ring-[#2F5EA8]"
      } bg-white/10`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-[210px] sm:h-[240px] object-cover"
      />
    </figure>
  );
}

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
