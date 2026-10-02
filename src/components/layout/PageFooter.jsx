/**
 * PageFooter — Rodapé padrão das páginas institucionais e roláveis.
 */
import { themeClasses } from "../../theme";

export function PageFooter({ theme }) {
  return (
    <footer className="absolute left-0 right-0 bottom-0 h-[78px] grid place-items-center z-10 pb-[max(0px,env(safe-area-inset-bottom))]">
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
