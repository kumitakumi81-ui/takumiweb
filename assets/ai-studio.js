(function initAIStudio() {
  const core = window.TakumiAIStudioCore;
  const MAX_IMAGE_MB = 14;

  const elements = {
    menuToggle: document.querySelector("[data-menu-toggle]"),
    sceneUpload: document.getElementById("sceneUpload"),
    referenceUpload: document.getElementById("referenceUpload"),
    sceneMeta: document.getElementById("sceneMeta"),
    referenceMeta: document.getElementById("referenceMeta"),
    projectType: document.getElementById("projectType"),
    material: document.getElementById("material"),
    dimensions: document.getElementById("dimensions"),
    sceneNote: document.getElementById("sceneNote"),
    objectNote: document.getElementById("objectNote"),
    placementNote: document.getElementById("placementNote"),
    aiEndpoint: document.getElementById("aiEndpoint"),
    workspace: document.getElementById("workspace"),
    workspaceEmpty: document.getElementById("workspaceEmpty"),
    canvas: document.getElementById("sceneCanvas"),
    objectLayer: document.getElementById("objectLayer"),
    referenceObject: document.getElementById("referenceObject"),
    objectScale: document.getElementById("objectScale"),
    objectRotation: document.getElementById("objectRotation"),
    clearMask: document.getElementById("clearMask"),
    centerObject: document.getElementById("centerObject"),
    generatePreview: document.getElementById("generatePreview"),
    generationBrief: document.getElementById("generationBrief"),
    copyBrief: document.getElementById("copyBrief"),
    resultFrame: document.getElementById("resultFrame"),
    resultImage: document.getElementById("resultImage"),
    resultEmpty: document.getElementById("resultEmpty"),
    downloadOutput: document.getElementById("downloadOutput"),
    exportJson: document.getElementById("exportJson"),
    status: document.getElementById("studioStatus")
  };

  const state = {
    tool: "mask",
    sceneFile: null,
    referenceFile: null,
    sceneImage: null,
    referenceImage: null,
    canvasSize: { width: 0, height: 0 },
    masks: [],
    activeStroke: [],
    drawing: false,
    objectDragging: false,
    objectTransform: { x: 50, y: 58, width: 190, rotation: 0 },
    dragStart: null,
    lastResultUrl: ""
  };

  function setStatus(message) {
    elements.status.textContent = message;
  }

  function fileLabel(file) {
    const mb = file.size / 1024 / 1024;
    return `${file.name} / ${mb.toFixed(1)}MB`;
  }

  function assertImageFile(file) {
    if (!file) throw new Error("画像ファイルを選択してください。");
    if (!file.type.startsWith("image/")) throw new Error("画像形式のファイルを選択してください。");
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      throw new Error(`${MAX_IMAGE_MB}MB以下の画像を選択してください。`);
    }
  }

  function loadImage(file) {
    assertImageFile(file);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("画像を読み込めませんでした。"));
      reader.onload = () => {
        image.src = reader.result;
      };
      reader.onerror = () => reject(new Error("画像を読み込めませんでした。"));
      reader.readAsDataURL(file);
    });
  }

  function canvasCssRect() {
    return {
      width: state.canvasSize.width,
      height: state.canvasSize.height
    };
  }

  function resizeSceneCanvas() {
    if (!state.sceneImage) return;

    const workspaceWidth = elements.workspace.clientWidth || 720;
    const targetHeight = window.matchMedia("(max-width: 820px)").matches
      ? Math.max(320, Math.min(window.innerHeight * 0.52, 560))
      : Math.max(420, Math.min(window.innerHeight * 0.66, 680));
    const fit = core.fitImageInside(
      { width: state.sceneImage.naturalWidth, height: state.sceneImage.naturalHeight },
      { width: workspaceWidth, height: targetHeight }
    );

    const dpr = window.devicePixelRatio || 1;
    state.canvasSize = { width: fit.width, height: fit.height };
    elements.canvas.style.width = `${fit.width}px`;
    elements.canvas.style.height = `${fit.height}px`;
    elements.canvas.width = Math.max(1, Math.round(fit.width * dpr));
    elements.canvas.height = Math.max(1, Math.round(fit.height * dpr));
    drawScene();
    positionObjectLayer();
  }

  function context2d(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function drawMaskStroke(ctx, stroke, color, width) {
    if (!stroke || stroke.length < 2) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    stroke.forEach((point, index) => {
      const x = point.x * state.canvasSize.width;
      const y = point.y * state.canvasSize.height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawScene() {
    const { width, height } = canvasCssRect();
    const ctx = context2d(elements.canvas);
    ctx.clearRect(0, 0, width, height);

    if (state.sceneImage) {
      ctx.drawImage(state.sceneImage, 0, 0, width, height);
    }

    state.masks.forEach((stroke) => {
      drawMaskStroke(ctx, stroke, "rgba(201, 68, 45, 0.42)", Math.max(20, width * 0.035));
      drawMaskStroke(ctx, stroke, "rgba(158, 216, 208, 0.84)", Math.max(2, width * 0.004));
    });

    if (state.activeStroke.length > 1) {
      const preview = core.normalizeStroke(state.activeStroke, { x: 0, y: 0, width, height });
      drawMaskStroke(ctx, preview, "rgba(201, 68, 45, 0.56)", Math.max(22, width * 0.038));
    }
  }

  function canvasPoint(event) {
    const rect = elements.canvas.getBoundingClientRect();
    return {
      x: core.clamp(event.clientX - rect.left, 0, rect.width),
      y: core.clamp(event.clientY - rect.top, 0, rect.height)
    };
  }

  function setTool(tool) {
    state.tool = tool;
    document.querySelectorAll("[data-tool]").forEach((button) => {
      button.classList.toggle("active", button.dataset.tool === tool);
    });
    elements.canvas.style.cursor = tool === "mask" ? "crosshair" : "default";
  }

  function updateBrief() {
    const brief = currentBrief();
    elements.generationBrief.textContent = brief;
  }

  function restoreEndpoint() {
    try {
      const stored = window.localStorage.getItem("takumiAiEndpoint");
      if (stored) {
        elements.aiEndpoint.value = stored;
        return;
      }
      const isLocal = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
      if (!isLocal) elements.aiEndpoint.value = "/api/ai-render";
    } catch (error) {
    }
  }

  function rememberEndpoint() {
    try {
      const value = elements.aiEndpoint.value.trim();
      if (value) window.localStorage.setItem("takumiAiEndpoint", value);
      else window.localStorage.removeItem("takumiAiEndpoint");
    } catch (error) {
    }
  }

  function currentBrief() {
    return core.buildGenerationBrief({
      projectType: elements.projectType.value,
      sceneNote: elements.sceneNote.value,
      objectNote: elements.objectNote.value,
      dimensions: elements.dimensions.value,
      material: elements.material.value,
      placementNote: elements.placementNote.value,
      hasSceneImage: Boolean(state.sceneImage),
      hasReferenceImage: Boolean(state.referenceImage),
      maskCount: state.masks.length
    });
  }

  function workspaceSummary() {
    return core.summarizeWorkspace({
      projectType: elements.projectType.value,
      objectTransform: state.objectTransform,
      masks: state.masks,
      hasSceneImage: Boolean(state.sceneImage),
      hasReferenceImage: Boolean(state.referenceImage)
    });
  }

  function positionObjectLayer() {
    if (!state.referenceImage || !state.sceneImage || !state.canvasSize.width) {
      elements.objectLayer.hidden = true;
      return;
    }

    const canvasRect = elements.canvas.getBoundingClientRect();
    const workspaceRect = elements.workspace.getBoundingClientRect();
    const ratio = state.referenceImage.naturalHeight / state.referenceImage.naturalWidth || 0.7;
    const objectWidth = core.clamp(state.objectTransform.width, 70, Math.max(80, state.canvasSize.width * 0.82));
    const objectHeight = objectWidth * ratio;
    const left = canvasRect.left - workspaceRect.left + (state.objectTransform.x / 100) * canvasRect.width - objectWidth / 2;
    const top = canvasRect.top - workspaceRect.top + (state.objectTransform.y / 100) * canvasRect.height - objectHeight / 2;

    elements.objectLayer.hidden = false;
    elements.objectLayer.style.width = `${objectWidth}px`;
    elements.objectLayer.style.height = `${objectHeight}px`;
    elements.objectLayer.style.left = `${left}px`;
    elements.objectLayer.style.top = `${top}px`;
    elements.objectLayer.style.transform = `rotate(${state.objectTransform.rotation}deg)`;
  }

  async function handleSceneUpload(event) {
    const file = event.target.files?.[0];
    try {
      const image = await loadImage(file);
      state.sceneFile = file;
      state.sceneImage = image;
      state.masks = [];
      state.activeStroke = [];
      elements.sceneMeta.textContent = fileLabel(file);
      elements.workspaceEmpty.hidden = true;
      resizeSceneCanvas();
      updateBrief();
      setStatus("現場写真を読み込みました");
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function handleReferenceUpload(event) {
    const file = event.target.files?.[0];
    try {
      const image = await loadImage(file);
      state.referenceFile = file;
      state.referenceImage = image;
      elements.referenceObject.src = image.src;
      elements.referenceMeta.textContent = fileLabel(file);
      positionObjectLayer();
      updateBrief();
      setTool("object");
      setStatus("参考写真を読み込みました");
    } catch (error) {
      setStatus(error.message);
    }
  }

  function startStroke(event) {
    if (state.tool !== "mask" || !state.sceneImage) return;
    event.preventDefault();
    elements.canvas.setPointerCapture(event.pointerId);
    state.drawing = true;
    state.activeStroke = [canvasPoint(event)];
    drawScene();
  }

  function moveStroke(event) {
    if (!state.drawing) return;
    event.preventDefault();
    const next = canvasPoint(event);
    const previous = state.activeStroke[state.activeStroke.length - 1];
    const distance = Math.hypot(next.x - previous.x, next.y - previous.y);
    if (distance > 5) {
      state.activeStroke.push(next);
      drawScene();
    }
  }

  function endStroke(event) {
    if (!state.drawing) return;
    event.preventDefault();
    state.drawing = false;
    const normalized = core.normalizeStroke(state.activeStroke, {
      x: 0,
      y: 0,
      width: state.canvasSize.width,
      height: state.canvasSize.height
    });
    if (normalized.length > 1) {
      state.masks = state.masks.concat([normalized]);
    }
    state.activeStroke = [];
    drawScene();
    updateBrief();
    setStatus(`指定範囲 ${state.masks.length}か所`);
  }

  function startObjectDrag(event) {
    if (!state.referenceImage || !state.sceneImage) return;
    event.preventDefault();
    setTool("object");
    elements.objectLayer.setPointerCapture(event.pointerId);
    state.objectDragging = true;
    state.dragStart = {
      clientX: event.clientX,
      clientY: event.clientY,
      x: state.objectTransform.x,
      y: state.objectTransform.y
    };
  }

  function moveObjectDrag(event) {
    if (!state.objectDragging || !state.dragStart) return;
    event.preventDefault();
    const rect = elements.canvas.getBoundingClientRect();
    const deltaX = ((event.clientX - state.dragStart.clientX) / rect.width) * 100;
    const deltaY = ((event.clientY - state.dragStart.clientY) / rect.height) * 100;
    state.objectTransform.x = core.clamp(state.dragStart.x + deltaX, 0, 100);
    state.objectTransform.y = core.clamp(state.dragStart.y + deltaY, 0, 100);
    positionObjectLayer();
  }

  function endObjectDrag(event) {
    if (!state.objectDragging) return;
    event.preventDefault();
    state.objectDragging = false;
    state.dragStart = null;
    updateBrief();
    setStatus("配置を更新しました");
  }

  function setObjectScale(value) {
    state.objectTransform.width = Number(value);
    positionObjectLayer();
  }

  function setObjectRotation(value) {
    state.objectTransform.rotation = Number(value);
    positionObjectLayer();
  }

  function clearMasks() {
    state.masks = [];
    state.activeStroke = [];
    drawScene();
    updateBrief();
    setStatus("範囲をクリアしました");
  }

  function centerObject() {
    state.objectTransform.x = 50;
    state.objectTransform.y = 58;
    positionObjectLayer();
    updateBrief();
    setStatus("参考画像を中央に配置しました");
  }

  function drawOutputMask(ctx, stroke, width, height) {
    if (!stroke || stroke.length < 2) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(201, 68, 45, 0.22)";
    ctx.lineWidth = Math.max(28, width * 0.03);
    ctx.beginPath();
    stroke.forEach((point, index) => {
      const x = point.x * width;
      const y = point.y * height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  }

  async function renderLocalPreview() {
    if (!state.sceneImage) {
      setStatus("現場写真を選択してください");
      return null;
    }

    const maxWidth = 1600;
    const scale = Math.min(1, maxWidth / state.sceneImage.naturalWidth);
    const width = Math.round(state.sceneImage.naturalWidth * scale);
    const height = Math.round(state.sceneImage.naturalHeight * scale);
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = width;
    outputCanvas.height = height;
    const ctx = outputCanvas.getContext("2d");

    ctx.drawImage(state.sceneImage, 0, 0, width, height);
    state.masks.forEach((stroke) => drawOutputMask(ctx, stroke, width, height));

    if (state.referenceImage && state.canvasSize.width) {
      const ratio = state.referenceImage.naturalHeight / state.referenceImage.naturalWidth || 0.7;
      const objectWidth = (state.objectTransform.width / state.canvasSize.width) * width;
      const objectHeight = objectWidth * ratio;
      const x = (state.objectTransform.x / 100) * width;
      const y = (state.objectTransform.y / 100) * height;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((state.objectTransform.rotation * Math.PI) / 180);
      ctx.shadowColor = "rgba(0, 0, 0, 0.34)";
      ctx.shadowBlur = Math.max(12, width * 0.018);
      ctx.shadowOffsetY = Math.max(10, width * 0.014);
      ctx.drawImage(state.referenceImage, -objectWidth / 2, -objectHeight / 2, objectWidth, objectHeight);
      ctx.restore();
    }

    const blob = await canvasToBlob(outputCanvas);
    return URL.createObjectURL(blob);
  }

  async function requestRemoteRender(endpoint) {
    const formData = new FormData();
    formData.append("brief", currentBrief());
    formData.append("workspace", JSON.stringify({
      ...workspaceSummary(),
      masks: state.masks,
      note: {
        scene: elements.sceneNote.value,
        object: elements.objectNote.value,
        dimensions: elements.dimensions.value,
        material: elements.material.value,
        placement: elements.placementNote.value
      }
    }));
    if (state.sceneFile) formData.append("scene", state.sceneFile);
    if (state.referenceFile) formData.append("reference", state.referenceFile);

    const response = await fetch(endpoint, { method: "POST", body: formData });
    if (!response.ok) {
      let detail = "";
      try {
        const errPayload = await response.clone().json();
        detail = errPayload.detail || errPayload.error || "";
      } catch {
        try { detail = (await response.clone().text()).slice(0, 300); } catch {}
      }
      throw new Error(`AI生成に失敗しました: ${response.status}${detail ? " / " + detail : ""}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.startsWith("image/")) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }

    const payload = await response.json();
    if (payload.imageUrl) return payload.imageUrl;
    if (payload.imageBase64) return `data:${payload.mimeType || "image/png"};base64,${payload.imageBase64}`;
    throw new Error("AI生成結果の画像URLが見つかりません。");
  }

  function showResult(url) {
    if (state.lastResultUrl.startsWith("blob:")) URL.revokeObjectURL(state.lastResultUrl);
    state.lastResultUrl = url;
    elements.resultImage.src = url;
    elements.resultImage.hidden = false;
    elements.resultEmpty.hidden = true;
    elements.downloadOutput.disabled = false;
  }

  async function generate() {
    try {
      elements.generatePreview.disabled = true;
      setStatus("生成中");
      const endpoint = elements.aiEndpoint.value.trim();
      const url = endpoint ? await requestRemoteRender(endpoint) : await renderLocalPreview();
      if (url) {
        showResult(url);
        setStatus(endpoint ? "AI生成が完了しました" : "プレビューを作成しました");
      }
    } catch (error) {
      setStatus(error.message);
    } finally {
      elements.generatePreview.disabled = false;
    }
  }

  function downloadResult() {
    if (!state.lastResultUrl) return;
    const link = document.createElement("a");
    link.href = state.lastResultUrl;
    link.download = `takumi-ai-preview-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function downloadJson() {
    const payload = {
      brief: currentBrief(),
      workspace: {
        ...workspaceSummary(),
        masks: state.masks
      }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `takumi-ai-handoff-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function copyBrief() {
    const brief = currentBrief();
    try {
      await navigator.clipboard.writeText(brief);
      setStatus("生成指示をコピーしました");
    } catch (error) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(elements.generationBrief);
      selection.removeAllRanges();
      selection.addRange(range);
      setStatus("生成指示を選択しました");
    }
  }

  function bindEvents() {
    elements.menuToggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("menu-open");
      elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelectorAll("[data-tool]").forEach((button) => {
      button.addEventListener("click", () => setTool(button.dataset.tool));
    });

    elements.sceneUpload.addEventListener("change", handleSceneUpload);
    elements.referenceUpload.addEventListener("change", handleReferenceUpload);
    elements.canvas.addEventListener("pointerdown", startStroke);
    elements.canvas.addEventListener("pointermove", moveStroke);
    elements.canvas.addEventListener("pointerup", endStroke);
    elements.canvas.addEventListener("pointercancel", endStroke);
    elements.objectLayer.addEventListener("pointerdown", startObjectDrag);
    elements.objectLayer.addEventListener("pointermove", moveObjectDrag);
    elements.objectLayer.addEventListener("pointerup", endObjectDrag);
    elements.objectLayer.addEventListener("pointercancel", endObjectDrag);
    elements.objectScale.addEventListener("input", (event) => setObjectScale(event.target.value));
    elements.objectRotation.addEventListener("input", (event) => setObjectRotation(event.target.value));
    elements.clearMask.addEventListener("click", clearMasks);
    elements.centerObject.addEventListener("click", centerObject);
    elements.generatePreview.addEventListener("click", generate);
    elements.downloadOutput.addEventListener("click", downloadResult);
    elements.exportJson.addEventListener("click", downloadJson);
    elements.copyBrief.addEventListener("click", copyBrief);
    elements.aiEndpoint.addEventListener("input", rememberEndpoint);
    elements.projectType.addEventListener("change", updateBrief);

    [
      elements.material,
      elements.dimensions,
      elements.sceneNote,
      elements.objectNote,
      elements.placementNote
    ].forEach((input) => input.addEventListener("input", updateBrief));

    window.addEventListener("resize", () => {
      resizeSceneCanvas();
      positionObjectLayer();
    });
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./staff-ai-sw.js").catch(() => {});
    });
  }

  bindEvents();
  restoreEndpoint();
  updateBrief();
  registerServiceWorker();
})();
