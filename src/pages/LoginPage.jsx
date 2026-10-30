import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AltasMark from "../assets/imgs/altas-mark.svg";
import LoginPlaceholder from "../assets/imgs/login-placeholder.svg";
import { PageHeader, PageLayout } from "../components/PageLayout";
import { useTheme } from "../hooks/useTheme";
import { AuthBackground } from "../components/AuthBackground";

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const [theme, setTheme] = useTheme();
  const [error, setError] = useState("");

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "email_nao_autorizado") {
      setError("Este e-mail não tem permissão de acesso. Use uma conta @ifc.edu.br ou peça autorização.");
    } else if (err === "oauth_falhou" || err === "auth_failed") {
      setError("Falha na autenticação com a Microsoft. Tente novamente.");
    }
  }, [searchParams]);

  function handleMicrosoftLogin() {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${apiBase}/api/auth/microsoft`;
  }

  return (
    <PageLayout
      theme={theme}
      bottomBar={false}
      showFooter={false}
      background={<AuthBackground theme={theme} />}
    >
      <PageHeader theme={theme} setTheme={setTheme} />

      <main className="relative z-10 flex-1 px-6 sm:px-10 lg:px-16 grid place-items-center py-10">
        <section className="w-full max-w-[1000px] mx-auto">
          <div
            className={`rounded-[18px] overflow-hidden shadow-[0_18px_60px_rgba(15,32,68,0.18)] border ${
              theme === "dark"
                ? "bg-[#071427] border-white/10"
                : "bg-white border-[#1B2F55]/10"
            }`}
          >
            <div className="grid md:grid-cols-2">
              <div className="p-7 sm:p-9 md:p-10 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 select-none">
                  <img src={AltasMark} alt="ALTAS" className="h-8 w-8" />
                  <span
                    className={`font-semibold tracking-[0.18em] text-[12px] ${
                      theme === "dark" ? "text-white/85" : "text-[#1B2F55]/85"
                    }`}
                  >
                    ALTAS
                  </span>
                </div>

                <h1
                  className={`mt-7 text-[clamp(1.55rem,3vw,34px)] leading-[1.15] font-extrabold tracking-[-0.02em] ${
                    theme === "dark" ? "text-white" : "text-[#0B1B3B]"
                  }`}
                >
                  Acesso Administrativo
                </h1>
                <p
                  className={`mt-3 text-[13px] leading-[1.7] ${
                    theme === "dark" ? "text-white/70" : "text-[#1B2F55]/60"
                  }`}
                >
                  Área restrita para servidores e administradores responsáveis por gerenciar e criar os mapas da instituição.
                </p>

                {/* Mensagem de erro */}
                {error ? (
                  <div
                    role="alert"
                    className={`mt-6 rounded-[8px] border px-3.5 py-2.5 text-[12px] leading-relaxed ${
                      theme === "dark"
                        ? "border-red-500/25 bg-red-500/10 text-red-200"
                        : "border-red-400/30 bg-red-50 text-red-700"
                    }`}
                  >
                    {error}
                  </div>
                ) : null}

                {/* Botão Microsoft OAuth */}
                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  className="mt-7 w-full h-[48px] rounded-[10px] bg-[#F59E0B] text-[#0B1B3B] hover:bg-[#d97706] font-semibold text-[13px] shadow-[0_10px_24px_rgba(245,158,11,0.25)] flex items-center justify-center gap-3 transition-colors cursor-pointer"
                >
                  <MicrosoftIcon />
                  Entrar com a conta Microsoft (IFC)
                </button>

                <p className={`mt-6 text-[12px] leading-relaxed ${theme === "dark" ? "text-white/55" : "text-[#1B2F55]/65"}`}>
                  O acesso é concedido automaticamente para contas institucionais autorizadas (<code className="text-[11px] font-mono">@ifc.edu.br</code>).
                </p>
              </div>

              <div className="hidden md:block relative">
                <div className="absolute inset-0 bg-[#1B2F55]" />
                <div className="relative h-full p-10 lg:p-12 flex items-center justify-center">
                  <img src={LoginPlaceholder} alt="Ilustração do mapa ALTAS" className="w-full max-w-[440px]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
};

export default LoginPage;

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" fill="#F35325" />
      <rect x="13" y="2" width="9" height="9" fill="#81BC06" />
      <rect x="2" y="13" width="9" height="9" fill="#05A6F0" />
      <rect x="13" y="13" width="9" height="9" fill="#FFBA08" />
    </svg>
  );
}
