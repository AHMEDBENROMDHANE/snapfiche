// Client kie.ai (réutilisé de l'app de bureau). La clé reste côté serveur.
const BASE_URL = 'https://api.kie.ai';
const CREDIT_USD = 0.005;

function authHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
}
async function post(url, apiKey, body) {
  const res = await fetch(url, { method: 'POST', headers: authHeaders(apiKey), body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (json.code !== 200 && json.success !== true) throw new Error(json.msg || `Erreur API (HTTP ${res.status})`);
  return json.data;
}
async function get(path, apiKey) {
  const res = await fetch(`${BASE_URL}${path}`, { method: 'GET', headers: authHeaders(apiKey) });
  const json = await res.json().catch(() => ({}));
  if (json.code !== 200) throw new Error(json.msg || `Erreur API (HTTP ${res.status})`);
  return json.data;
}

async function getCredits(apiKey) {
  const data = await get('/api/v1/chat/credit', apiKey);
  const credits = typeof data === 'number' ? data : data && data.credits ? data.credits : 0;
  return { credits, usd: +(credits * CREDIT_USD).toFixed(2) };
}

const UPLOAD_URL = 'https://kieai.redpandaai.co/api/file-base64-upload';
async function uploadBase64(apiKey, base64DataUrl, fileName) {
  const data = await post(UPLOAD_URL, apiKey, {
    base64Data: base64DataUrl,
    uploadPath: 'images/snapfiche',
    fileName: fileName || 'upload.png',
  });
  return data.downloadUrl;
}

async function generateFlux(apiKey, input) {
  const body = {
    prompt: input.prompt,
    aspectRatio: input.aspectRatio || '16:9',
    model: input.model || 'flux-kontext-pro',
    outputFormat: input.outputFormat || 'png',
    enableTranslation: true,
  };
  if (input.inputImage) body.inputImage = input.inputImage;
  const data = await post(`${BASE_URL}/api/v1/flux/kontext/generate`, apiKey, body);
  return data.taskId;
}
async function pollFlux(apiKey, taskId) {
  const data = await get(`/api/v1/flux/kontext/record-info?taskId=${encodeURIComponent(taskId)}`, apiKey);
  return normalizeLegacy(data.successFlag, data.response && data.response.resultImageUrl, data.errorMessage);
}
async function generateVeo(apiKey, input) {
  const body = {
    prompt: input.prompt,
    model: input.model || 'veo3_fast',
    aspect_ratio: input.aspect_ratio || '16:9',
    resolution: input.resolution || '720p',
    duration: input.duration || 8,
    enableTranslation: true,
  };
  if (input.imageUrls && input.imageUrls.length) {
    body.imageUrls = input.imageUrls;
    body.generationType = input.generationType || 'REFERENCE_2_VIDEO';
  } else {
    body.generationType = 'TEXT_2_VIDEO';
  }
  const data = await post(`${BASE_URL}/api/v1/veo/generate`, apiKey, body);
  return data.taskId;
}
async function pollVeo(apiKey, taskId) {
  const data = await get(`/api/v1/veo/record-info?taskId=${encodeURIComponent(taskId)}`, apiKey);
  const urls = data.response && (data.response.resultUrls || data.response.fullResultUrls);
  return normalizeLegacy(data.successFlag, urls && urls[0], data.errorMessage);
}
function normalizeLegacy(flag, url, errorMessage) {
  return { done: flag === 1, failed: flag === 2 || flag === 3, resultUrl: url || null, error: errorMessage || null, credits: null };
}

async function createJob(apiKey, model, input) {
  const data = await post(`${BASE_URL}/api/v1/jobs/createTask`, apiKey, { model, input });
  return data.taskId;
}
async function pollJob(apiKey, taskId) {
  const data = await get(`/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, apiKey);
  const state = data.state;
  let urls = [];
  if (data.resultJson) {
    try { const r = JSON.parse(data.resultJson); urls = r.resultUrls || (r.resultUrl ? [r.resultUrl] : []); } catch (_) {}
  }
  if (!urls.length && data.response) urls = data.response.resultUrls || [];
  return {
    done: state === 'success',
    failed: state === 'fail',
    resultUrl: urls[0] || null,
    error: data.failMsg || null,
    credits: typeof data.creditsConsumed === 'number' ? data.creditsConsumed : null,
  };
}

async function chat(apiKey, model, messages) {
  const res = await fetch(`${BASE_URL}/${model}/v1/chat/completions`, {
    method: 'POST', headers: authHeaders(apiKey), body: JSON.stringify({ model, messages }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json.error && json.error.message) || json.msg || `Erreur IA (HTTP ${res.status})`);
  if (!json.choices || !json.choices[0] || !json.choices[0].message) {
    throw new Error((json.error && json.error.message) || json.msg || 'Réponse inattendue du modèle.');
  }
  const msg = json.choices[0].message;
  const content = typeof msg.content === 'string' ? msg.content : msg.reasoning_content || '';
  if (!content.trim()) throw new Error('Réponse vide du modèle (réessayez).');
  return content.trim();
}

async function generate(apiKey, { api, model, input }) {
  if (api === 'flux') return generateFlux(apiKey, input);
  if (api === 'veo') return generateVeo(apiKey, input);
  if (api === 'jobs') return createJob(apiKey, model, input);
  throw new Error(`API inconnue : ${api}`);
}
async function poll(apiKey, { api, taskId }) {
  if (api === 'flux') return pollFlux(apiKey, taskId);
  if (api === 'veo') return pollVeo(apiKey, taskId);
  if (api === 'jobs') return pollJob(apiKey, taskId);
  throw new Error(`API inconnue : ${api}`);
}

module.exports = { getCredits, uploadBase64, generate, poll, chat, CREDIT_USD };
