import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
let current = null; // { audio, url }
let gen = 0; // invalida requisições em andamento

export function stopTextToSpeech() {
  gen++;
  if (!current) return;
  current.audio.pause();
  URL.revokeObjectURL(current.url);
  current = null;
}

/** Toca o texto e resolve quando o áudio TERMINA (ou é interrompido). */
export async function playTextToSpeech(text, voiceId) {
  stopTextToSpeech();
  const myGen = gen;
  const { data } = await axios.post(
    `${API_BASE}/api/tts`,
    { text, ...(voiceId ? { voiceId } : {}) },
    { responseType: 'blob' }
  );
  if (myGen !== gen) return; // parado/trocado enquanto carregava
  const url = URL.createObjectURL(data);
  const audio = new Audio(url);
  current = { audio, url };

  return new Promise((resolve, reject) => {
    const done = () => { if (current?.audio === audio) stopTextToSpeech(); resolve(); };
    audio.onended = done;
    audio.onpause = done;
    audio.onerror = () => { stopTextToSpeech(); reject(new Error('Falha ao reproduzir áudio.')); };
    audio.play().catch((e) => { stopTextToSpeech(); reject(e); });
  });
}
