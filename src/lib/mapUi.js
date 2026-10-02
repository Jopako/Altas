/**
 * mapUi — Classes utilitárias Tailwind compartilhadas entre telas de mapa.
 */

export function shellOuterClasses(theme) {
  return theme === 'dark'
    ? 'bg-[radial-gradient(circle_at_top,rgba(74,127,212,0.14),transparent_42%),linear-gradient(180deg,#071427_0%,#0b1830_55%,#071427_100%)] text-white'
    : 'bg-transparent text-[#1B2F55]';
}

export function panelClasses(theme) {
  return theme === 'dark'
    ? 'bg-[#0b1830]/85 border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl'
    : 'bg-[#f1f6fb] border-[#1B2F55]/10 shadow-[0_16px_40px_rgba(27,47,85,0.08)] backdrop-blur-xl';
}

export function inputClasses(theme, { size = 'md' } = {}) {
  const padding = size === 'sm' ? 'px-3 py-2.5' : 'px-4 py-3';
  return theme === 'dark'
    ? `w-full ${padding} rounded-xl text-sm outline-none transition-colors bg-[#0f2346] border border-white/10 text-white placeholder:text-white/30 focus:border-[#4A7FD4]`
    : `w-full ${padding} rounded-xl text-sm outline-none transition-colors bg-white border border-[#1B2F55]/15 text-[#1B2F55] placeholder:text-[#1B2F55]/35 focus:border-[#4A7FD4]`;
}

export function labelClasses(theme) {
  return `block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`;
}
