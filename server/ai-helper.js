// Local-only bridge: the phone sends questions here, and this computer calls OpenAI.
// The key and MindDo token never leave this process.
const fs = require('fs');
const http = require('http');
const path = require('path');
const { getKey, invalidateKey, toKeyErrorResponse } = require('./keygen');

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

function loadModel() {
  const notes = fs.readFileSync(path.resolve(__dirname, '..', 'NOTES.md'), 'utf8');
  const match = notes.match(/^OpenAI model:\s*(\S+)/m);
  if (!match) throw new Error('The OpenAI model is not set in NOTES.md.');
  return match[1];
}

function loadInstructions() {
  return fs.readFileSync(path.resolve(__dirname, '..', 'BRIEF.md'), 'utf8');
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
  response.end(JSON.stringify(body));
}

function safeError(error) {
  return { error: { message: error?.message || 'The AI helper could not answer.', fix: error?.fix || 'Check Wi-Fi and make sure the helper is running.' } };
}

async function askOpenAI(message, apiKey, model) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: loadInstructions() }, { role: 'user', content: message }] }),
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function handleAsk(message) {
  const model = loadModel();
  let apiKey = await getKey();
  let result = await askOpenAI(message, apiKey, model);
  // Refresh once if OpenAI rejects the key. There is intentionally no retry loop.
  if (result.response.status === 401) {
    invalidateKey();
    apiKey = await getKey();
    result = await askOpenAI(message, apiKey, model);
  }
  if (!result.response.ok) {
    throw Object.assign(new Error(result.body?.error?.message || 'The AI could not answer.'), { fix: 'Check the OpenAI model access and the local helper configuration.' });
  }
  return result.body?.choices?.[0]?.message?.content || 'I do not know yet. Please check an official local safety source.';
}

loadEnv();
const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return sendJson(response, 204, {});
  if (request.method === 'GET' && request.url === '/health') return sendJson(response, 200, { ok: true });
  if (request.method !== 'POST' || request.url !== '/ask') return sendJson(response, 404, { error: { message: 'That helper route was not found.', fix: 'Use POST /ask.' } });

  let raw = '';
  request.on('data', (chunk) => { raw += chunk; if (raw.length > 12000) request.destroy(); });
  request.on('end', async () => {
    try {
      const message = JSON.parse(raw).message;
      if (typeof message !== 'string' || !message.trim()) return sendJson(response, 400, { error: { message: 'Please enter a question.', fix: 'Send a non-empty message to POST /ask.' } });
      return sendJson(response, 200, { answer: await handleAsk(message.trim()) });
    } catch (error) {
      const result = error?.fix ? toKeyErrorResponse(error) : safeError(error);
      return sendJson(response, 502, result);
    }
  });
});

const port = Number(process.env.ERIDESAFE_HELPER_PORT || 8787);
server.listen(port, '0.0.0.0', () => console.log(`E-RideSafe AI helper listening on port ${port}`));
