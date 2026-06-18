import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, PageLayout, useTheme } from "../components/PageLayout";
import Samu from "../assets/imgs/samu.png";
import Joao from "../assets/imgs/joao.jpeg";
import Julia from "../assets/imgs/julia.jpeg"; 

const TeamPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();

  const members = useMemo(
    () => [
      {
        name: "João Paulo Kowalski",
        bio: "Bem-vindo(a) ao nosso time! Somos um grupo de estudantes da Ciência da Computação. Venha conhecer o resto dos integrantes desse projeto.",
        initials: "JK",
        image: Joao,
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
        image: Julia,
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
        image: Samu,
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
    <PageLayout theme={theme} showFooter={false}>
      <PageHeader theme={theme} setTheme={setTheme} />

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
              className={`inline-block px-6 sm:px-8 py-2 text-[clamp(1.7rem,4.1vw,46px)]  ${
                theme === "dark" ? "text-[#F59E0B]" : "text-[#1B2F55]"
              }`}
            >
              Time de
            </span>
            <br />
            <span
              className={`inline-block mt-3 px-6 sm:px-8 py-2 text-[clamp(1.75rem,4.3vw,50px)]  ${
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
    </PageLayout>
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
        <circle cx="90" cy="360" r="2.0" fill="#D97706" fillOpacity="0.28" />
        <circle cx="1415" cy="360" r="2.4" fill="#D97706" fillOpacity="0.26" />
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
        <Avatar
          theme={theme}
          initials={member.initials}
          alt={member.name}
          image={member.image}
        />
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

function Avatar({ initials, alt, theme, image }) {
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
      <img src={image} alt="" className="h-full w-full object-cover" />
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