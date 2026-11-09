// Cloudflare Worker: awaaz (WAV) -> Urdu text, Workers AI Whisper. Koi API key nahi chahiye.
const CORS = {
  'Access-Control-Allow-Origin': 'https://xohaibkhalid-tech.github.io',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (req.method !== 'POST') return new Response('ok', { headers: CORS });
    try {
      const buf = new Uint8Array(await req.arrayBuffer());
      if (buf.length < 1000 || buf.length > 2_000_000) return Response.json({ text: '' }, { headers: CORS });
      let bin = ''; for (let i = 0; i < buf.length; i += 8192) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 8192));
      const out = await env.AI.run('@cf/openai/whisper-large-v3-turbo', {
        audio: btoa(bin), language: 'ur', task: 'transcribe',
        initial_prompt: 'سورہ کہف لگاؤ۔ سورہ یاسین سنائیں۔ ذکر کرنا ہے۔ سبحان اللہ سو بار۔ ہدف پانچ سو۔',
      });
      return Response.json({ text: (out && out.text || '').trim() }, { headers: CORS });
    } catch (e) {
      return Response.json({ text: '', error: String(e) }, { status: 500, headers: CORS });
    }
  },
};
