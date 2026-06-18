import { PageHeader, PageLayout, useTheme } from "../components/PageLayout";
import Info from "../assets/imgs/info.png";

const featureCards = [
  {
    title: "Mapeamento",
    description:
      "Visualize plantas, blocos e salas para encontrar o que precisa de forma rápida.",
  },
  {
    title: "Acesso rápido",
    description:
      "Use filtros e descrições para chegar ao ambiente certo em poucos cliques.",
  },
  {
    title: "Informação",
    description:
      "Veja detalhes de salas, ramais, laboratórios e serviços disponíveis no campus.",
  },
  {
    title: "Colaboração",
    description:
      "Desenvolvido por estudantes, para estudantes, com foco em usabilidade e aprendizado.",
  },
];

const stepCards = [
  {
    number: "1",
    title: "Explore",
    text: "Comece pela lista de instituições e blocos para saber onde cada área está localizada.",
  },
  {
    number: "2",
    title: "Localize",
    text: "Clique nas plantas para descobrir salas, laboratórios e serviços disponíveis.",
  },
  {
    number: "3",
    title: "Decida",
    text: "Use as informações para planejar sua visita, aula ou uso de um espaço do campus.",
  },
];

const classNames = (...classes) => classes.filter(Boolean).join(" ");

const panelStyles = (theme) =>
  classNames(
    "rounded-[40px] border p-8 shadow-[0_22px_70px_rgba(15,32,68,0.12)] backdrop-blur-lg",
    theme === "dark"
      ? "border-white/10 bg-white/5"
      : "border-[#2F5EA8]/15 bg-white/95",
  );

const textPrimary = (theme) =>
  theme === "dark" ? "text-white" : "text-[#1B2F55]";
const textSecondary = (theme) =>
  theme === "dark" ? "text-white/75" : "text-[#1B2F55]/75";
const textMuted = (theme) =>
  theme === "dark" ? "text-white/50" : "text-[#1B2F55]/55";

const ConhecaAltasPage = () => {
  const [theme, setTheme] = useTheme();

  return (
    <PageLayout
      theme={theme}
      background={<ConhecaAltasBackground theme={theme} />}
    >
      <PageHeader theme={theme} setTheme={setTheme} />

      <main className="relative z-10 flex-1 min-h-0 px-6 sm:px-10 lg:px-16 flex flex-col">
        <IntroSection theme={theme} />
        <HighlightsSection theme={theme} />
        <HowToSection theme={theme} />
      </main>
    </PageLayout>
  );
};

export default ConhecaAltasPage;

function ConhecaAltasBackground({ theme }) {
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

function Card({ title, description, theme }) {
  return (
    <article className="rounded-[32px]  border p-5 shadow-[0_14px_40px_rgba(15,32,68,0.08)] bg-white/90 border-[#2F5EA8]/10">
      <h3 className="text-[18px] font-semibold text-[#1B2F55]">{title}</h3>
      <p className="mt-3 text-[14px] leading-[1.75] text-[#1B2F55]/70">
        {description}
      </p>
    </article>
  );
}

function StepCard({ number, title, text, theme }) {
  return (
    <article
      className={classNames(
        "rounded-[32px] border p-6 text-center shadow-[0_14px_40px_rgba(15,32,68,0.08)]",
        theme === "dark"
          ? "border-white/10 bg-white/5"
          : "border-[#2F5EA8]/15 bg-white",
      )}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F59E0B] text-[15px] font-bold text-[#0B1B3B]">
        {number}
      </span>
      <h3
        className={classNames(
          "mt-5 text-[18px] font-semibold",
          textPrimary(theme),
        )}
      >
        {title}
      </h3>
      <p
        className={classNames(
          "mt-3 text-[14px] leading-[1.8]",
          textSecondary(theme),
        )}
      >
        {text}
      </p>
    </article>
  );
}

function IntroSection({ theme }) {
  return (
    <section className="pt-8 sm:pt-10 md:pt-12 text-center">
      <p
        className={classNames(
          "text-[11px] font-semibold tracking-[0.28em] uppercase",
          textMuted(theme),
        )}
      >
        Sobre o projeto
      </p>
      <h1 className="mt-4 font-extrabold tracking-[-0.02em] text-[clamp(2rem,4vw,46px)] text-[#F59E0B]">
        Conheça o ALTAS
      </h1>
      <p
        className={classNames(
          "mt-4 max-w-[760px] mx-auto text-[14px] sm:text-[15px] leading-[1.85]",
          textSecondary(theme),
        )}
      >
        O ALTAS é um projeto de mapeamento institucional que ajuda a navegar
        pelos espaços do campus, visualizar plantas e entender a estrutura dos
        blocos, salas e serviços oferecidos.
      </p>
    </section>
  );
}

function HighlightsSection({ theme }) {
  return (
    <section className="mt-12">
      <div className="mx-auto max-w-[1180px] grid gap-8 xl:grid-cols-[1.1fr_0.9fr] items-stretch">
        <div className={panelStyles(theme)}>
     
          <h2
            className={classNames(
              "mt-6 text-[28px] font-extrabold tracking-[-0.03em]",
              textPrimary(theme),
            )}
          >
            Uma experiência mais clara para explorar o campus
          </h2>
          <p
            className={classNames(
              "mt-4 max-w-[760px] text-[15px] leading-[1.85]",
              textSecondary(theme),
            )}
          >
            Com o ALTAS, estudantes, professores e visitantes encontram uma
            forma clara de explorar o campus e os serviços do IFC Campus
            Videira. O sistema foi pensado para facilitar a orientação e a
            descoberta de recursos institucionais.
          </p>

          <div className="mt-10 grid bg-transparent  gap-6 sm:grid-cols-2 items-stretch">
            {featureCards.map((card) => (
              <Card key={card.title} theme={theme} {...card} />
            ))}
          </div>
        </div>

        <div className={panelStyles(theme)}>
     
          <h2
            className={classNames(
              "mt-6 text-[28px] font-extrabold",
              textPrimary(theme),
            )}
          >
            Informação sempre acessível
          </h2>
          <p
            className={classNames(
              "mt-4 text-[15px] leading-[1.85]",
              textSecondary(theme),
            )}
          >
            O projeto torna a experiência no campus mais acessível e
            inteligente, reunindo informações que ajudam a planejar o dia e
            encontrar espaços com mais confiança.
          </p>

          <ul
            className={classNames(
              "mt-8 space-y-4 text-[15px]",
              textSecondary(theme),
            )}
          >
            {[
              "Navegação intuitiva para usuários novos e frequentes.",
              "Informações de sala, bloco e infraestrutura em um só lugar.",
              "Apoia a integração acadêmica e a visitação ao campus.",
            ].map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                {item}
              </li>
            ))}
          </ul>
                      <img src={Info} alt="infos" className="w-90 h-70 pt-15 pl-22" />

        </div>

     
         

      </div>
    </section>
  );
}

function HowToSection({ theme }) {
  return (
    <section className="mt-12">
      <div
        className={classNames(
          panelStyles(theme),
          "mx-auto max-w-[980px] px-8 py-10",
        )}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <h2
            className={classNames(
              "text-[26px] font-extrabold",
              textPrimary(theme),
            )}
          >
            Como usar
          </h2>
          <p
            className={classNames(
              "max-w-[540px] text-[14px] leading-[1.8]",
              textSecondary(theme),
            )}
          >
            Três etapas simples para aproveitar o ALTAS e se orientar com mais
            facilidade no campus.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3 items-stretch">
          {stepCards.map((step) => (
            <StepCard key={step.number} theme={theme} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
