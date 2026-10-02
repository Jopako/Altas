/**
 * MobileNav — Menu de navegação para dispositivos móveis (< md).
 * Renderiza links públicos ou logados em painel colapsável.
 */
import { useLocation, useNavigate } from "react-router-dom";
import { themeClasses } from "../../theme";
import { publicNavLinks, loggedInNavLinks } from "../../lib/navLinks";

export function MobileNav({ isOpen, onClose, theme, isLoggedIn = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const links = isLoggedIn ? loggedInNavLinks : publicNavLinks;

  return (
    <div
      className={`md:hidden absolute top-full left-0 right-0 z-50 border-b shadow-lg px-6 py-4 flex flex-col gap-2 ${themeClasses[theme].surface}`}
    >
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        const activeClass = isActive
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
            onClick={() => {
              navigate(link.to);
              onClose();
            }}
            className={`text-left py-2.5 text-base transition-colors min-h-11 flex items-center cursor-pointer ${activeClass}`}
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
          </button>
        );
      })}
    </div>
  );
}
