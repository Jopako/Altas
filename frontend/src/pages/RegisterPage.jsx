import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import AltasMark from "../assets/imgs/altas-mark.svg";

function RegisterPage() {
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  return (
    <div
      className={`min-h-[100svh] overflow-hidden relative flex flex-col ${
        theme === "dark"
          ? "bg-[#0d203b] text-white"
          : "bg-[#D7E7FF] text-[#1B2F55]"
      }`}
    >
      <RegisterBackground theme={theme} />

      <header className="relative z-10 grid grid-cols-[1fr_auto] items-center px-6 sm:px-10 lg:px-16 py-5">
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

        <div className="flex items-center gap-3 justify-self-end">
          <p
            className={`hidden sm:block text-[10px] font-semibold tracking-[0.28em] uppercase ${
              theme === "dark" ? "text-white/50" : "text-[#1B2F55]/50"
            }`}
          >
            Mapeamento institucional
          </p>
          <button
            className={`h-9 w-9 rounded-full grid place-items-center transition-colors cursor-pointer bg-[#1B2F55] text-white hover:bg-[#152133]`}
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
              <div className="p-7 sm:p-9 md:p-10 lg:p-12 flex items-center justify-center">
                <div className="w-full max-w-[420px]">
                  <div className="flex items-center gap-2 select-none justify-center">
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
                    className={`mt-7 text-center text-[clamp(1.65rem,3vw,36px)] leading-[1.15] font-extrabold tracking-[-0.02em] ${
                      theme === "dark" ? "text-white" : "text-[#0B1B3B]"
                    }`}
                  >
                    Cadastre-se
                  </h1>
                  <p
                    className={`mt-3 text-center text-[13px] leading-[1.7] ${
                      theme === "dark" ? "text-white/70" : "text-[#1B2F55]/60"
                    }`}
                  >
                    Vamos criar sua conta! preencha os seguintes campos:
                  </p>

                  <div className="mt-6 flex items-center justify-center">
                    <div
                      className={`h-px w-[78%] ${
                        theme === "dark" ? "bg-white/10" : "bg-[#1B2F55]/10"
                      }`}
                    />
                  </div>

                  <form
                    className="mt-7 space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <Field
                      id={nameId}
                      theme={theme}
                      type="text"
                      label="Nome"
                      placeholder="Nome"
                      icon={<UserIcon />}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />

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
                      autoComplete="new-password"
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

                    <button
                      type="submit"
                      className={`mt-4 w-full h-[46px] rounded-[10px] font-semibold text-[13px] shadow-[0_12px_26px_rgba(47,94,168,0.25)] transition-colors bg-[#1B2F55] text-white hover:bg-[#152133]`}
                    >
                      Cadastrar-se
                    </button>

                    <p
                      className={`text-center text-[13px] mt-3 ${
                        theme === "dark" ? "text-white/45" : "text-[#1B2F55]/45"
                      }`}
                    >
                      Já tem uma conta?{" "}
                      <Link
                        to="/Login"
                        className="font-semibold transition-colors text-[#F59E0B] hover:text-[#d97706]"
                      >
                        Faça login
                      </Link>
                    </p>
                  </form>
                </div>
              </div>

              <div className="hidden md:block relative">
                <div className="absolute inset-0 bg-[#1B2F55]" />
                <div className="relative h-full p-10 lg:p-12 flex items-center justify-center">
                  <div className="w-full max-w-[440px]">
                    <RegisterIllustration />
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
}

export default RegisterPage;

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

function RegisterBackground({ theme }) {
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
          fillOpacity={theme === "dark" ? "0.16" : "0.2"}
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

function RegisterIllustration() {
  return (
    <svg
      viewBox="0 0 520 420"
      className="w-full h-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="120" y="110" width="280" height="210" rx="18" fill="#E9E3DD" />

      <g opacity="0.35" stroke="#0B1B3B" strokeWidth="6">
        <line x1="170" y1="150" x2="170" y2="305" />
        <line x1="220" y1="140" x2="220" y2="320" />
        <line x1="270" y1="140" x2="270" y2="320" />
        <line x1="320" y1="140" x2="320" y2="320" />
        <line x1="370" y1="150" x2="370" y2="305" />

        <line x1="135" y1="180" x2="385" y2="180" />
        <line x1="135" y1="230" x2="385" y2="230" />
        <line x1="135" y1="280" x2="385" y2="280" />
      </g>

      <circle cx="188" cy="235" r="7" fill="#F59E0B" opacity="0.9" />
      <circle cx="345" cy="235" r="7" fill="#EF4444" opacity="0.85" />
      <circle cx="250" cy="300" r="7" fill="#F59E0B" opacity="0.75" />

      <g>
        <path
          d="M325 110c-36.5 0-66 27.9-66 62.2 0 44.4 52 97.6 61 106.6a7.2 7.2 0 0 0 10.1 0c9-9 61-62.2 61-106.6C391.1 137.9 361.5 110 325 110Z"
          fill="#F59E0B"
        />
        <circle cx="325" cy="170" r="18" fill="#fff" opacity="0.9" />
      </g>
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

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12.2a4.4 4.4 0 1 0 0-8.8 4.4 4.4 0 0 0 0 8.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.5 20.2a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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
