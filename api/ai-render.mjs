const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const MAX_FILE_BYTES = 14 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 12;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const rateBuckets = globalThis.__takumiAIRateBuckets || new Map();
globalThis.__takumiAIRateBuckets = rateBuckets;

export const config = {
  maxDuration: 60
};

function json(status, body, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      ...headers,
      "Cache-Control": "no-store"
    }
  });
}

function corsHeaders(request) {
  const origin = request.headers.get("origin");
  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (origin && allowed.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin"
    };
  }

  return {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function clientKey(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded?.trim()) return forwarded.split(",")[0].trim();
  return "unknown";
}

function withinRateLimit(request) {
  const key = clientKey(request);
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || now - bucket.startedAt > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(key, { count: 1, startedAt: now });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= RATE_LIMIT_MAX;
}

export function detectMime(buffer) {
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return "";
}

async function validateImage(file, label) {
  if (!file || typeof file.arrayBuffer !== "function") return null;
  if (file.size > MAX_FILE_BYTES) throw new Error(`${label}_TOO_LARGE`);
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error(`${label}_INVALID_TYPE`);

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectMime(buffer);
  if (!detected || detected !== file.type) throw new Error(`${label}_INVALID_BYTES`);

  return {
    type: "image",
    mime_type: detected,
    data: buffer.toString("base64")
  };
}

export function findOutputImage(value) {
  if (!value || typeof value !== "object") return null;
  if (value.output_image?.data) return value.output_image;
  if (value.outputImage?.data) return value.outputImage;
  // direct base64 fields sometimes used
  if (value.type === "image" && value.data) return value;
  if (value.mime_type && value.data && typeof value.data === "string") return value;
  // Gemini generateContent-style: candidates[].content.parts[].inline_data / inlineData
  const inline = value.inline_data || value.inlineData;
  if (inline?.data) {
    return { data: inline.data, mime_type: inline.mime_type || inline.mimeType };
  }
  for (const key of ["output", "steps", "candidates", "parts", "content", "outputs", "images", "data"]) {
    const child = value[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        const found = findOutputImage(item);
        if (found) return found;
      }
    } else if (child && typeof child === "object") {
      const found = findOutputImage(child);
      if (found) return found;
    }
  }
  return null;
}

export function generationPrompt(brief, workspace) {
  return [
    "あなたは日本の工務店向けの施工後イメージ作成AIです。",
    "1枚目の画像は現場写真、2枚目の画像は配置したい家具・ウッドデッキ等の参考写真です。",
    "現場写真の遠近感、光、影、既存物、住宅の形状を維持してください。",
    "参考写真がある場合は、対象物の形、色、素材感をできるだけ保ってください。",
    "写真上の指定範囲や配置情報は workspace JSON に入っています。",
    "完成画像は営業提案で使うため、実際の施工後写真に近い自然な見た目にしてください。",
    "",
    brief,
    "",
    `workspace: ${workspace || "{}"}`
  ].join("\n");
}

async function callGemini({ brief, workspace, scene, reference }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("MISSING_API_KEY");

  const input = [{ type: "text", text: generationPrompt(brief, workspace) }];
  const sceneInput = await validateImage(scene, "SCENE");
  const referenceInput = await validateImage(reference, "REFERENCE");
  if (sceneInput) input.push(sceneInput);
  if (referenceInput) input.push(referenceInput);

  let response;
  try {
    response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        model: process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image",
        input,
        store: false,
        response_format: {
          type: "image",
          mime_type: process.env.GEMINI_OUTPUT_MIME || "image/jpeg",
          aspect_ratio: process.env.GEMINI_ASPECT_RATIO || "4:3",
          image_size: process.env.GEMINI_IMAGE_SIZE || "1K"
        }
      })
    });
  } catch (err) {
    throw new Error(`GEMINI_FETCH_FAILED: ${err?.message || err}`);
  }

  const rawText = await response.text();
  let payload = {};
  try {
    payload = rawText ? JSON.parse(rawText) : {};
  } catch {
    payload = { _raw: rawText };
  }

  if (!response.ok) {
    const msg =
      payload?.error?.message ||
      payload?.message ||
      (typeof payload._raw === "string" ? payload._raw.slice(0, 400) : JSON.stringify(payload).slice(0, 400));
    throw new Error(`GEMINI_HTTP_${response.status}: ${msg}`);
  }

  const outputImage = findOutputImage(payload);
  if (!outputImage?.data) {
    const keys = payload && typeof payload === "object" ? Object.keys(payload).join(",") : typeof payload;
    throw new Error(`NO_IMAGE_RETURNED (top-level keys: ${keys})`);
  }

  return {
    imageBase64: outputImage.data,
    mimeType: outputImage.mime_type || outputImage.mimeType || "image/jpeg"
  };
}

export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request)
  });
}

export async function POST(request) {
  const headers = corsHeaders(request);

  if (!withinRateLimit(request)) {
    return json(429, { error: "Too many requests. Please wait a minute." }, headers);
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return json(400, { error: "Invalid request" }, headers);
    }

    const formData = await request.formData();
    const brief = String(formData.get("brief") || "").trim();
    if (brief.length < 20 || brief.length > 9000) {
      return json(400, { error: "Invalid generation brief" }, headers);
    }

    const result = await callGemini({
      brief,
      workspace: String(formData.get("workspace") || "{}"),
      scene: formData.get("scene"),
      reference: formData.get("reference")
    });

    return json(200, result, headers);
  } catch (error) {
    const message = error.message || "";
    // Log full detail to Vercel runtime logs
    console.error("[ai-render] generation failed:", message);

    if (message.includes("TOO_LARGE")) {
      return json(413, { error: "Image file is too large" }, headers);
    }
    if (message.includes("INVALID")) {
      return json(400, { error: "Invalid image file" }, headers);
    }
    if (message === "MISSING_API_KEY") {
      return json(500, { error: "Gemini API is not configured (GEMINI_API_KEY missing)" }, headers);
    }
    // Surface the real underlying reason instead of a blank 502.
    return json(502, { error: "AI image generation failed", detail: message }, headers);
  }
}
