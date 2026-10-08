/**
 * imgv - High-Performance Image Viewer Client Application
 * Optimized for massive directories (tens of thousands of images) with Virtual Scrolling
 */

// Application State
const state = {
  rootDir: "",
  images: [],
  filteredImages: [],
  currentIndex: -1,
  activeFilter: "all", // "all", "animated", "static"
  activeFormatFilter: null,
  searchQuery: "",
  sortBy: "name_asc",
  recursive: true,
  viewMode: "split", // "split", "grid"

  // Viewport / Zoom & Pan State
  scale: 1,
  fitScale: 1,
  panX: 0,
  panY: 0,
  rotation: 0,
  flipH: false,
  isPanning: false,
  startX: 0,
  startY: 0,
  isPaused: false,

  // Grid chunking
  gridLoadedCount: 120,
};

// Virtual scrolling constants
const VIRTUAL_ITEM_HEIGHT = 66; // 60px card + 6px gap
let virtualSpacer = null;
let virtualContainer = null;
let isUpdatingVirtual = false;
let searchDebounceTimer = null;

// DOM Elements Cache
const DOM = {
  appBody: document.getElementById("appBody"),
  currentFolderPath: document.getElementById("currentFolderPath"),
  headerAnimatedCount: document.getElementById("headerAnimatedCount"),
  folderBreadcrumb: document.getElementById("folderBreadcrumb"),
  btnChangeFolder: document.getElementById("btnChangeFolder"),
  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  filterPills: document.getElementById("filterPills"),
  countAll: document.getElementById("countAll"),
  countAnim: document.getElementById("countAnim"),
  countStatic: document.getElementById("countStatic"),
  recursiveCheckbox: document.getElementById("recursiveCheckbox"),
  sortSelect: document.getElementById("sortSelect"),
  btnViewSplit: document.getElementById("btnViewSplit"),
  btnViewGrid: document.getElementById("btnViewGrid"),
  btnHelp: document.getElementById("btnHelp"),

  sidebar: document.getElementById("sidebar"),
  filteredStats: document.getElementById("filteredStats"),
  formatChips: document.getElementById("formatChips"),
  thumbnailList: document.getElementById("thumbnailList"),

  previewStage: document.getElementById("previewStage"),
  stageTopBar: document.getElementById("stageTopBar"),
  previewImageName: document.getElementById("previewImageName"),
  previewFormatBadge: document.getElementById("previewFormatBadge"),
  previewAnimBadge: document.getElementById("previewAnimBadge"),
  previewDimensions: document.getElementById("previewDimensions"),
  previewFileSize: document.getElementById("previewFileSize"),
  previewIndex: document.getElementById("previewIndex"),

  viewport: document.getElementById("viewport"),
  emptyPlaceholder: document.getElementById("emptyPlaceholder"),
  canvasContainer: document.getElementById("canvasContainer"),
  previewImg: document.getElementById("previewImg"),
  freezeCanvas: document.getElementById("freezeCanvas"),
  btnPrev: document.getElementById("btnPrev"),
  btnNext: document.getElementById("btnNext"),

  floatingToolbar: document.getElementById("floatingToolbar"),
  btnPlayPause: document.getElementById("btnPlayPause"),
  playPauseIcon: document.getElementById("playPauseIcon"),
  playPauseLabel: document.getElementById("playPauseLabel"),
  btnZoomIn: document.getElementById("btnZoomIn"),
  btnZoomOut: document.getElementById("btnZoomOut"),
  btnZoomFit: document.getElementById("btnZoomFit"),
  btnZoom100: document.getElementById("btnZoom100"),
  btnRotate: document.getElementById("btnRotate"),
  btnFullscreen: document.getElementById("btnFullscreen"),
  btnCopyPath: document.getElementById("btnCopyPath"),
  btnOpenSystem: document.getElementById("btnOpenSystem"),
  btnDelete: document.getElementById("btnDelete"),

  filmstripContainer: document.getElementById("filmstripContainer"),
  filmstripTrack: document.getElementById("filmstripTrack"),

  folderModal: document.getElementById("folderModal"),
  newFolderPath: document.getElementById("newFolderPath"),
  btnCloseFolderModal: document.getElementById("btnCloseFolderModal"),
  btnCancelFolderModal: document.getElementById("btnCancelFolderModal"),
  btnSubmitFolder: document.getElementById("btnSubmitFolder"),

  helpModal: document.getElementById("helpModal"),
  btnCloseHelpModal: document.getElementById("btnCloseHelpModal"),
  btnCloseHelpBtn: document.getElementById("btnCloseHelpBtn"),

  // Context Menu
  contextMenu: document.getElementById("contextMenu"),
  ctxOpenFolder: document.getElementById("ctxOpenFolder"),
  ctxOpenDefault: document.getElementById("ctxOpenDefault"),
  ctxCopyImage: document.getElementById("ctxCopyImage"),
  ctxCopyPath: document.getElementById("ctxCopyPath"),
  ctxPlayPause: document.getElementById("ctxPlayPause"),
  ctxPlayPauseIcon: document.getElementById("ctxPlayPauseIcon"),
  ctxPlayPauseLabel: document.getElementById("ctxPlayPauseLabel"),
  ctxRotate: document.getElementById("ctxRotate"),
  ctxFlipH: document.getElementById("ctxFlipH"),
  ctxFitScreen: document.getElementById("ctxFitScreen"),
  ctxActualSize: document.getElementById("ctxActualSize"),
  ctxFullscreen: document.getElementById("ctxFullscreen"),
  ctxProperties: document.getElementById("ctxProperties"),
  ctxDelete: document.getElementById("ctxDelete"),

  // Properties Modal
  propsModal: document.getElementById("propsModal"),
  propsBody: document.getElementById("propsBody"),
  btnClosePropsModal: document.getElementById("btnClosePropsModal"),
  btnClosePropsBtn: document.getElementById("btnClosePropsBtn"),

  toast: document.getElementById("toast"),
};

// Utilities
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function showToast(message, duration = 2200) {
  DOM.toast.textContent = message;
  DOM.toast.classList.add("show");
  setTimeout(() => {
    DOM.toast.classList.remove("show");
  }, duration);
}

// Fetch images from backend API
async function loadImages(folder = "", recursive = state.recursive) {
  try {
    let url = `/api/images?recursive=${recursive}`;
    if (folder) {
      url += `&folder=${encodeURIComponent(folder)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load images");
    const data = await res.json();

    state.rootDir = data.root_dir;
    state.images = data.items || [];
    state.recursive = recursive;

    // Update UI Header
    DOM.currentFolderPath.textContent = data.root_dir;
    DOM.currentFolderPath.title = data.root_dir;
    DOM.headerAnimatedCount.textContent = `${data.animated_count} anim`;
    DOM.countAll.textContent = data.total_images;
    DOM.countAnim.textContent = data.animated_count;
    DOM.countStatic.textContent = data.static_count;
    DOM.recursiveCheckbox.checked = recursive;

    renderFormatChips(data.formats || []);
    applyFiltersAndSort();

    // Select first image if available
    if (state.filteredImages.length > 0) {
      selectImage(0);
    } else {
      selectImage(-1);
    }
  } catch (err) {
    showToast("Error loading folder: " + err.message);
  }
}

// Render format filter chips
function renderFormatChips(formats) {
  DOM.formatChips.innerHTML = "";
  formats.sort().forEach((fmt) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = fmt;
    chip.dataset.format = fmt;
    chip.addEventListener("click", () => {
      if (state.activeFormatFilter === fmt) {
        state.activeFormatFilter = null;
        chip.classList.remove("active");
      } else {
        document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        state.activeFormatFilter = fmt;
        chip.classList.add("active");
      }
      applyFiltersAndSort();
    });
    DOM.formatChips.appendChild(chip);
  });
}

// Filter and Sort Pipeline
function applyFiltersAndSort() {
  let list = state.images;

  // 1. Filter by Animation State
  if (state.activeFilter === "animated") {
    list = list.filter((img) => img.is_animated);
  } else if (state.activeFilter === "static") {
    list = list.filter((img) => !img.is_animated);
  }

  // 2. Filter by Format Chip
  if (state.activeFormatFilter) {
    const fmt = state.activeFormatFilter.toLowerCase();
    list = list.filter((img) => img.format.toLowerCase() === fmt);
  }

  // 3. Filter by Search Query
  if (state.searchQuery.trim() !== "") {
    const q = state.searchQuery.toLowerCase();
    list = list.filter((img) => img.name.toLowerCase().includes(q) || img.rel_path.toLowerCase().includes(q));
  }

  // 4. Sort (shallow clone before sorting)
  list = [...list];
  switch (state.sortBy) {
    case "name_asc":
      list.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      break;
    case "name_desc":
      list.sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true }));
      break;
    case "date_desc":
      list.sort((a, b) => new Date(b.mod_time) - new Date(a.mod_time));
      break;
    case "date_asc":
      list.sort((a, b) => new Date(a.mod_time) - new Date(b.mod_time));
      break;
    case "size_desc":
      list.sort((a, b) => b.size - a.size);
      break;
    case "size_asc":
      list.sort((a, b) => a.size - b.size);
      break;
  }

  state.filteredImages = list;
  state.gridLoadedCount = 120; // reset grid chunk
  DOM.filteredStats.textContent = `${list.length.toLocaleString()} of ${state.images.length.toLocaleString()} images`;

  initVirtualList();
  renderFilmstrip();

  if (state.viewMode === "grid") {
    renderGridGallery();
  }

  // Re-adjust current selected index
  if (list.length > 0) {
    if (state.currentIndex < 0 || state.currentIndex >= list.length) {
      selectImage(0);
    } else {
      selectImage(state.currentIndex);
    }
  } else {
    selectImage(-1);
  }
}

// Initialize Virtual Scrolling Containers
function initVirtualList() {
  DOM.thumbnailList.innerHTML = "";

  virtualSpacer = document.createElement("div");
  virtualSpacer.className = "virtual-spacer";
  virtualSpacer.style.height = `${state.filteredImages.length * VIRTUAL_ITEM_HEIGHT}px`;

  virtualContainer = document.createElement("div");
  virtualContainer.className = "virtual-items-container";

  DOM.thumbnailList.appendChild(virtualSpacer);
  DOM.thumbnailList.appendChild(virtualContainer);

  updateVirtualList();
}

// Update visible items inside Virtual Scrolling Window
function updateVirtualList() {
  if (!virtualContainer || !virtualSpacer) return;

  const total = state.filteredImages.length;
  virtualSpacer.style.height = `${total * VIRTUAL_ITEM_HEIGHT}px`;

  if (total === 0) {
    virtualContainer.innerHTML = "";
    return;
  }

  const scrollTop = DOM.thumbnailList.scrollTop;
  const viewportHeight = DOM.thumbnailList.clientHeight || 600;

  // Buffer of 6 items above and below
  const startIndex = Math.max(0, Math.floor(scrollTop / VIRTUAL_ITEM_HEIGHT) - 6);
  const endIndex = Math.min(total - 1, Math.ceil((scrollTop + viewportHeight) / VIRTUAL_ITEM_HEIGHT) + 6);

  virtualContainer.style.transform = `translateY(${startIndex * VIRTUAL_ITEM_HEIGHT}px)`;

  // Render only visible slice
  let fragment = document.createDocumentFragment();

  for (let i = startIndex; i <= endIndex; i++) {
    const img = state.filteredImages[i];
    const isSelected = i === state.currentIndex;

    const card = document.createElement("div");
    card.className = `thumb-card ${img.is_animated ? "anim-card" : ""} ${isSelected ? "active" : ""}`;
    card.dataset.index = i;

    const fileUrl = `/api/file?path=${encodeURIComponent(img.path)}`;

    card.innerHTML = `
      <div class="thumb-preview-wrapper">
        <img src="${fileUrl}" loading="lazy" alt="${img.name}" />
        ${img.is_animated ? '<span class="thumb-anim-badge">ANIM</span>' : ""}
      </div>
      <div class="thumb-info">
        <div class="thumb-name" title="${img.name}">${img.name}</div>
        <div class="thumb-meta">
          <span class="format-tag">${img.format}</span>
          <span>${img.width && img.height ? `${img.width}×${img.height}` : ""}</span>
          <span>${formatBytes(img.size)}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      selectImage(i);
    });

    fragment.appendChild(card);
  }

  virtualContainer.innerHTML = "";
  virtualContainer.appendChild(fragment);
}

// Throttled Scroll Listener for Virtual List
function onVirtualScroll() {
  if (isUpdatingVirtual) return;
  isUpdatingVirtual = true;
  requestAnimationFrame(() => {
    updateVirtualList();
    isUpdatingVirtual = false;
  });
}

// Render Windowed Bottom Filmstrip (Renders at most 25 items around current selection)
function renderFilmstrip() {
  DOM.filmstripTrack.innerHTML = "";
  const total = state.filteredImages.length;
  if (total === 0) return;

  const current = Math.max(0, state.currentIndex);
  const windowRadius = 14;
  const start = Math.max(0, current - windowRadius);
  const end = Math.min(total - 1, current + windowRadius);

  const fragment = document.createDocumentFragment();

  for (let i = start; i <= end; i++) {
    const img = state.filteredImages[i];
    const thumb = document.createElement("div");
    thumb.className = `filmstrip-thumb ${img.is_animated ? "anim-thumb" : ""} ${i === current ? "active" : ""}`;
    thumb.dataset.index = i;
    thumb.title = `${img.name} (${i + 1}/${total})`;

    const fileUrl = `/api/file?path=${encodeURIComponent(img.path)}`;
    thumb.innerHTML = `<img src="${fileUrl}" loading="lazy" alt="${img.name}" />`;

    thumb.addEventListener("click", () => {
      selectImage(i);
    });

    fragment.appendChild(thumb);
  }

  DOM.filmstripTrack.appendChild(fragment);

  // Scroll active thumb to center smoothly
  const activeThumb = DOM.filmstripTrack.querySelector(`[data-index="${current}"]`);
  if (activeThumb) {
    activeThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}

// Select and Display Active Image
function selectImage(index) {
  state.currentIndex = index;

  if (index < 0 || index >= state.filteredImages.length) {
    // Empty view
    DOM.emptyPlaceholder.style.display = "flex";
    DOM.canvasContainer.style.display = "none";
    DOM.stageTopBar.style.visibility = "hidden";
    DOM.floatingToolbar.style.visibility = "hidden";
    DOM.btnPrev.style.display = "none";
    DOM.btnNext.style.display = "none";
    return;
  }

  const img = state.filteredImages[index];

  DOM.emptyPlaceholder.style.display = "none";
  DOM.canvasContainer.style.display = "flex";
  DOM.stageTopBar.style.visibility = "visible";
  DOM.floatingToolbar.style.visibility = "visible";
  DOM.btnPrev.style.display = "flex";
  DOM.btnNext.style.display = "flex";

  // Update Top Bar Info
  DOM.previewImageName.textContent = img.name;
  DOM.previewImageName.title = img.path;
  DOM.previewFormatBadge.textContent = img.format;
  DOM.previewAnimBadge.style.display = img.is_animated ? "inline-block" : "none";
  DOM.previewDimensions.textContent = img.width && img.height ? `${img.width} × ${img.height} px` : "Dynamic";
  DOM.previewFileSize.textContent = formatBytes(img.size);
  DOM.previewIndex.textContent = `${(index + 1).toLocaleString()} / ${state.filteredImages.length.toLocaleString()}`;

  // Reset Pause state
  state.isPaused = false;
  DOM.freezeCanvas.style.display = "none";
  DOM.previewImg.style.display = "block";
  DOM.playPauseIcon.textContent = "⏸️";
  DOM.playPauseLabel.textContent = "Pause";
  DOM.btnPlayPause.style.display = img.is_animated ? "flex" : "none";

  // Set Image Source
  const fileUrl = `/api/file?path=${encodeURIComponent(img.path)}`;
  DOM.previewImg.src = fileUrl;

  DOM.previewImg.onload = () => {
    resetTransform();
    fitToViewport();
  };

  // Scroll virtual list to keep active card in view
  const targetTop = index * VIRTUAL_ITEM_HEIGHT;
  const currentScroll = DOM.thumbnailList.scrollTop;
  const clientHeight = DOM.thumbnailList.clientHeight;

  if (targetTop < currentScroll) {
    DOM.thumbnailList.scrollTop = targetTop;
  } else if (targetTop + VIRTUAL_ITEM_HEIGHT > currentScroll + clientHeight) {
    DOM.thumbnailList.scrollTop = targetTop + VIRTUAL_ITEM_HEIGHT - clientHeight;
  }

  updateVirtualList();
  renderFilmstrip();

  // If in grid view, highlight active card
  const gridContainer = document.getElementById("gridGalleryContainer");
  if (gridContainer) {
    gridContainer.querySelectorAll(".grid-card").forEach((c) => c.classList.remove("active"));
    const activeCard = gridContainer.querySelector(`[data-index="${index}"]`);
    if (activeCard) {
      activeCard.classList.add("active");
    }
  }
}

// Animation Freeze / Playback Toggle
function togglePlayPause() {
  const current = state.filteredImages[state.currentIndex];
  if (!current || !current.is_animated) return;

  if (!state.isPaused) {
    // Freeze frame by drawing onto canvas
    const img = DOM.previewImg;
    const canvas = DOM.freezeCanvas;
    canvas.width = img.naturalWidth || img.clientWidth || 300;
    canvas.height = img.naturalHeight || img.clientHeight || 300;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    img.style.display = "none";
    canvas.style.display = "block";
    state.isPaused = true;
    DOM.playPauseIcon.textContent = "▶️";
    DOM.playPauseLabel.textContent = "Play";
    showToast("Animation Paused");
  } else {
    // Resume animation
    DOM.freezeCanvas.style.display = "none";
    DOM.previewImg.style.display = "block";
    state.isPaused = false;
    DOM.playPauseIcon.textContent = "⏸️";
    DOM.playPauseLabel.textContent = "Pause";
    showToast("Animation Playing");
  }
}

// Next / Previous Navigation
function navigateNext() {
  if (state.filteredImages.length === 0) return;
  const next = (state.currentIndex + 1) % state.filteredImages.length;
  selectImage(next);
}

function navigatePrev() {
  if (state.filteredImages.length === 0) return;
  const prev = (state.currentIndex - 1 + state.filteredImages.length) % state.filteredImages.length;
  selectImage(prev);
}

// Transform / Zoom & Pan Logic
function resetTransform() {
  state.scale = 1;
  state.panX = 0;
  state.panY = 0;
  state.rotation = 0;
  state.flipH = false;
  applyTransform();
}

function applyTransform() {
  const flip = state.flipH ? "scaleX(-1)" : "";
  DOM.canvasContainer.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale}) rotate(${state.rotation}deg) ${flip}`;
}

function fitToViewport() {
  const vpRect = DOM.viewport.getBoundingClientRect();
  const imgW = DOM.previewImg.naturalWidth || 600;
  const imgH = DOM.previewImg.naturalHeight || 400;

  if (imgW === 0 || imgH === 0) return;

  const pad = 40;
  const availW = vpRect.width - pad;
  const availH = vpRect.height - pad;

  const scaleW = availW / imgW;
  const scaleH = availH / imgH;
  const fit = Math.min(scaleW, scaleH, 1);

  state.scale = fit;
  state.fitScale = fit;
  state.panX = 0;
  state.panY = 0;
  applyTransform();
}

function setZoom100() {
  state.scale = 1;
  state.panX = 0;
  state.panY = 0;
  applyTransform();
  showToast("Actual Size (100%)");
}

function zoom(deltaFactor, clientX, clientY) {
  const oldScale = state.scale;
  let newScale = oldScale * deltaFactor;
  newScale = Math.max(0.05, Math.min(25, newScale));

  if (clientX !== undefined && clientY !== undefined) {
    const vpRect = DOM.viewport.getBoundingClientRect();
    const cx = clientX - vpRect.left - vpRect.width / 2;
    const cy = clientY - vpRect.top - vpRect.height / 2;

    state.panX = cx - (cx - state.panX) * (newScale / oldScale);
    state.panY = cy - (cy - state.panY) * (newScale / oldScale);
  }

  state.scale = newScale;
  applyTransform();
}

function rotateImage() {
  state.rotation = (state.rotation + 90) % 360;
  applyTransform();
}

// Fullscreen Toggle
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    DOM.appBody.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// Copy File Path
function copyCurrentPath() {
  const current = state.filteredImages[state.currentIndex];
  if (!current) return;
  navigator.clipboard.writeText(current.path).then(() => {
    showToast(`Copied path: ${current.name}`);
  });
}

// Open in OS File Manager
async function openInSystem() {
  const current = state.filteredImages[state.currentIndex];
  if (!current) return;
  try {
    const res = await fetch("/api/open-system", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: current.path }),
    });
    if (res.ok) {
      showToast("Opened file location in File Manager");
    }
  } catch (err) {
    showToast("Failed to open file manager");
  }
}

// Delete Image
async function deleteCurrentImage() {
  const current = state.filteredImages[state.currentIndex];
  if (!current) return;

  if (!confirm(`Are you sure you want to delete "${current.name}"?`)) {
    return;
  }

  try {
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: current.path }),
    });
    if (res.ok) {
      showToast(`Deleted ${current.name}`);
      state.images = state.images.filter((img) => img.path !== current.path);
      applyFiltersAndSort();
    } else {
      showToast("Could not delete file");
    }
  } catch (err) {
    showToast("Error deleting file: " + err.message);
  }
}

// Open with default associated application in OS
async function openWithDefaultApp() {
  const current = state.filteredImages[state.currentIndex];
  if (!current) return;
  try {
    const res = await fetch("/api/open-default", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: current.path }),
    });
    if (res.ok) {
      showToast("Opened in default system viewer");
    } else {
      showToast("Could not open in default viewer");
    }
  } catch (err) {
    showToast("Failed to open default app");
  }
}

// Copy actual image to system clipboard
async function copyImageToClipboard() {
  const current = state.filteredImages[state.currentIndex];
  if (!current) return;
  showToast("Copying image to clipboard...");
  try {
    const fileUrl = `/api/file?path=${encodeURIComponent(current.path)}`;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 400;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast("Failed to convert image for clipboard");
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          showToast("Image copied to clipboard! 📋");
        } catch (err) {
          showToast("Clipboard write permission error: " + err.message);
        }
      }, "image/png");
    };
    img.onerror = () => {
      showToast("Could not load image to copy");
    };
    img.src = fileUrl;
  } catch (err) {
    showToast("Error: " + err.message);
  }
}

// Flip image horizontally
function flipImageHorizontal() {
  state.flipH = !state.flipH;
  applyTransform();
  showToast(state.flipH ? "Lật ảnh ngang (Flip)" : "Khôi phục chiều ảnh");
}

// Show Image Properties Details Modal
function showImageProperties() {
  const current = state.filteredImages[state.currentIndex];
  if (!current) return;

  const mp = current.width && current.height ? ((current.width * current.height) / 1000000).toFixed(2) + " MP" : "-";
  const modDate = new Date(current.mod_time).toLocaleString();

  DOM.propsBody.innerHTML = `
    <div class="prop-row">
      <span class="prop-label">Tên tệp:</span>
      <span class="prop-value" title="${current.name}">${current.name}</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">Định dạng:</span>
      <span class="prop-value">${current.format.toUpperCase()} (${current.ext})</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">Loại ảnh:</span>
      <span class="prop-value">${current.is_animated ? "⚡ Ảnh động (Animated)" : "Ảnh tĩnh (Static)"}</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">Độ phân giải:</span>
      <span class="prop-value">${current.width && current.height ? `${current.width} × ${current.height} px (${mp})` : "Dynamic / Vector"}</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">Tỉ lệ khung hình:</span>
      <span class="prop-value">${current.aspect_ratio ? current.aspect_ratio.toFixed(2) + " : 1" : "-"}</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">Dung lượng:</span>
      <span class="prop-value">${formatBytes(current.size)} (${current.size.toLocaleString()} bytes)</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">Ngày sửa đổi:</span>
      <span class="prop-value">${modDate}</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">Đường dẫn đầy đủ:</span>
      <span class="prop-value" title="${current.path}">${current.path}</span>
    </div>
  `;
  DOM.propsModal.style.display = "flex";
}

// Context Menu Display and Boundary Positioning
function showContextMenu(e, itemIndex) {
  e.preventDefault();

  if (itemIndex !== undefined && itemIndex !== null && itemIndex >= 0) {
    if (state.currentIndex !== itemIndex) {
      selectImage(itemIndex);
    }
  }

  const current = state.filteredImages[state.currentIndex];
  if (!current) return;

  // Toggle play/pause visibility
  if (current.is_animated) {
    DOM.ctxPlayPause.style.display = "flex";
    DOM.ctxPlayPauseLabel.textContent = state.isPaused ? "Tiếp tục phát" : "Tạm dừng";
    DOM.ctxPlayPauseIcon.textContent = state.isPaused ? "▶️" : "⏸️";
  } else {
    DOM.ctxPlayPause.style.display = "none";
  }

  const menu = DOM.contextMenu;
  menu.style.display = "flex";
  menu.style.visibility = "hidden";

  requestAnimationFrame(() => {
    const menuW = menu.offsetWidth || 250;
    const menuH = menu.offsetHeight || 370;
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 8;
    if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 8;
    if (x < 0) x = 8;
    if (y < 0) y = 8;

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.visibility = "visible";
  });
}

function hideContextMenu() {
  if (DOM.contextMenu) {
    DOM.contextMenu.style.display = "none";
  }
}

// Chunked Infinite Grid Gallery (Prevents freezing with thousands of images)
function renderGridGallery() {
  let gridContainer = document.getElementById("gridGalleryContainer");
  if (!gridContainer) {
    gridContainer = document.createElement("div");
    gridContainer.id = "gridGalleryContainer";
    gridContainer.className = "grid-gallery-container";
    DOM.appBody.appendChild(gridContainer);

    gridContainer.addEventListener("scroll", () => {
      if (gridContainer.scrollTop + gridContainer.clientHeight >= gridContainer.scrollHeight - 350) {
        if (state.gridLoadedCount < state.filteredImages.length) {
          state.gridLoadedCount += 80;
          appendGridCards(gridContainer);
        }
      }
    });
  }

  // Ensure enough items are rendered to cover state.currentIndex
  if (state.currentIndex >= 0 && state.currentIndex >= state.gridLoadedCount) {
    state.gridLoadedCount = state.currentIndex + 60;
  }

  gridContainer.innerHTML = "";
  appendGridCards(gridContainer);

  // Scroll to active card to preserve position in grid
  if (state.currentIndex >= 0) {
    requestAnimationFrame(() => {
      const activeCard = gridContainer.querySelector(`[data-index="${state.currentIndex}"]`);
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: "auto", block: "center" });
      }
    });
  }
}

function appendGridCards(gridContainer) {
  const start = gridContainer.children.length;
  const end = Math.min(state.gridLoadedCount, state.filteredImages.length);
  const fragment = document.createDocumentFragment();

  for (let i = start; i < end; i++) {
    const img = state.filteredImages[i];
    const card = document.createElement("div");
    const isSelected = i === state.currentIndex;
    card.className = `grid-card ${isSelected ? "active" : ""}`;
    card.dataset.index = i;
    const fileUrl = `/api/file?path=${encodeURIComponent(img.path)}`;

    card.innerHTML = `
      <div class="grid-card-img-wrap">
        <img src="${fileUrl}" loading="lazy" alt="${img.name}" />
        ${img.is_animated ? '<span class="thumb-anim-badge">ANIM</span>' : ""}
      </div>
      <div class="grid-card-title" title="${img.name}">${img.name}</div>
      <div class="grid-card-meta">
        <span class="format-tag">${img.format}</span>
        <span>${formatBytes(img.size)}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      selectImage(i);
      setViewMode("split");
    });

    fragment.appendChild(card);
  }

  gridContainer.appendChild(fragment);
}

function getTopmostVisibleGridCardIndex(container) {
  if (!container) return state.currentIndex;
  const cards = container.querySelectorAll(".grid-card");
  const containerTop = container.scrollTop;
  for (const card of cards) {
    if (card.offsetTop + card.offsetHeight > containerTop + 20) {
      const idx = parseInt(card.dataset.index);
      if (!isNaN(idx)) return idx;
    }
  }
  return state.currentIndex;
}

function setViewMode(mode) {
  if (state.viewMode === mode) return;

  state.viewMode = mode;
  if (mode === "grid") {
    DOM.appBody.classList.add("body-grid-view");
    DOM.btnViewGrid.classList.add("active");
    DOM.btnViewSplit.classList.remove("active");
    renderGridGallery();
  } else {
    // Switching to split view: determine which card was at the top of the grid if user scrolled
    const grid = document.getElementById("gridGalleryContainer");
    if (grid) {
      const topIdx = getTopmostVisibleGridCardIndex(grid);
      if (topIdx >= 0 && topIdx < state.filteredImages.length) {
        state.currentIndex = topIdx;
      }
      grid.remove();
    }

    DOM.appBody.classList.remove("body-grid-view");
    DOM.btnViewSplit.classList.add("active");
    DOM.btnViewGrid.classList.remove("active");

    // Re-select and display image in split preview
    selectImage(state.currentIndex);

    // Scroll sidebar virtual list to center the current image
    if (state.currentIndex >= 0) {
      const clientH = DOM.thumbnailList.clientHeight || 500;
      const targetTop = Math.max(0, state.currentIndex * VIRTUAL_ITEM_HEIGHT - (clientH / 2) + (VIRTUAL_ITEM_HEIGHT / 2));
      DOM.thumbnailList.scrollTop = targetTop;
      updateVirtualList();
    }
  }
}

// Mouse Drag & Wheel Event Listeners
function setupViewportInteractions() {
  const vp = DOM.viewport;

  vp.addEventListener("mousedown", (e) => {
    if (e.button !== 0 || e.target.closest(".floating-toolbar") || e.target.closest(".nav-arrow")) return;
    state.isPanning = true;
    state.startX = e.clientX - state.panX;
    state.startY = e.clientY - state.panY;
    vp.classList.add("panning");
  });

  window.addEventListener("mousemove", (e) => {
    if (!state.isPanning) return;
    state.panX = e.clientX - state.startX;
    state.panY = e.clientY - state.startY;
    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    if (state.isPanning) {
      state.isPanning = false;
      vp.classList.remove("panning");
    }
  });

  vp.addEventListener("wheel", (e) => {
    if (e.target.closest(".floating-toolbar")) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    zoom(factor, e.clientX, e.clientY);
  }, { passive: false });

  vp.addEventListener("dblclick", (e) => {
    if (e.target.closest(".floating-toolbar") || e.target.closest(".nav-arrow")) return;
    if (Math.abs(state.scale - 1) < 0.05) {
      fitToViewport();
    } else {
      setZoom100();
    }
  });
}

// Keyboard Shortcuts Listener
function setupKeyboardNavigation() {
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") {
      if (e.key === "Escape") {
        e.target.blur();
      }
      return;
    }

    switch (e.key) {
      case "ArrowRight":
      case "d":
      case "D":
      case "j":
      case "J":
        e.preventDefault();
        navigateNext();
        break;

      case "ArrowLeft":
      case "a":
      case "A":
      case "k":
      case "K":
        e.preventDefault();
        navigatePrev();
        break;

      case " ":
        e.preventDefault();
        togglePlayPause();
        break;

      case "f":
      case "F":
        e.preventDefault();
        toggleFullscreen();
        break;

      case "0":
        e.preventDefault();
        fitToViewport();
        break;

      case "1":
        e.preventDefault();
        setZoom100();
        break;

      case "+":
      case "=":
        e.preventDefault();
        zoom(1.2);
        break;

      case "-":
      case "_":
        e.preventDefault();
        zoom(0.8);
        break;

      case "r":
      case "R":
        e.preventDefault();
        rotateImage();
        break;

      case "c":
      case "C":
        e.preventDefault();
        copyCurrentPath();
        break;

      case "Delete":
        e.preventDefault();
        deleteCurrentImage();
        break;

      case "/":
        e.preventDefault();
        DOM.searchInput.focus();
        break;

      case "?":
        e.preventDefault();
        DOM.helpModal.style.display = "flex";
        break;

      case "Escape":
        hideContextMenu();
        DOM.folderModal.style.display = "none";
        DOM.helpModal.style.display = "none";
        DOM.propsModal.style.display = "none";
        break;
    }
  });
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation Chevrons
  DOM.btnPrev.addEventListener("click", navigatePrev);
  DOM.btnNext.addEventListener("click", navigateNext);

  // Floating Toolbar Buttons
  DOM.btnPlayPause.addEventListener("click", togglePlayPause);
  DOM.btnZoomIn.addEventListener("click", () => zoom(1.2));
  DOM.btnZoomOut.addEventListener("click", () => zoom(0.8));
  DOM.btnZoomFit.addEventListener("click", fitToViewport);
  DOM.btnZoom100.addEventListener("click", setZoom100);
  DOM.btnRotate.addEventListener("click", rotateImage);
  DOM.btnFullscreen.addEventListener("click", toggleFullscreen);
  DOM.btnCopyPath.addEventListener("click", copyCurrentPath);
  DOM.btnOpenSystem.addEventListener("click", openInSystem);
  DOM.btnDelete.addEventListener("click", deleteCurrentImage);

  // Custom Context Menu Items
  DOM.ctxOpenFolder.addEventListener("click", () => { hideContextMenu(); openInSystem(); });
  DOM.ctxOpenDefault.addEventListener("click", () => { hideContextMenu(); openWithDefaultApp(); });
  DOM.ctxCopyImage.addEventListener("click", () => { hideContextMenu(); copyImageToClipboard(); });
  DOM.ctxCopyPath.addEventListener("click", () => { hideContextMenu(); copyCurrentPath(); });
  DOM.ctxPlayPause.addEventListener("click", () => { hideContextMenu(); togglePlayPause(); });
  DOM.ctxRotate.addEventListener("click", () => { hideContextMenu(); rotateImage(); });
  DOM.ctxFlipH.addEventListener("click", () => { hideContextMenu(); flipImageHorizontal(); });
  DOM.ctxFitScreen.addEventListener("click", () => { hideContextMenu(); fitToViewport(); });
  DOM.ctxActualSize.addEventListener("click", () => { hideContextMenu(); setZoom100(); });
  DOM.ctxFullscreen.addEventListener("click", () => { hideContextMenu(); toggleFullscreen(); });
  DOM.ctxProperties.addEventListener("click", () => { hideContextMenu(); showImageProperties(); });
  DOM.ctxDelete.addEventListener("click", () => { hideContextMenu(); deleteCurrentImage(); });

  // Properties Modal Close
  DOM.btnClosePropsModal.addEventListener("click", () => DOM.propsModal.style.display = "none");
  DOM.btnClosePropsBtn.addEventListener("click", () => DOM.propsModal.style.display = "none");

  // Right-Click Context Menu Interceptor
  window.addEventListener("contextmenu", (e) => {
    // Check if right click occurred on a thumbnail card
    const card = e.target.closest(".thumb-card");
    if (card) {
      const idx = parseInt(card.dataset.index);
      showContextMenu(e, idx);
      return;
    }

    // Check if right click occurred on a grid card
    const gridCard = e.target.closest(".grid-card");
    if (gridCard) {
      const idx = parseInt(gridCard.dataset.index);
      showContextMenu(e, idx);
      return;
    }

    // Check if right click occurred on a filmstrip thumbnail
    const filmThumb = e.target.closest(".filmstrip-thumb");
    if (filmThumb) {
      const idx = parseInt(filmThumb.dataset.index);
      showContextMenu(e, idx);
      return;
    }

    // Preview area or main window
    const stage = e.target.closest("#previewStage") || e.target.closest("#viewport") || e.target.closest(".canvas-container");
    if (stage) {
      showContextMenu(e, state.currentIndex);
      return;
    }

    // Prevent default browser menu anywhere in app
    e.preventDefault();
    if (state.currentIndex >= 0) {
      showContextMenu(e, state.currentIndex);
    }
  });

  // Hide context menu on normal click anywhere outside or on scroll
  window.addEventListener("click", (e) => {
    if (!e.target.closest("#contextMenu")) {
      hideContextMenu();
    }
  });
  window.addEventListener("scroll", hideContextMenu, true);

  // Search Box (Debounced for large lists)
  DOM.searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    DOM.clearSearchBtn.style.display = state.searchQuery ? "block" : "none";
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      applyFiltersAndSort();
    }, 120);
  });

  DOM.clearSearchBtn.addEventListener("click", () => {
    DOM.searchInput.value = "";
    state.searchQuery = "";
    DOM.clearSearchBtn.style.display = "none";
    applyFiltersAndSort();
  });

  // Filter Pills (All / Animated / Static)
  DOM.filterPills.querySelectorAll(".pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      DOM.filterPills.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.activeFilter = pill.dataset.filter;
      applyFiltersAndSort();
    });
  });

  // Recursive Checkbox
  DOM.recursiveCheckbox.addEventListener("change", (e) => {
    loadImages(state.rootDir, e.target.checked);
  });

  // Sort Selector
  DOM.sortSelect.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    applyFiltersAndSort();
  });

  // View Mode Toggles
  DOM.btnViewSplit.addEventListener("click", () => setViewMode("split"));
  DOM.btnViewGrid.addEventListener("click", () => setViewMode("grid"));

  // Virtual Scrolling on Sidebar
  DOM.thumbnailList.addEventListener("scroll", onVirtualScroll);

  // Change Folder Modal
  const openFolderModal = () => {
    DOM.newFolderPath.value = state.rootDir;
    DOM.folderModal.style.display = "flex";
    DOM.newFolderPath.focus();
  };
  DOM.folderBreadcrumb.addEventListener("click", openFolderModal);
  DOM.btnChangeFolder.addEventListener("click", (e) => {
    e.stopPropagation();
    openFolderModal();
  });

  DOM.btnCloseFolderModal.addEventListener("click", () => DOM.folderModal.style.display = "none");
  DOM.btnCancelFolderModal.addEventListener("click", () => DOM.folderModal.style.display = "none");
  DOM.btnSubmitFolder.addEventListener("click", () => {
    const val = DOM.newFolderPath.value.trim();
    if (val) {
      loadImages(val, state.recursive);
      DOM.folderModal.style.display = "none";
    }
  });

  // Shortcuts Help Modal
  DOM.btnHelp.addEventListener("click", () => DOM.helpModal.style.display = "flex");
  DOM.btnCloseHelpModal.addEventListener("click", () => DOM.helpModal.style.display = "none");
  DOM.btnCloseHelpBtn.addEventListener("click", () => DOM.helpModal.style.display = "none");

  // Keep-Alive Heartbeat
  setInterval(() => {
    fetch("/api/heartbeat").catch(() => {});
  }, 2500);
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  setupViewportInteractions();
  setupKeyboardNavigation();
  setupEventListeners();
  loadImages();
});
