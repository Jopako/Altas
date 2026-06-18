import { useNavigate } from "react-router-dom";
import { PageHeader, PageLayout, useTheme } from "../components/PageLayout";
import LagoImage from "../assets/imgs/lago.jpeg";
import LogosImage from "../assets/imgs/logos.webp";

const InstituicoesPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();

  return (
    <PageLayout
      theme={theme}
      background={<InstituicoesBackground theme={theme} />}
    >
      <PageHeader theme={theme} setTheme={setTheme} />

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
    </PageLayout>
  );
};

export default InstituicoesPage;

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
