(function attachCore(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.TakumiAIStudioCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createCore() {
  const projectLabels = {
    wooddeck: "ウッドデッキ",
    furniture: "家具",
    storage: "収納・造作棚",
    exterior: "外構・庭",
    interior: "内装"
  };

  function round(value, digits) {
    const scale = 10 ** digits;
    return Math.round((Number(value) + Number.EPSILON) * scale) / scale;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(Number(value), min), max);
  }

  function fitImageInside(source, box) {
    if (!source?.width || !source?.height || !box?.width || !box?.height) {
      return { width: 0, height: 0, x: 0, y: 0, scale: 0 };
    }

    const scale = Math.min(box.width / source.width, box.height / source.height);
    const width = round(source.width * scale, 2);
    const height = round(source.height * scale, 2);

    return {
      width,
      height,
      x: round((box.width - width) / 2, 2),
      y: round((box.height - height) / 2, 2),
      scale: round(scale, 4)
    };
  }

  function normalizeStroke(points, frame) {
    if (!Array.isArray(points) || !frame?.width || !frame?.height) return [];

    return points.map((point) => ({
      x: round(clamp((point.x - frame.x) / frame.width, 0, 1), 4),
      y: round(clamp((point.y - frame.y) / frame.height, 0, 1), 4)
    }));
  }

  function buildGenerationBrief(input) {
    const projectLabel = projectLabels[input.projectType] || "施工対象";
    const scene = input.sceneNote?.trim() || "現場写真で指定した場所";
    const object = input.objectNote?.trim() || "参考画像の形、色、素材感";
    const dimensions = input.dimensions?.trim() || "現地寸法に合わせる";
    const material = input.material?.trim() || "周囲になじむ自然な仕上げ";
    const placement = input.placementNote?.trim() || "写真上で指定した位置と向きに合わせる";
    const maskText = input.maskCount > 0 ? `指定範囲${input.maskCount}か所` : "写真上の指定位置";
    const referenceText = input.hasReferenceImage
      ? "アップロードした参考写真を強く参照し、形状・色・素材感をできるだけ保つ。"
      : "周囲の住宅・庭・内装の質感に合わせて自然に補完する。";
    const sceneText = input.hasSceneImage
      ? "現場写真の光、遠近感、既存物、影の方向を維持する。"
      : "現場写真がない場合は、説明文をもとに自然な住宅提案画像として作成する。";

    return [
      `目的: ${projectLabel}の施工後イメージを作成する。`,
      `場所: ${scene}。${maskText}を中心に反映する。`,
      `対象: ${object}。`,
      `寸法: ${dimensions}。`,
      `素材・色: ${material}。`,
      `配置条件: ${placement}。`,
      referenceText,
      sceneText,
      "仕上げ: 実際の施工後写真に限りなく近い自然な画像。過度なCG感、歪んだ建具、不自然な影、現実に施工できない接合は避ける。"
    ].join("\n");
  }

  function summarizeWorkspace(input) {
    const transform = input.objectTransform || {};
    return {
      projectType: input.projectType || "wooddeck",
      placement: {
        x: round(transform.x || 0, 2),
        y: round(transform.y || 0, 2),
        width: round(transform.width || 0, 2),
        rotation: round(transform.rotation || 0, 2)
      },
      maskCount: Array.isArray(input.masks) ? input.masks.length : 0,
      hasSceneImage: Boolean(input.hasSceneImage),
      hasReferenceImage: Boolean(input.hasReferenceImage)
    };
  }

  return {
    clamp,
    fitImageInside,
    normalizeStroke,
    buildGenerationBrief,
    summarizeWorkspace
  };
});
