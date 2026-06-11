import { useEffect, useId, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import AltasMark from "../assets/imgs/altas-mark.svg";

const Login = () => {
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const navLinkClass = useMemo(() => {
    return ({ isActive }) =>
      [
        "transition-colors cursor-pointer",
        isActive
          ? theme === "dark"
            ? "text-white font-semibold"
            : "text-[#1B2F55] font-semibold"
          : theme === "dark"
            ? "text-white/70 hover:text-white"
            : "text-[#1B2F55]/75 hover:text-[#1B2F55]",
      ].join(" ");
  }, [theme]);

  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  return (
    <div
      className={`min-h-[100svh] overflow-hidden relative flex flex-col ${
        theme === "dark"
          ? "bg-[#0d203b] text-white"
          : "bg-[#D7E7FF] text-[#1B2F55]"
      }`}
    >
      <LoginBackground theme={theme} />

      <header className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-10 lg:px-16 py-5">
        <Link
          to="/"
          className="flex items-center gap-2 select-none justify-self-start cursor-pointer"
          aria-label="Ir para a página inicial"
        >
          <img src={AltasMark} alt="ALTAS" className="h-9 w-9" />
          <span className="font-semibold tracking-[0.18em] text-[13px]">
            ALTAS
          </span>
        </Link>

        <nav
          className={`hidden md:flex items-center gap-7 text-[16px] justify-self-center ${
            theme === "dark" ? "text-white/70" : "text-[#1B2F55]/75"
          }`}
          aria-label="Navegação principal"
        >
          <NavLink to="/TeamPage" className={navLinkClass} end>
            Equipe
          </NavLink>
          <a
            className={`transition-colors ${
              theme === "dark" ? "hover:text-white" : "hover:text-[#1B2F55]"
            }`}
            href="#"
          >
            Fale conosco
          </a>
          <NavLink to="/Instituicoes" className={navLinkClass} end>
            Instituições
          </NavLink>
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

      <main className="relative z-10 flex-1 min-h-0 px-6 sm:px-10 lg:px-16 pb-[110px] grid place-items-center">
        <section className="w-full max-w-[1100px]">
          <div
            className={`rounded-[18px] overflow-hidden shadow-[0_18px_60px_rgba(15,32,68,0.18)] border ${
              theme === "dark"
                ? "bg-[#071427] border-white/10"
                : "bg-white border-[#1B2F55]/10"
            }`}
          >
            <div className="grid md:grid-cols-2">
              <div className="p-7 sm:p-9 md:p-10 lg:p-12">
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
                  Faça login em sua conta
                </h1>
                <p
                  className={`mt-3 text-[13px] leading-[1.7] ${
                    theme === "dark" ? "text-white/70" : "text-[#1B2F55]/60"
                  }`}
                >
                  Bem-vindo de volta! Selecione um método de login:
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    className={`flex-1 h-[44px] rounded-[10px] bg-[#F59E0B] text-[#0B1B3B] hover:bg-[#d97706] font-semibold text-[13px] shadow-[0_10px_24px_rgba(245,158,11,0.25)] flex items-center justify-center gap-3 transition-colors`}
                    onClick={() => {}}
                  >
                    <GoogleIcon />
                    Google
                  </button>
                  <button
                    type="button"
                    className={`flex-1 h-[44px] rounded-[10px] bg-[#F59E0B] text-[#0B1B3B] hover:bg-[#d97706] font-semibold text-[13px] shadow-[0_10px_24px_rgba(245,158,11,0.25)] flex items-center justify-center gap-3 transition-colors`}
                    onClick={() => {}}
                  >
                    <MicrosoftIcon />
                    Microsoft
                  </button>
                </div>

                <div className="mt-7 flex items-center gap-4">
                  <div
                    className={`h-px flex-1 ${
                      theme === "dark" ? "bg-white/10" : "bg-[#1B2F55]/10"
                    }`}
                  />
                  <p
                    className={`text-[10px] ${
                      theme === "dark" ? "text-white/45" : "text-[#1B2F55]/40"
                    }`}
                  >
                    ou continue com o email
                  </p>
                  <div
                    className={`h-px flex-1 ${
                      theme === "dark" ? "bg-white/10" : "bg-[#1B2F55]/10"
                    }`}
                  />
                </div>

                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <Field
                    id={emailId}
                    theme={theme}
                    type="email"
                    label="Email"
                    placeholder="Email"
                    icon={<MailIcon />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />

                  <Field
                    id={passwordId}
                    theme={theme}
                    type={showPassword ? "text" : "password"}
                    label="Senha"
                    placeholder="Senha"
                    icon={<LockIcon />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    endAdornment={
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className={`absolute inset-y-0 right-0 px-4 grid place-items-center transition-colors ${
                          theme === "dark"
                            ? "text-white/55 hover:text-white"
                            : "text-[#1B2F55]/45 hover:text-[#1B2F55]"
                        }`}
                        aria-label={
                          showPassword ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    }
                  />

                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={rememberId}
                      className={`flex items-center gap-2 text-[11px] select-none cursor-pointer ${
                        theme === "dark" ? "text-white/65" : "text-[#1B2F55]/55"
                      }`}
                    >
                      <input
                        id={rememberId}
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        type="checkbox"
                        className="h-4 w-4 rounded border-[#2F5EA8]/30 text-[#2F5EA8] focus:ring-[#2F5EA8]"
                      />
                      Permanecer conectado
                    </label>
                  </div>

                  <button
                    type="submit"
                    className={`mt-3 w-full h-[46px] rounded-[10px] font-semibold text-[13px] shadow-[0_12px_26px_rgba(47,94,168,0.25)] transition-colors bg-[#1B2F55] text-white hover:bg-[#152133]`}
                  >
                    Entrar
                  </button>

                  <p
                    className={`text-center text-[13px] mt-3 ${
                      theme === "dark" ? "text-white/45" : "text-[#1B2F55]/45"
                    }`}
                  >
                    Não tem uma conta?{" "}
                    <Link
                      to="/RegisterPage"
                      className="font-semibold transition-colors text-[#F59E0B] hover:text-[#d97706]"
                    >
                      Crie aqui
                    </Link>
                  </p>
                </form>
              </div>

              <div className="hidden md:block relative">
                <div className="absolute inset-0 bg-[#1B2F55]" />
                <div className="relative h-full p-10 lg:p-12 flex items-center justify-center">
                  <div className="w-full max-w-[420px]">
                    <LoginIllustration />
                  </div>
                </div>
              </div>
            </div>
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

export default Login;

function Field({
  id,
  theme,
  type,
  label,
  placeholder,
  icon,
  value,
  onChange,
  endAdornment,
  autoComplete,
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div
        className={`absolute inset-y-0 left-0 px-4 grid place-items-center ${
          theme === "dark" ? "text-white/55" : "text-[#1B2F55]/45"
        }`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`w-full h-[46px] rounded-[10px] pl-12 pr-12 text-[13px] outline-none border shadow-[0_10px_24px_rgba(15,32,68,0.08)] ${
          theme === "dark"
            ? "bg-white/5 border-white/10 text-white placeholder:text-white/35 focus:border-white/20"
            : "bg-[#F3F4F6] border-[#1B2F55]/10 text-[#0B1B3B] placeholder:text-[#1B2F55]/35 focus:border-[#2F5EA8]/25"
        }`}
      />
      {endAdornment}
    </div>
  );
}

function LoginBackground({ theme }) {
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
          r="2.2"
          fillOpacity={theme === "dark" ? "0.16" : "0.20"}
        />
        <circle
          cx="260"
          cy="560"
          r="2.3"
          fillOpacity={theme === "dark" ? "0.14" : "0.18"}
        />
      </g>
    </svg>
  );
}

function LoginIllustration() {
  return (
    <svg
      viewBox="0 0 520 420"
      className="w-full h-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="90" y="40" width="340" height="260" rx="18" fill="#BDEBFF" />
      <rect
        x="120"
        y="70"
        width="280"
        height="200"
        rx="12"
        fill="#0B1B3B"
        opacity="0.08"
      />

      <rect x="135" y="92" width="90" height="70" rx="10" fill="#84CC16" />
      <rect x="240" y="92" width="145" height="70" rx="10" fill="#A3E635" />
      <rect
        x="135"
        y="174"
        width="250"
        height="82"
        rx="12"
        fill="#64748B"
        opacity="0.25"
      />

      <circle cx="210" cy="140" r="17" fill="#F59E0B" />
      <circle cx="210" cy="140" r="7.5" fill="#fff" opacity="0.85" />
      <circle cx="325" cy="205" r="17" fill="#F59E0B" />
      <circle cx="325" cy="205" r="7.5" fill="#fff" opacity="0.85" />

      <rect
        x="230"
        y="305"
        width="60"
        height="35"
        rx="8"
        fill="#A7F3D0"
        opacity="0.9"
      />
      <rect
        x="192"
        y="344"
        width="136"
        height="12"
        rx="6"
        fill="#0B1B3B"
        opacity="0.25"
      />

      <rect
        x="140"
        y="360"
        width="240"
        height="10"
        rx="5"
        fill="#0B1B3B"
        opacity="0.28"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 13.2A8.1 8.1 0 0 1 10.8 3a7.5 7.5 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 2v2.2M12 19.8V22M4.2 12H2M22 12h-2.2M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M21.8 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.5a4.7 4.7 0 0 1-2 3.1v2.3h3.3c1.9-1.8 3-4.4 3-7.6Z"
        fill="#1B2F55"
        opacity="0.9"
      />
      <path
        d="M12 22c2.7 0 5-0.9 6.7-2.5l-3.3-2.3c-.9.6-2.1 1-3.4 1a6 6 0 0 1-5.7-4.1H2.9v2.4A10 10 0 0 0 12 22Z"
        fill="#1B2F55"
        opacity="0.7"
      />
      <path
        d="M6.3 13.9A6 6 0 0 1 6 12c0-.6.1-1.3.3-1.9V7.7H2.9A10 10 0 0 0 2 12c0 1.6.4 3.2 1 4.6l3.3-2.7Z"
        fill="#1B2F55"
        opacity="0.55"
      />
      <path
        d="M12 6a5.5 5.5 0 0 1 3.9 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2 10 10 0 0 0 2.9 7.7l3.4 2.4A6 6 0 0 1 12 6Z"
        fill="#1B2F55"
        opacity="0.85"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="8"
        height="8"
        rx="1.2"
        fill="#1B2F55"
        opacity="0.9"
      />
      <rect
        x="13"
        y="3"
        width="8"
        height="8"
        rx="1.2"
        fill="#1B2F55"
        opacity="0.65"
      />
      <rect
        x="3"
        y="13"
        width="8"
        height="8"
        rx="1.2"
        fill="#1B2F55"
        opacity="0.65"
      />
      <rect
        x="13"
        y="13"
        width="8"
        height="8"
        rx="1.2"
        fill="#1B2F55"
        opacity="0.9"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4.5 7.5h15v9.6a1.9 1.9 0 0 1-1.9 1.9H6.4a1.9 1.9 0 0 1-1.9-1.9V7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m5.4 8.3 6.6 5.2 6.6-5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7.5 11V8.8a4.5 4.5 0 0 1 9 0V11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 11h11a1.8 1.8 0 0 1 1.8 1.8v5.7a1.8 1.8 0 0 1-1.8 1.8h-11A1.8 1.8 0 0 1 4.7 18.5v-5.7A1.8 1.8 0 0 1 6.5 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2.5 12s3.6-6.5 9.5-6.5S21.5 12 21.5 12s-3.6 6.5-9.5 6.5S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4.2 4.2 19.8 19.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.2 6.2A9.4 9.4 0 0 1 12 5.5c5.9 0 9.5 6.5 9.5 6.5a17.2 17.2 0 0 1-3.3 4.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.1 7.9A17.1 17.1 0 0 0 2.5 12s3.6 6.5 9.5 6.5c1 0 2-.2 2.9-.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.4 10.4a3.2 3.2 0 0 0 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
