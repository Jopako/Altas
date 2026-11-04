const MAX_CHARS = 1000;
const CACHE_MAX = 100;
const cache = new Map(); // key -> Buffer (mesma descrição tende a repetir)

const DEFAULT_VOICE = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

async function viaElevenLabs(text, voiceId) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
  });
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function viaGoogle(text) {
  const r = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-A' },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    }
  );
  if (!r.ok) throw new Error(`Google TTS ${r.status}`);
  const { audioContent } = await r.json();
  return Buffer.from(audioContent, 'base64');
}

export async function generateAudio(req, res) {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text) return res.status(400).json({ error: 'Texto obrigatório.' });
  if (text.length > MAX_CHARS) {
    return res.status(413).json({ error: `Texto excede ${MAX_CHARS} caracteres.` });
  }

  const provider = process.env.TTS_PROVIDER || 'elevenlabs';
  const voiceId = /^[A-Za-z0-9]{10,40}$/.test(req.body?.voiceId || '')
    ? req.body.voiceId
    : DEFAULT_VOICE;

  const key = `${provider}:${voiceId}:${text}`;
  try {
    let audio = cache.get(key);
    if (!audio) {
      audio = provider === 'google' ? await viaGoogle(text) : await viaElevenLabs(text, voiceId);
      if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
      cache.set(key, audio);
    }
    res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': audio.length });
    return res.send(audio);
  } catch (err) {
    console.error('[tts]', err.message);
    return res.status(502).json({ error: 'Falha ao gerar áudio.' });
  }
}
