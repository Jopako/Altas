/**
 * GhostButton — Botão translúcido estilo pílula (Voltar, Editar, Cancelar, Selecionar).
 */
export function GhostButton({
  children,
  onClick,
  theme,
  variant = 'panel',
  size = 'sm',
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  const themeClasses =
    variant === 'overlay'
      ? theme === 'dark'
        ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
        : 'bg-white/90 text-[#1B2F55] border border-[#1B2F55]/10 hover:bg-white'
      : theme === 'dark'
        ? 'bg-white/10 text-white/80 border border-white/10 hover:bg-white/15 hover:text-white'
        : 'bg-[#1B2F55]/10 text-[#1B2F55]/80 border border-[#1B2F55]/10 hover:bg-[#1B2F55]/15 hover:text-[#1B2F55]';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors cursor-pointer min-h-11 min-w-11 lg:min-h-0 disabled:opacity-50 ${sizeClasses} ${themeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
