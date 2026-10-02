/**
 * PageHeader — Cabeçalho principal com navegação desktop, menu mobile e alternador de tema.
 */
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AltasMark from "../../assets/imgs/altas-mark.svg";
import { MobileNav } from "../ui/MobileNav";
import { publicNavLinks } from "../../lib/navLinks";
import { SunIcon, MoonIcon, MenuIcon, MenuCloseIcon } from "../icons/Icons";

export function PageHeader({ theme, setTheme, actions }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="relative z-30 flex items-center justify-between px-4 sm:px-10 lg:px-16 py-4 sm:py-5 flex-shrink-0">
      {/* Lado esquerdo: Logo */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 select-none cursor-pointer"
          aria-label="Ir para a página inicial"
        >
          <img src={AltasMark} alt="ALTAS" className="h-8 w-8 sm:h-9 sm:w-9" />
          <span className="font-semibold tracking-[0.18em] text-[13px]">
            ALTAS
          </span>
        </button>
      </div>

      {/* Centro: Nav Desktop */}
      <nav
        className={`hidden md:flex items-center gap-7 text-[16px] ${
          theme === "dark" ? "text-white/70" : "text-[#1B2F55]/75"
        }`}
        aria-label="Navegação principal"
      >
        {publicNavLinks.map((link) => {
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

      {/* Lado direito: Ações + Login/Logout + Tema + Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {actions}

        <p
          className={`hidden sm:block text-[10px] font-semibold tracking-[0.28em] uppercase ${
            theme === "dark" ? "text-white/50" : "text-[#1B2F55]/50"
          }`}
        >
          Mapeamento institucional
        </p>

        <button
          type="button"
          onClick={() => navigate("/map-editor")}
          className="rounded-full bg-[#F59E0B] px-3 sm:px-4 py-2 text-[12px] font-semibold text-[#0B1B3B] transition-colors hover:bg-[#d97706] min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 flex items-center justify-center cursor-pointer"
        >
          Editar Mapas
        </button>

        {/* Botão de Tema */}
        <button
          className={`h-9 w-9 rounded-full grid place-items-center transition-colors cursor-pointer shrink-0 ${
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
          {theme === "dark" ? (
            <SunIcon className="h-[18px] w-[18px]" />
          ) : (
            <MoonIcon className="h-[18px] w-[18px]" />
          )}
        </button>

        {/* Botão Hamburger (mobile < md) */}
        <button
          type="button"
          onClick={() => setMobileNavOpen((prev) => !prev)}
          className={`md:hidden h-9 w-9 rounded-lg flex items-center justify-center cursor-pointer ${
            theme === "dark" ? "text-white bg-white/10" : "text-[#1B2F55] bg-[#1B2F55]/10"
          }`}
          aria-label={mobileNavOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileNavOpen ? (
            <MenuCloseIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        theme={theme}
      />
    </header>
  );
}
