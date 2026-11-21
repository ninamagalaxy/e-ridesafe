// Server-only MindDo key lookup. Never import this module into browser code.

let cachedKey = null;
let cachedExpiresAt = 0;

function keygenError(message, fix, cause) {
  const error = new Error(message);
  error.fix = fix;
  if (cause) error.cause = cause;
  return error;
}

function invalidateKey() {
  cachedKey = null;
  cachedExpiresAt = 0;
}

function toKeyErrorResponse(error) {
  const message = error?.message || "The AI key request failed.";
  const fix = error?.fix || "Check the server configuration and try again later.";
  console.error(fix);
  return { error: { message, fix } };
}

async function getKey() {
  if (cachedKey && Date.now() < cachedExpiresAt) {
    return cachedKey;
  }

  const keygenUrl = process.env.KEYGEN_URL;
  const keygenToken = process.env.KEYGEN_TOKEN;

  if (!keygenUrl || !keygenToken || keygenUrl === "paste-here" || keygenToken === "paste-here") {
    throw keygenError(
      "The AI key service is not configured.",
      "Set KEYGEN_URL and KEYGEN_TOKEN in the server's .env file."
    );
  }

  let response;
  try {
    response = await fetch(`${keygenUrl.replace(/\/$/, "")}/api/lookup-key`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keygenToken}`,
        Accept: "application/json"
      }
    });
  } catch (cause) {
    throw keygenError(
      "The AI key service could not be reached.",
      "Check KEYGEN_URL, the server network connection, and the MindDo service.",
      cause
    );
  }

  let body;
  try {
    body = await response.json();
  } catch (cause) {
    throw keygenError(
      "The AI key service returned an invalid response.",
      "Check the MindDo service response and server configuration.",
      cause
    );
  }

  if (!response.ok || !body.apiKey || !body.expiresAt) {
    throw keygenError(
      body.message || "The AI key service rejected the request.",
      body.fix || "Check the MindDo URL and token in the server's .env file."
    );
  }

  const expiresAt = Date.parse(body.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw keygenError(
      "The AI key service returned an expired key.",
      "Check the MindDo service and request a fresh key."
    );
  }

  cachedKey = body.apiKey;
  cachedExpiresAt = expiresAt;
  return cachedKey;
}

module.exports = { getKey, invalidateKey, toKeyErrorResponse };
