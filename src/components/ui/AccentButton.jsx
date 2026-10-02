/**
 * AccentButton — Botão de destaque âmbar (Salvar, Ouvir, Finalizar).
 */
export function AccentButton({
  children,
  onClick,
  shape = 'pill',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const shapeClass = shape === 'pill' ? 'rounded-full' : 'rounded-lg';
  const sizeClass = size === 'sm' ? 'px-3 py-2 text-xs font-bold' : 'px-5 py-2.5 text-sm font-semibold';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 bg-[#F59E0B] text-[#0B1B3B] hover:bg-[#d97706] transition-colors cursor-pointer min-h-11 min-w-11 lg:min-h-0 disabled:opacity-50 ${shapeClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
