/**
 * speech — Leitura de texto por voz (Web Speech API).
 */

export function falar(texto) {
  if (!('speechSynthesis' in window)) return alert('Este navegador não suporta leitura em voz.');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'pt-BR';
  speechSynthesis.speak(u);
}
