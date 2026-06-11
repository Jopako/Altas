import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AltasMark from "../assets/imgs/altas-mark.svg";

const FaleConosco = () => {
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

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div
      className={`min-h-[100svh] overflow-hidden relative flex flex-col pb-[110px] ${
        theme === "dark"
          ? "bg-[#0d203b] text-white"
          : "bg-[#D7E7FF] text-[#1B2F55]"
      }`}
    >
      <FaleConoscoBackground theme={theme} />

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
            className={`transition-colors cursor-pointer font-semibold ${
              theme === "dark"
                ? "text-white hover:text-white"
                : "text-[#1B2F55] hover:text-[#1B2F55]"
            }`}
            href="#"
            aria-current="page"
          >
            Fale conosco
          </a>
          <a
            onClick={(e) => {
              e.preventDefault();
              navigate("/Instituicoes");
            }}
            className={`transition-colors cursor-pointer ${
              theme === "dark"
                ? "text-white/70 hover:text-white"
                : "text-[#1B2F55]/75 hover:text-[#1B2F55]"
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
          <p
            className={`text-[11px] font-semibold tracking-[0.28em] uppercase ${
              theme === "dark" ? "text-white/50" : "text-[#1B2F55]/55"
            }`}
          >
            Dúvidas e suporte
          </p>

          <h1 className="mt-4 font-extrabold tracking-[-0.02em] text-[clamp(2rem,4vw,46px)] text-[#F59E0B]">
            Fale conosco
          </h1>

          <p
            className={`mt-4 max-w-[760px] mx-auto text-[14px] sm:text-[15px] leading-[1.85] ${
              theme === "dark" ? "text-white/70" : "text-[#1B2F55]/70"
            }`}
          >
            Quer pedir uma funcionalidade, relatar um problema ou saber mais
            sobre o projeto? Envie sua mensagem e a equipe do ALTAS vai
            responder em breve.
          </p>
        </section>

        <section className="mt-10">
          <div className="mx-auto max-w-[980px] grid gap-7 lg:grid-cols-[1.05fr_0.95fr] items-start">
            <div
              className={`rounded-[32px] border ${
                theme === "dark"
                  ? "border-white/10 bg-white/5"
                  : "border-[#2F5EA8]/15 bg-white/90"
              } p-8 shadow-[0_18px_50px_rgba(15,32,68,0.12)]`}
            >
              <p
                className={`text-[13px] font-semibold uppercase tracking-[0.26em] ${
                  theme === "dark" ? "text-white/50" : "text-[#1B2F55]/55"
                }`}
              >
                Contato
              </p>
              <h2
                className={`mt-4 text-[28px] font-extrabold ${
                  theme === "dark" ? "text-white" : "text-[#1B2F55]"
                }`}
              >
                Estamos prontos para ouvir você.
              </h2>
              <p
                className={`mt-4 text-[14px] leading-[1.8] ${
                  theme === "dark" ? "text-white/70" : "text-[#1B2F55]/70"
                }`}
              >
                Atendimento rápido para estudantes, parceiros e professores. Use
                o formulário ao lado ou envie um e-mail direto.
              </p>

              <div className="mt-8 space-y-5 text-[14px]">
                <div>
                  <p className="font-semibold">E-mail</p>
                  <p
                    className={`mt-1 ${
                      theme === "dark" ? "text-white/70" : "text-[#1B2F55]/70"
                    }`}
                  >
                    contato@altas.com.br
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Telefone</p>
                  <p
                    className={`mt-1 ${
                      theme === "dark" ? "text-white/70" : "text-[#1B2F55]/70"
                    }`}
                  >
                    +55 (49) 3333-0000
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Localização</p>
                  <p
                    className={`mt-1 ${
                      theme === "dark" ? "text-white/70" : "text-[#1B2F55]/70"
                    }`}
                  >
                    Campus Videira, IFC - Santa Catarina
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`rounded-[32px] border ${
                theme === "dark"
                  ? "border-white/10 bg-[#071427]/80"
                  : "border-[#2F5EA8]/15 bg-white"
              } p-8 shadow-[0_18px_50px_rgba(15,32,68,0.12)]`}
            >
              <div className="grid gap-4">
                <label className="block text-[13px] font-semibold">
                  Nome completo
                  <input
                    type="text"
                    name="name"
                    placeholder="Seu nome"
                    className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${
                      theme === "dark"
                        ? "border-white/10 bg-[#0f2346] text-white"
                        : "border-[#2F5EA8]/20 bg-white text-[#1B2F55]"
                    }`}
                  />
                </label>

                <label className="block text-[13px] font-semibold">
                  E-mail
                  <input
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${
                      theme === "dark"
                        ? "border-white/10 bg-[#0f2346] text-white"
                        : "border-[#2F5EA8]/20 bg-white text-[#1B2F55]"
                    }`}
                  />
                </label>

                <label className="block text-[13px] font-semibold">
                  Mensagem
                  <textarea
                    name="message"
                    rows="5"
                    placeholder="Digite sua mensagem"
                    className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${
                      theme === "dark"
                        ? "border-white/10 bg-[#0f2346] text-white"
                        : "border-[#2F5EA8]/20 bg-white text-[#1B2F55]"
                    }`}
                  />
                </label>

                <button
                  type="submit"
                  className="mt-4 w-full h-[46px] rounded-[10px] font-semibold text-[13px] shadow-[0_12px_26px_rgba(47,94,168,0.25)] transition-colors bg-[#1B2F55] text-white hover:bg-[#152133]"
                >
                  Enviar mensagem
                </button>
              </div>
            </form>
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

export default FaleConosco;

function FaleConoscoBackground({ theme }) {
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

      <g fill={theme === "dark" ? "#8FB4FF" : "#2F5EA8"}>
        <circle
          cx="180"
          cy="160"
          r="2.4"
          fillOpacity={theme === "dark" ? "0.18" : "0.22"}
        />
        <circle
          cx="1260"
          cy="250"
          r="2.6"
          fillOpacity={theme === "dark" ? "0.18" : "0.22"}
        />
        <circle
          cx="1080"
          cy="120"
          r="2.4"
          fillOpacity={theme === "dark" ? "0.18" : "0.22"}
        />
      </g>
    </svg>
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
