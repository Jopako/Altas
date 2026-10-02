/**
 * EmptyState — Estado vazio para listas e grades sem itens.
 */
export function EmptyState({ theme, message, icon = null }) {
  const isDark = theme === 'dark';
  return (
    <div className="text-center py-12 sm:py-16">
      {icon && <div className="mb-3 flex justify-center">{icon}</div>}
      <p className={`text-sm ${isDark ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
        {message}
      </p>
    </div>
  );
}
