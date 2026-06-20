import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AltasMark from "../assets/imgs/altas-mark.svg";
import { themeClasses } from "../theme";

const publicNavLinks = [
  { label: "Equipe", to: "/TeamPage" },
  { label: "Fale conosco", to: "/FaleConosco" },
  { label: "Instituições", to: "/Instituicoes" },
];

const loggedInNavLinks = [
  { label: "Home", to: "/map-viewer" },
];

export function useTheme() {
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

  return [theme, setTheme];
}

export function PageLayout({
  theme,
  children,
  background,
  footer,
  bottomBar = true,
  showFooter = true,
}) {
  return (
    <div
      className={`min-h-[100svh] overflow-hidden relative flex flex-col ${
        bottomBar || showFooter ? "pb-[110px]" : ""
      } ${themeClasses[theme].page}`}
    >
      {background}

      {bottomBar && (
        <div
          className={`absolute left-0 right-0 bottom-0 h-[78px] ${
            theme === "dark" ? "bg-[#071427]" : "bg-[#1B2F55]"
          }`}
          aria-hidden="true"
        />
      )}

      {children}
      {footer ?? (showFooter ? <PageFooter theme={theme} /> : null)}
    </div>
  );
}

export function PageHeader({ theme, setTheme, actions, isLoggedIn = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = typeof window !== "undefined"
    ? window.localStorage.getItem("jwt_token")
    : null;

  return (
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
        className={`hidden md:flex items-center pl-7 gap-7 text-[16px] justify-self-center ${
          theme === "dark" ? "text-white/70" : "text-[#1B2F55]/75"
        }`}
        aria-label="Navegação principal"
      >
        {(isLoggedIn ? loggedInNavLinks : publicNavLinks).map((link) => {
          const isActive = location.pathname === link.to;
          const base = isActive
            ? theme === "dark"
              ? "text-white font-semibold"
              : "text-[#1B2F55] font-semibold"
            : theme === "dark"
              ? "text-white/70 hover:text-white"
              : "text-[#1B2F55]/75 hover:text-[#1B2F55]";

          return (
            <button
              type="button"
              key={link.to}
              onClick={() => navigate(link.to)}
              className={`transition-colors cursor-pointer ${base}`}
              aria-current={isActive ? "page" : undefined}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 justify-self-end">
        {actions}

        <p
          className={`hidden sm:block text-[10px] font-semibold tracking-[0.28em] uppercase ${
            theme === "dark" ? "text-white/50" : "text-[#1B2F55]/50"
          }`}
        >
          Mapeamento institucional
        </p>

        {isLoggedIn ? (
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('jwt_token');
              navigate('/login');
            }}
            className={`rounded-full px-4 py-2 text-[12px] font-semibold border transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#3F64A6]/20 border-[#3F64A6]/40 text-blue-300 hover:bg-[#3F64A6]/35'
                : 'bg-[#3F64A6]/10 border-[#3F64A6]/20 text-[#3F64A6] hover:bg-[#3F64A6]/20'
            }`}
          >
            Sair
          </button>
        ) : (
          location.pathname !== "/login" && location.pathname !== "/Login" ? (
            <button
              type="button"
              onClick={() => navigate(token ? "/map-viewer" : "/login")}
              className="rounded-full bg-[#F59E0B] px-4 py-2 text-[12px] font-semibold text-[#0B1B3B] transition-colors hover:bg-[#d97706]"
            >
              Login
            </button>
          ) : null
        )}

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
  );
}

export function PageFooter({ theme }) {
  return (
    <footer className="absolute left-0 right-0 bottom-0 h-[78px] grid place-items-center z-10">
      <p
        className={`text-[10px] font-semibold tracking-[0.28em] uppercase ${
          theme === "dark"
            ? themeClasses.dark.footerText
            : themeClasses.light.footerText
        }`}
      >
        Equipe Altas - 2026
      </p>
    </footer>
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
