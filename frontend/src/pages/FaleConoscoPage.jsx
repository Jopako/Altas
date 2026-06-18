import { useNavigate } from "react-router-dom";
import { PageHeader, PageLayout, useTheme } from "../components/PageLayout";

const FaleConoscoPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <PageLayout
      theme={theme}
      background={<FaleConoscoBackground theme={theme} />}
    >
      <PageHeader theme={theme} setTheme={setTheme} />

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
              className={`rounded-[32px] h-123 border ${
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
    </PageLayout>
  );
};

export default FaleConoscoPage;

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
