/**
 * ToolPicker — Seletor de ferramentas de desenho e edição de mapa (selecionar, ponto, área, corredor).
 */
const activeToolHint = {
  select: 'Selecione uma área, ponto ou corredor já criado para editar.',
  point: 'Ponto específico: clique uma vez no local exato da planta.',
  polygon: 'Área: clique para contornar a sala/banheiro/escada e finalize com duplo clique.',
  path: 'Corredor: clique para ir marcando o caminho (quantos pontos quiser, para fazer curvas) e finalize com duplo clique.',
};

const tools = [
  { key: 'select', label: 'Selecionar' },
  { key: 'point', label: 'Ponto específico' },
  { key: 'polygon', label: 'Área' },
  { key: 'path', label: 'Corredor' },
];

export function ToolPicker({ theme, activeTool, onSelectTool }) {
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <button
            type="button"
            key={tool.key}
            onClick={() => onSelectTool(tool.key)}
            className={`px-3 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 ${
              activeTool === tool.key
                ? 'bg-[#F59E0B] text-[#0B1B3B] shadow-md'
                : isDark
                ? 'bg-white/10 text-white/70 hover:bg-white/15'
                : 'bg-[#1B2F55]/10 text-[#1B2F55]/70 hover:bg-[#1B2F55]/15'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <p className={`text-xs leading-relaxed ${isDark ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
        {activeToolHint[activeTool]}
      </p>
    </div>
  );
}
