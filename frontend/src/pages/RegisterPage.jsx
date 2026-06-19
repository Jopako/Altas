import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AltasMark from "../assets/imgs/altas-mark.svg";
import { AuthBackground } from "../components/AuthBackground";
import { PageHeader, PageLayout, useTheme } from "../components/PageLayout";

function RegisterPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  async function handleRegister(e) {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("Todos os campos são obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post("http://localhost:3000/api/auth/register", {
        name,
        email,
        password,
      });

      if (response.data?.token) {
        localStorage.setItem("jwt_token", response.data.token);
        navigate("/map-viewer");
        return;
      }

      setError("Não foi possível concluir o cadastro.");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao realizar cadastro.");
    } finally {
      setLoading(false);
    }
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
                    Vamos criar sua conta! Preencha os campos abaixo.
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
                    onSubmit={handleRegister}
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
                          className={`absolute inset-y-0 right-0 px-4 grid place-items-center transition-colors cursor-pointer ${
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
                      disabled={loading}
                      className="mt-4 w-full h-[46px] rounded-[10px] font-semibold text-[13px] shadow-[0_12px_26px_rgba(47,94,168,0.25)] transition-colors bg-[#1B2F55] text-white hover:bg-[#152133] cursor-pointer"
                    >
                      {loading ? "Cadastrando..." : "Cadastrar-se"}
                    </button>

                    <p
                      className={`text-center text-[13px] mt-3 ${
                        theme === "dark" ? "text-white/45" : "text-[#1B2F55]/45"
                      }`}
                    >
                      Já tem uma conta?{" "}
                      <Link
                        to="/login"
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
    </PageLayout>
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
          theme === "dark" ? "text-white/70" : "text-[#1B2F55]/45"
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
            ? "bg-white/5 border-white/10 text-white placeholder:text-white/70 placeholder:opacity-100 focus:border-white/20"
            : "bg-[#F3F4F6] border-[#1B2F55]/10 text-[#0B1B3B] placeholder:text-[#1B2F55]/35 focus:border-[#2F5EA8]/25"
        }`}
      />
      {endAdornment}
    </div>
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
