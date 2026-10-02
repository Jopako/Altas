/**
 * PageLayout — Estrutura de casca principal das páginas.
 * Modo rolável (padrão): min-h-[100svh] overflow-y-auto com footer.
 * Modo full-bleed (tela de mapa): h-[100svh] overflow-hidden sem scroll externo.
 */
import { themeClasses } from "../../theme";
import { PageFooter } from "./PageFooter";

export function PageLayout({
  theme,
  children,
  background,
  footer,
  bottomBar = true,
  showFooter = true,
  fullBleed = false,
}) {
  const isMapMode = fullBleed || (!showFooter && !bottomBar);

  if (isMapMode) {
    return (
      <div className={`h-[100svh] overflow-hidden flex flex-col relative ${themeClasses[theme].page}`}>
        {background}
        {children}
      </div>
    );
  }

  return (
    <div
      className={`min-h-[100svh] overflow-y-auto overflow-x-hidden relative flex flex-col ${
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
