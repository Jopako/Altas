import { useId, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AltasMark from "../assets/imgs/altas-mark.svg";
import LoginPlaceholder from "../assets/imgs/login-placeholder.svg";
import { PageHeader, PageLayout, useTheme } from "../components/PageLayout";
import { AuthBackground } from "../components/AuthBackground";

const LoginPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navLinkClass = useMemo(
    () =>
      ({ isActive }) =>
        [
          "transition-colors cursor-pointer",
          isActive
            ? theme === "dark"
              ? "text-white font-semibold"
              : "text-[#1B2F55] font-semibold"
            : theme === "dark"
              ? "text-white/70 hover:text-white"
              : "text-[#1B2F55]/75 hover:text-[#1B2F55]",
        ].join(" "),
    [theme],
  );

  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  async function handleStandardLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("E-mail e senha são obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      if (response.data?.token) {
        localStorage.setItem("jwt_token", response.data.token);
        navigate("/map-viewer");
        return;
      }

      setError("Não foi possível entrar com essas credenciais.");
    } catch (err) {
      setError(err.response?.data?.error || "Erro de autenticação. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  function handleOAuthLogin(provider) {
    window.location.href = `http://localhost:3000/auth/${provider}`;
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
        <section className="w-full max-w-[1100px] mx-auto">
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
                    className="flex-1 h-[44px] rounded-[10px] bg-[#F59E0B] text-[#0B1B3B] hover:bg-[#d97706] font-semibold text-[13px] shadow-[0_10px_24px_rgba(245,158,11,0.25)] flex items-center justify-center gap-3 transition-colors cursor-pointer"
                    onClick={() => handleOAuthLogin("google")}
                  >
                    <GoogleIcon />
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex-1 h-[44px] rounded-[10px] bg-[#F59E0B] text-[#0B1B3B] hover:bg-[#d97706] font-semibold text-[13px] shadow-[0_10px_24px_rgba(245,158,11,0.25)] flex items-center justify-center gap-3 transition-colors cursor-pointer"
                    onClick={() => handleOAuthLogin("microsoft")}
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
                  onSubmit={handleStandardLogin}
                >
                  {error ? (
                    <div
                      className={`rounded-[8px] border px-3 py-2 text-[12px] text-left ${
                        theme === "dark"
                          ? "border-red-500/25 bg-red-500/10 text-red-200"
                          : "border-red-400/30 bg-red-50 text-red-700"
                      }`}
                    >
                      {error}
                    </div>
                  ) : null}

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

                  <div className="flex items-center">
                    <label
                      htmlFor={rememberId}
                      className={`flex items-center gap-2 text-[12px] select-none cursor-pointer ${
                        theme === "dark" ? "text-white/70" : "text-[#1B2F55]/75"
                      }`}
                    >
                      <input
                        id={rememberId}
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        type="checkbox"
                        className="h-4 w-4 rounded-[6px] border border-[#2F5EA8]/30 text-[#2F5EA8] focus:ring-[#2F5EA8]"
                      />
                      Permanecer conectado
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-3 w-full h-[46px] rounded-[10px] font-semibold text-[13px] shadow-[0_12px_26px_rgba(47,94,168,0.25)] transition-colors bg-[#1B2F55] text-white hover:bg-[#152133] cursor-pointer"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </button>
                </form>

                <p
                  className={`mt-4 text-[12px] ${
                    theme === "dark" ? "text-white/55" : "text-[#1B2F55]/65"
                  }`}
                >
                  Não tem uma conta?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-[#F59E0B] hover:text-[#d97706]"
                  >
                    Cadastre-se
                  </Link>
                </p>
              </div>
              <div className="hidden md:block relative">
                <div className="absolute inset-0 bg-[#1B2F55]" />
                <div className="relative h-full p-10 lg:p-12 flex items-center justify-center">
                  <img
                    src={LoginPlaceholder}
                    alt="Ilustração de mapa ALTAS"
                    className="w-full max-w-[440px]"
                  />
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
          theme === "dark" ? "text-white/70" : "text-[#1B2F55]/45"
        }`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full h-[46px] rounded-2xl border px-14 pr-16 text-sm outline-none transition-colors ${
          theme === "dark"
            ? "border-white/10 bg-[#0f2346] text-white placeholder:text-white/70 placeholder:opacity-100 focus:border-white/20"
            : "border-[#2F5EA8]/20 bg-white text-[#1B2F55] placeholder:text-[#1B2F55]/35 focus:border-[#2F5EA8]/25"
        }`}
      />
      {endAdornment}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22 12.22c0-.72-.06-1.41-.17-2.08H12v3.94h5.92c-.24 1.29-1 2.39-2.14 3.13v2.6h3.45c2.02-1.86 3.17-4.6 3.17-7.59z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.45-2.6c-.96.65-2.18 1.03-3.17 1.03-2.44 0-4.51-1.65-5.25-3.87H3.12v2.42C4.71 19.8 8.06 22 12 22z"
        fill="#34A853"
      />
      <path
        d="M6.75 13.14a5.94 5.94 0 010-3.88V6.84H3.12a9.98 9.98 0 000 10.32l3.63-2.02z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.08c1.47 0 2.78.5 3.82 1.48l2.86-2.86C16.96 2.12 14.7 1.22 12 1.22 8.06 1.22 4.71 3.42 3.12 6.84l3.63 2.42C7.48 6.73 9.56 5.08 12 5.08z"
        fill="#EA4335"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="9" height="9" fill="#F35325" />
      <rect x="13" y="2" width="9" height="9" fill="#81BC06" />
      <rect x="2" y="13" width="9" height="9" fill="#05A6F0" />
      <rect x="13" y="13" width="9" height="9" fill="#FFBA08" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 7.5V17c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3 7.5l8.5 6 8.5-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="6.5"
        y="10.5"
        width="11"
        height="8"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9.5 10.5V8.25c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V10.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 12c2.5-5 7.5-5 9-5s6.5 0 9 5c-2.5 5-7.5 5-9 5s-6.5 0-9-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 12c2.5-5 7.5-5 9-5s6.5 0 9 5c-2.5 5-7.5 5-9 5s-6.5 0-9-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 4.5L19.5 19.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
