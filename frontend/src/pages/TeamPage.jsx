import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AltasMark from "../assets/imgs/altas-mark.svg";

const TeamPage = () => {
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
  const members = useMemo(
    () => [
      {
        name: "João Paulo Kowalski",
        bio: "Bem-vindo(a) ao nosso time! Somos um grupo de estudantes da Ciência da Computação. Venha conhecer o resto dos integrantes desse projeto.",
        initials: "JK",
        links: {
          linkedin: "#",
          x: "#",
          instagram: "#",
        },
      },
      {
        name: "Julia Luzzi Baldissera",
        bio: "Bem-vindo(a) ao nosso time! Somos um grupo de estudantes da Ciência da Computação. Venha conhecer o resto dos integrantes desse projeto.",
        initials: "JB",
        links: {
          linkedin: "#",
          x: "#",
          instagram: "#",
        },
      },
      {
        name: "Samuel Castilho Pereira",
        bio: "Bem-vindo(a) ao nosso time! Somos um grupo de estudantes da Ciência da Computação. Venha conhecer o resto dos integrantes desse projeto.",
        initials: "SP",
        links: {
          linkedin: "#",
          x: "#",
          instagram: "#",
        },
      },
    ],
    [],
  );

  return (
    <div
      className={`h-[100svh] overflow-hidden relative flex flex-col ${
        theme === "dark"
          ? "bg-[#0d203b] text-white"
          : "bg-[#D7E7FF] text-[#1B2F55]"
      }`}
    >
      <TeamBackground theme={theme} />
      <div
        className={`absolute left-0 right-0 bottom-0 h-[78px] ${
          theme === "dark" ? "bg-[#071427]" : "bg-[#3F64A6]"
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
            className={`transition-colors cursor-pointer font-semibold ${
              theme === "dark"
                ? "text-white hover:text-white"
                : "text-[#1B2F55] hover:text-[#1B2F55]"
            }`}
            href="#"
            aria-current="page"
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

        <div className="flex items-center gap-3 justify-self-end">
          <p
            className={`hidden sm:block text-[10px] font-semibold tracking-[0.28em] uppercase ${
              theme === "dark" ? "text-white/50" : "text-[#1B2F55]/50"
            }`}
          >
            Mapeamento institucional
          </p>
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

      <main className="relative z-10 flex-1 min-h-0 px-6 sm:px-10 lg:px-16 flex flex-col">
        <section className="pt-7 sm:pt-9 md:pt-10 text-center">
          <p
            className={`text-[11px] font-semibold tracking-[0.28em] uppercase ${
              theme === "dark" ? "text-white/50" : "text-[#1B2F55]/55"
            }`}
          >
            Nossa equipe
          </p>

          <h1 className="mt-6 font-extrabold leading-[1.05] tracking-[-0.02em]">
            <span
              className={`inline-block px-6 sm:px-8 py-2 text-[clamp(1.7rem,4.1vw,46px)] shadow-[0_10px_30px_rgba(15,32,68,0.12)] ${
                theme === "dark" ? "text-[#F59E0B]" : "text-[#1B2F55]"
              }`}
            >
              Time de
            </span>
            <br />
            <span
              className={`inline-block mt-3 px-6 sm:px-8 py-2 text-[clamp(1.75rem,4.3vw,50px)] shadow-[0_10px_30px_rgba(15,32,68,0.12)] ${
                theme === "dark" ? "text-[#F59E0B]" : "text-[#1B2F55]"
              }`}
            >
              Desenvolvimento
            </span>
          </h1>

          <p
            className={`mt-5 text-[14px] sm:text-[15px] leading-[1.85] max-w-[620px] mx-auto ${
              theme === "dark" ? "text-white/80" : "text-[#1B2F55]/70"
            }`}
          >
            Bem-vindo(a) ao nosso time! Somos um grupo de estudantes da Ciência
            da Computação. Venha conhecer o resto dos integrantes desse projeto.
          </p>
        </section>

        <section className="mt-8 sm:mt-10 md:mt-12 pb-6">
          <div className="mx-auto max-w-[1100px] grid gap-7 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <TeamCard key={member.name} theme={theme} member={member} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TeamPage;

function TeamBackground({ theme }) {
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
      </g>
    </svg>
  );
}

function TeamCard({ member, theme }) {
  const cardBg =
    theme === "dark"
      ? "bg-white/5 ring-1 ring-white/10"
      : "bg-white/45 ring-1 ring-[#2F5EA8]/15";
  const nameColor = theme === "dark" ? "text-white" : "text-[#2F5EA8]";

  return (
    <article
      className={`rounded-2xl ${cardBg} backdrop-blur-sm px-7 pt-7 pb-6 shadow-[0_18px_50px_rgba(15,32,68,0.10)]`}
    >
      <div className="grid place-items-center">
        <Avatar theme={theme} initials={member.initials} alt={member.name} />
      </div>

      <h2
        className={`mt-5 text-[18px] sm:text-[19px] font-extrabold text-center ${nameColor}`}
      >
        {member.name}
      </h2>

      <p
        className={`mt-3 text-[12px] leading-[1.75] text-center ${
          theme === "dark" ? "text-white/75" : "text-[#1B2F55]/75"
        }`}
      >
        {member.bio}
      </p>

      <div className="mt-4 flex items-center justify-center gap-4">
        <SocialIconButton
          theme={theme}
          href={member.links.linkedin}
          label="LinkedIn"
          icon={<LinkedInIcon />}
        />
        <SocialIconButton
          theme={theme}
          href={member.links.x}
          label="X"
          icon={<XIcon />}
        />
        <SocialIconButton
          theme={theme}
          href={member.links.instagram}
          label="Instagram"
          icon={<InstagramIcon />}
        />
      </div>
    </article>
  );
}

function Avatar({ initials, alt, theme }) {
  return (
    <div
      className={`h-[120px] w-[120px] rounded-2xl grid place-items-center overflow-hidden ${
        theme === "dark"
          ? "bg-gradient-to-br from-[#1d4ed8]/45 to-[#F59E0B]/30 ring-1 ring-white/15"
          : "bg-gradient-to-br from-[#2F5EA8]/25 to-[#F59E0B]/20 ring-1 ring-[#2F5EA8]/25"
      } shadow-[0_14px_30px_rgba(15,32,68,0.18)]`}
      aria-label={alt}
      role="img"
    >
      <span
        className={`font-extrabold tracking-[-0.03em] text-[32px] ${
          theme === "dark" ? "text-white" : "text-[#0B1B3B]"
        }`}
      >
        {initials}
      </span>
    </div>
  );
}

function SocialIconButton({ href, label, icon, theme }) {
  const base =
    "h-8 w-8 rounded-full grid place-items-center transition-colors ring-1";
  const styles =
    theme === "dark"
      ? "bg-white/5 hover:bg-white/10 ring-white/15 text-white/85 hover:text-white"
      : "bg-white/55 hover:bg-white/80 ring-[#2F5EA8]/18 text-[#1B2F55]/80 hover:text-[#1B2F55]";

  return (
    <a
      href={href}
      aria-label={label}
      className={`${base} ${styles}`}
      target="_blank"
      rel="noreferrer"
    >
      {icon}
    </a>
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

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.5 9.25V18.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 6.25V6.1"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M10.25 18.75V12.95C10.25 10.35 13.75 10.15 13.75 12.95V18.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 18.75V13.7C17.5 10.1 13.75 10.3 13.75 13.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 3.75H19.25C20.35 3.75 21.25 4.65 21.25 5.75V20.25C21.25 21.35 20.35 22.25 19.25 22.25H4.75C3.65 22.25 2.75 21.35 2.75 20.25V5.75C2.75 4.65 3.65 3.75 4.75 3.75Z"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.25"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 17.5L17 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.6 6.5H12.1L17 17.5H13.5L8.6 6.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="3.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 10.2A1.8 1.8 0 1 1 10.2 12 1.8 1.8 0 0 1 12 10.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16.3 7.7H16.31"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
