/**
 * imgv - Image Viewer Client Application
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
  recursive: false,
  viewMode: "split", // "split", "grid"

  // Viewport / Zoom & Pan State
  scale: 1,
  fitScale: 1,
  panX: 0,
  panY: 0,
  rotation: 0,
  isPanning: false,
  startX: 0,
  startY: 0,
  isPaused: false,
};

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

function showToast(message, duration = 2500) {
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
  let list = [...state.images];

  // 1. Filter by Animation State
  if (state.activeFilter === "animated") {
    list = list.filter((img) => img.is_animated);
  } else if (state.activeFilter === "static") {
    list = list.filter((img) => !img.is_animated);
  }

  // 2. Filter by Format Chip
  if (state.activeFormatFilter) {
    list = list.filter((img) => img.format.toLowerCase() === state.activeFormatFilter.toLowerCase());
  }

  // 3. Filter by Search Query
  if (state.searchQuery.trim() !== "") {
    const q = state.searchQuery.toLowerCase();
    list = list.filter((img) => img.name.toLowerCase().includes(q) || img.rel_path.toLowerCase().includes(q));
  }

  // 4. Sort
  list.sort((a, b) => {
    switch (state.sortBy) {
      case "name_asc":
        return a.name.localeCompare(b.name, undefined, { numeric: true });
      case "name_desc":
        return b.name.localeCompare(a.name, undefined, { numeric: true });
      case "date_desc":
        return new Date(b.mod_time) - new Date(a.mod_time);
      case "date_asc":
        return new Date(a.mod_time) - new Date(b.mod_time);
      case "size_desc":
        return b.size - a.size;
      case "size_asc":
        return a.size - b.size;
      default:
        return 0;
    }
  });

  state.filteredImages = list;
  DOM.filteredStats.textContent = `${list.length} of ${state.images.length} images`;

  renderThumbnailList();
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

// Render Sidebar Thumbnail List
function renderThumbnailList() {
  DOM.thumbnailList.innerHTML = "";

  state.filteredImages.forEach((img, index) => {
    const card = document.createElement("div");
    card.className = `thumb-card ${img.is_animated ? "anim-card" : ""}`;
    card.dataset.index = index;

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
      selectImage(index);
    });

    DOM.thumbnailList.appendChild(card);
  });
}

// Render Bottom Filmstrip Rail
function renderFilmstrip() {
  DOM.filmstripTrack.innerHTML = "";

  state.filteredImages.forEach((img, index) => {
    const thumb = document.createElement("div");
    thumb.className = `filmstrip-thumb ${img.is_animated ? "anim-thumb" : ""}`;
    thumb.dataset.index = index;
    thumb.title = img.name;

    const fileUrl = `/api/file?path=${encodeURIComponent(img.path)}`;
    thumb.innerHTML = `<img src="${fileUrl}" loading="lazy" alt="${img.name}" />`;

    thumb.addEventListener("click", () => {
      selectImage(index);
    });

    DOM.filmstripTrack.appendChild(thumb);
  });
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
  DOM.previewDimensions.textContent = img.width && img.height ? `${img.width} × ${img.height} px` : "Vector / Dynamic";
  DOM.previewFileSize.textContent = formatBytes(img.size);
  DOM.previewIndex.textContent = `${index + 1} / ${state.filteredImages.length}`;

  // Reset Pause state
  state.isPaused = false;
  DOM.freezeCanvas.style.display = "none";
  DOM.previewImg.style.display = "block";
  DOM.playPauseIcon.textContent = "⏸️";
  DOM.playPauseLabel.textContent = "Pause";
  DOM.btnPlayPause.style.display = img.is_animated ? "flex" : "none";

  // Set Image Source (Blink automatically plays animated GIF, WebP, APNG, SVG)
  const fileUrl = `/api/file?path=${encodeURIComponent(img.path)}`;
  DOM.previewImg.src = fileUrl;

  // Once image loads, fit to viewport
  DOM.previewImg.onload = () => {
    resetTransform();
    fitToViewport();
  };

  // Update Active Indicators in Sidebar and Filmstrip
  document.querySelectorAll(".thumb-card").forEach((c) => c.classList.remove("active"));
  const activeCard = DOM.thumbnailList.querySelector(`[data-index="${index}"]`);
  if (activeCard) {
    activeCard.classList.add("active");
    activeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  document.querySelectorAll(".filmstrip-thumb").forEach((t) => t.classList.remove("active"));
  const activeThumb = DOM.filmstripTrack.querySelector(`[data-index="${index}"]`);
  if (activeThumb) {
    activeThumb.classList.add("active");
    activeThumb.scrollIntoView({ behavior: "smooth", inline: "center" });
  }
}

// Animation Freeze / Playback Toggle
function togglePlayPause() {
  const current = state.filteredImages[state.currentIndex];
  if (!current || !current.is_animated) return;

  if (!state.isPaused) {
    // Freeze current frame by capturing into canvas
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
  applyTransform();
}

function applyTransform() {
  DOM.canvasContainer.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale}) rotate(${state.rotation}deg)`;
}

function fitToViewport() {
  const vpRect = DOM.viewport.getBoundingClientRect();
  const imgW = DOM.previewImg.naturalWidth || 600;
  const imgH = DOM.previewImg.naturalHeight || 400;

  if (imgW === 0 || imgH === 0) return;

  // Margin padding
  const pad = 40;
  const availW = vpRect.width - pad;
  const availH = vpRect.height - pad;

  const scaleW = availW / imgW;
  const scaleH = availH / imgH;
  const fit = Math.min(scaleW, scaleH, 1); // Don't upscale past 100% on initial fit unless requested

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
      // Remove from lists
      state.images = state.images.filter((img) => img.path !== current.path);
      applyFiltersAndSort();
    } else {
      showToast("Could not delete file");
    }
  } catch (err) {
    showToast("Error deleting file: " + err.message);
  }
}

// Grid View Renderer
function renderGridGallery() {
  let gridContainer = document.getElementById("gridGalleryContainer");
  if (!gridContainer) {
    gridContainer = document.createElement("div");
    gridContainer.id = "gridGalleryContainer";
    gridContainer.className = "grid-gallery-container";
    DOM.appBody.appendChild(gridContainer);
  }

  gridContainer.innerHTML = "";
  state.filteredImages.forEach((img, index) => {
    const card = document.createElement("div");
    card.className = "grid-card";
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
      // Switch to split view and select this image
      setViewMode("split");
      selectImage(index);
    });

    gridContainer.appendChild(card);
  });
}

function setViewMode(mode) {
  state.viewMode = mode;
  if (mode === "grid") {
    DOM.appBody.classList.add("body-grid-view");
    DOM.btnViewGrid.classList.add("active");
    DOM.btnViewSplit.classList.remove("active");
    renderGridGallery();
  } else {
    DOM.appBody.classList.remove("body-grid-view");
    DOM.btnViewSplit.classList.add("active");
    DOM.btnViewGrid.classList.remove("active");
    const grid = document.getElementById("gridGalleryContainer");
    if (grid) grid.remove();
  }
}

// Mouse Drag & Wheel Event Listeners
function setupViewportInteractions() {
  const vp = DOM.viewport;

  vp.addEventListener("mousedown", (e) => {
    // Only drag with left mouse button when not clicking toolbar
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
    // Don't intercept if user is typing in inputs
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
        DOM.folderModal.style.display = "none";
        DOM.helpModal.style.display = "none";
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

  // Search Box
  DOM.searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    DOM.clearSearchBtn.style.display = state.searchQuery ? "block" : "none";
    applyFiltersAndSort();
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
