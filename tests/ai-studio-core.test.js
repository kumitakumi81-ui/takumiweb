const test = require("node:test");
const assert = require("node:assert/strict");

const {
  clamp,
  fitImageInside,
  normalizeStroke,
  buildGenerationBrief,
  summarizeWorkspace
} = require("../assets/ai-studio-core.js");

test("clamp limits values to the provided range", () => {
  assert.equal(clamp(-4, 0, 10), 0);
  assert.equal(clamp(7, 0, 10), 7);
  assert.equal(clamp(42, 0, 10), 10);
});

test("fitImageInside preserves aspect ratio and centers the image", () => {
  assert.deepEqual(fitImageInside({ width: 1600, height: 900 }, { width: 800, height: 600 }), {
    width: 800,
    height: 450,
    x: 0,
    y: 75,
    scale: 0.5
  });
});

test("normalizeStroke clamps drawing points into proportional image space", () => {
  assert.deepEqual(
    normalizeStroke(
      [
        { x: -10, y: 20 },
        { x: 500, y: 300 },
        { x: 900, y: 700 }
      ],
      { x: 100, y: 50, width: 800, height: 600 }
    ),
    [
      { x: 0, y: 0 },
      { x: 0.5, y: 0.4167 },
      { x: 1, y: 1 }
    ]
  );
});

test("buildGenerationBrief creates a staff-ready Japanese AI instruction", () => {
  const brief = buildGenerationBrief({
    projectType: "wooddeck",
    sceneNote: "掃き出し窓の前の庭",
    objectNote: "参考写真と同じ明るい木目",
    dimensions: "幅3.6m、奥行2.4m",
    material: "人工木",
    placementNote: "窓の高さに合わせる",
    hasSceneImage: true,
    hasReferenceImage: true,
    maskCount: 2
  });

  assert.match(brief, /ウッドデッキ/);
  assert.match(brief, /幅3\.6m、奥行2\.4m/);
  assert.match(brief, /参考写真/);
  assert.match(brief, /指定範囲2か所/);
  assert.match(brief, /実際の施工後写真/);
});

test("summarizeWorkspace returns compact state for backend handoff", () => {
  assert.deepEqual(
    summarizeWorkspace({
      projectType: "furniture",
      objectTransform: { x: 40.234, y: 20.4, width: 180.9, rotation: -12.45 },
      masks: [{ points: [{ x: 0, y: 0 }] }],
      hasSceneImage: true,
      hasReferenceImage: false
    }),
    {
      projectType: "furniture",
      placement: { x: 40.23, y: 20.4, width: 180.9, rotation: -12.45 },
      maskCount: 1,
      hasSceneImage: true,
      hasReferenceImage: false
    }
  );
});

test("Gemini API helper validates common image magic bytes", async () => {
  const api = await import("../api/ai-render.mjs");
  assert.equal(api.detectMime(Buffer.from([0xff, 0xd8, 0xff, 0x00])), "image/jpeg");
  assert.equal(api.detectMime(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x00, 0x00, 0x00])), "image/png");
  assert.equal(api.detectMime(Buffer.from("RIFF0000WEBP", "ascii")), "image/webp");
  assert.equal(api.detectMime(Buffer.from("not-an-image", "utf8")), "");
});

test("Gemini API helper extracts returned output_image data", async () => {
  const api = await import("../api/ai-render.mjs");
  assert.deepEqual(
    api.findOutputImage({
      output_image: {
        data: "abc123",
        mime_type: "image/jpeg"
      }
    }),
    {
      data: "abc123",
      mime_type: "image/jpeg"
    }
  );
});
