/**
 * imgv - High-Performance Image Viewer Client Application
 * Optimized for massive directories with Virtual Scrolling and Multi-Language (EN/VI)
 */

// Multi-Language Localization Dictionary (English by default, Vietnamese supported)
const I18N = {
  en: {
    badgeAnim: "anim",
    folderTitle: "Click to change folder",
    changeFolder: "Change folder",
    searchPlaceholder: "Search images... (Press '/' to focus)",
    filterAll: "All",
    filterAnim: "⚡ Animated",
    filterStatic: "Static",
    recursive: "Recursive",
    sortNameAsc: "Name (A → Z)",
    sortNameDesc: "Name (Z → A)",
    sortDateDesc: "Date (Newest)",
    sortDateAsc: "Date (Oldest)",
    sortSizeDesc: "Size (Largest)",
    sortSizeAsc: "Size (Smallest)",
    viewSplit: "Split View (Sidebar + Preview)",
    viewGrid: "Grid View",
    helpTitle: "Keyboard Shortcuts (?)",
    statsFiltered: "{filtered} of {total} images",
    selectImage: "Select an image",
    badgeAnimated: "⚡ ANIMATED",
    dynamicVector: "Dynamic / Vector",
    emptyTitle: "No images to display",
    emptySub: "Scan another folder or adjust your search filter",
    prevImage: "Previous Image (Left Arrow / A)",
    nextImage: "Next Image (Right Arrow / D)",
    pause: "Pause",
    play: "Play",
    zoomIn: "Zoom In (+)",
    zoomOut: "Zoom Out (-)",
    zoomFit: "Fit to Screen (0)",
    zoom100: "Actual Size 1:1 (1)",
    rotate: "Rotate 90° (R)",
    fullscreen: "Toggle Fullscreen (F)",
    copyPath: "Copy Path (C)",
    revealFolder: "Reveal in File Manager",
    delete: "Delete Image",

    // Context Menu
    ctxOpenFolder: "Open Containing Folder",
    ctxOpenDefault: "Open with Default App",
    ctxCopyImage: "Copy Image to Clipboard",
    ctxCopyPath: "Copy File Path",
    ctxPlayPause: "Pause / Play",
    ctxRotate: "Rotate 90°",
    ctxFlipH: "Flip Horizontal",
    ctxFitScreen: "Fit to Screen",
    ctxActualSize: "Actual Size (100%)",
    ctxFullscreen: "Toggle Fullscreen",
    ctxProperties: "Image Properties",
    ctxDelete: "Delete Image",

    // Modals
    modalFolderTitle: "Change Folder",
    modalFolderLabel: "Enter folder path:",
    modalFolderPlaceholder: "/path/to/images or .",
    modalFolderCancel: "Cancel",
    modalFolderSubmit: "Scan Folder",

    modalHelpTitle: "Keyboard Shortcuts",
    shortcutPrev: "Previous image",
    shortcutNext: "Next image",
    shortcutPlayPause: "Play / Pause animated image",
    shortcutFullscreen: "Toggle Fullscreen",
    shortcutFit: "Fit image to screen",
    shortcut100: "100% Zoom (1:1)",
    shortcutZoom: "Zoom In / Out",
    shortcutRotate: "Rotate 90 degrees",
    shortcutCopyPath: "Copy file path to clipboard",
    shortcutSearch: "Focus search bar",
    shortcutEsc: "Exit fullscreen / Close modal",
    shortcutClose: "Got it",

    modalPropsTitle: "Image Properties",
    propName: "File Name:",
    propFormat: "Format:",
    propType: "Image Type:",
    propDimensions: "Dimensions:",
    propAspect: "Aspect Ratio:",
    propSize: "File Size:",
    propModified: "Last Modified:",
    propPath: "Full Path:",
    propClose: "Close",
    typeAnimated: "⚡ Animated",
    typeStatic: "Static",

    // Toasts
    toastCopiedPath: "Copied path: {name}",
    toastCopiedImage: "Image copied to clipboard! 📋",
    toastCopyingImage: "Copying image to clipboard...",
    toastAnimPaused: "Animation Paused",
    toastAnimPlaying: "Animation Playing",
    toastOpenedFileManager: "Opened file location in File Manager",
    toastOpenedDefault: "Opened in default system viewer",
    toastDeleted: "Deleted {name}",
    toastConfirmDelete: "Are you sure you want to delete \"{name}\"?",
    toastFlipOn: "Flipped horizontally",
    toastFlipOff: "Restored orientation",
    toastActualSize: "Actual Size (100%)",
    renderModeTitle: "Pixel Sampling: Nearest Neighbor / Smooth (P)",
    renderModePixel: "Pixel",
    renderModeSmooth: "Smooth",
    ctxRenderPixel: "Pixel Sampling: Nearest Neighbor",
    ctxRenderSmooth: "Pixel Sampling: Smooth",
    shortcutRenderMode: "Toggle Nearest Neighbor (Pixel Art) / Smooth",
    toastRenderPixel: "Sampling: Nearest Neighbor (Pixel Art) 👾",
    toastRenderSmooth: "Sampling: Smooth (Bilinear) ✨",
  },
  vi: {
    badgeAnim: "động",
    folderTitle: "Bấm để đổi thư mục",
    changeFolder: "Đổi thư mục",
    searchPlaceholder: "Tìm kiếm ảnh... (Nhấn '/' để nhập)",
    filterAll: "Tất cả",
    filterAnim: "⚡ Ảnh động",
    filterStatic: "Ảnh tĩnh",
    recursive: "Đệ quy",
    sortNameAsc: "Tên (A → Z)",
    sortNameDesc: "Tên (Z → A)",
    sortDateDesc: "Ngày (Mới nhất)",
    sortDateAsc: "Ngày (Cũ nhất)",
    sortSizeDesc: "Dung lượng (Lớn nhất)",
    sortSizeAsc: "Dung lượng (Nhỏ nhất)",
    viewSplit: "Dạng chia đôi (Danh sách + Xem ảnh)",
    viewGrid: "Dạng lưới",
    helpTitle: "Phím tắt bàn phím (?)",
    statsFiltered: "{filtered} trên {total} ảnh",
    selectImage: "Chọn một ảnh",
    badgeAnimated: "⚡ ẢNH ĐỘNG",
    dynamicVector: "Động / Vector",
    emptyTitle: "Không có ảnh nào để hiển thị",
    emptySub: "Quét thư mục khác hoặc điều chỉnh bộ lọc tìm kiếm",
    prevImage: "Ảnh trước (Mũi tên trái / A)",
    nextImage: "Ảnh tiếp theo (Mũi tên phải / D)",
    pause: "Tạm dừng",
    play: "Tiếp tục",
    zoomIn: "Phóng to (+)",
    zoomOut: "Thu nhỏ (-)",
    zoomFit: "Vừa màn hình (0)",
    zoom100: "Kích thước 1:1 (1)",
    rotate: "Xoay 90° (R)",
    fullscreen: "Toàn màn hình (F)",
    copyPath: "Copy đường dẫn (C)",
    revealFolder: "Mở trong File Manager",
    delete: "Xóa ảnh",

    // Context Menu
    ctxOpenFolder: "Mở thư mục chứa file",
    ctxOpenDefault: "Mở bằng ứng dụng mặc định",
    ctxCopyImage: "Copy ảnh vào Clipboard",
    ctxCopyPath: "Copy đường dẫn file",
    ctxPlayPause: "Tạm dừng / Tiếp tục",
    ctxRotate: "Xoay 90°",
    ctxFlipH: "Lật ngang (Flip)",
    ctxFitScreen: "Fit vừa màn hình",
    ctxActualSize: "Kích thước thật (100%)",
    ctxFullscreen: "Xem toàn màn hình",
    ctxProperties: "Thông tin chi tiết (Properties)",
    ctxDelete: "Xóa ảnh này",

    // Modals
    modalFolderTitle: "Đổi thư mục",
    modalFolderLabel: "Nhập đường dẫn thư mục:",
    modalFolderPlaceholder: "/duong/dan/den/anh hoặc .",
    modalFolderCancel: "Hủy",
    modalFolderSubmit: "Quét thư mục",

    modalHelpTitle: "Phím tắt bàn phím",
    shortcutPrev: "Ảnh trước đó",
    shortcutNext: "Ảnh tiếp theo",
    shortcutPlayPause: "Tạm dừng / Tiếp tục phát ảnh động",
    shortcutFullscreen: "Bật / tắt toàn màn hình",
    shortcutFit: "Fit ảnh vừa màn hình",
    shortcut100: "Kích thước thật 100% (1:1)",
    shortcutZoom: "Phóng to / Thu nhỏ",
    shortcutRotate: "Xoay 90 độ",
    shortcutCopyPath: "Copy đường dẫn file vào clipboard",
    shortcutSearch: "Nhập ô tìm kiếm",
    shortcutEsc: "Thoát toàn màn hình / Đóng hộp thoại",
    shortcutClose: "Đã hiểu",

    modalPropsTitle: "Thông tin chi tiết ảnh",
    propName: "Tên tệp:",
    propFormat: "Định dạng:",
    propType: "Loại ảnh:",
    propDimensions: "Độ phân giải:",
    propAspect: "Tỉ lệ khung hình:",
    propSize: "Dung lượng:",
    propModified: "Ngày sửa đổi:",
    propPath: "Đường dẫn đầy đủ:",
    propClose: "Đóng",
    typeAnimated: "⚡ Ảnh động (Animated)",
    typeStatic: "Ảnh tĩnh (Static)",

    // Toasts
    toastCopiedPath: "Đã copy đường dẫn: {name}",
    toastCopiedImage: "Đã copy ảnh vào clipboard! 📋",
    toastCopyingImage: "Đang copy ảnh vào clipboard...",
    toastAnimPaused: "Đã tạm dừng ảnh động",
    toastAnimPlaying: "Đang phát ảnh động",
    toastOpenedFileManager: "Đã mở vị trí file trong File Manager",
    toastOpenedDefault: "Đã mở trong trình xem ảnh mặc định",
    toastDeleted: "Đã xóa {name}",
    toastConfirmDelete: "Bạn có chắc muốn xóa \"{name}\" không?",
    toastFlipOn: "Lật ảnh ngang (Flip)",
    toastFlipOff: "Khôi phục chiều ảnh",
    toastActualSize: "Kích thước thật (100%)",
    renderModeTitle: "Khử răng cưa: Nearest Neighbor / Mịn (P)",
    renderModePixel: "Pixel",
    renderModeSmooth: "Mịn",
    ctxRenderPixel: "Chế độ xem: Nearest Neighbor (Pixel Art)",
    ctxRenderSmooth: "Chế độ xem: Mịn (Bilinear)",
    shortcutRenderMode: "Bật/tắt Nearest Neighbor (xem Pixel Art)",
    toastRenderPixel: "Chế độ phóng to: Nearest Neighbor (Sắc nét Pixel Art) 👾",
    toastRenderSmooth: "Chế độ phóng to: Mịn màng (Smooth) ✨",
  }
};

// Default language is strictly 'en' as requested
function getInitialLang() {
  const urlParam = new URLSearchParams(window.location.search).get("lang");
  if (urlParam && (urlParam.toLowerCase() === "vi" || urlParam.toLowerCase() === "en")) {
    return urlParam.toLowerCase();
  }
  const saved = localStorage.getItem("imgv_lang");
  if (saved && (saved === "vi" || saved === "en")) {
    return saved;
  }
  return "en";
}

// Application State
const state = {
  lang: getInitialLang(),
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
  renderMode: localStorage.getItem("imgv_render_mode") || "smooth", // "smooth", "pixelated"

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
  btnLang: document.getElementById("btnLang"),
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
  btnRenderMode: document.getElementById("btnRenderMode"),
  renderModeIcon: document.getElementById("renderModeIcon"),
  renderModeLabel: document.getElementById("renderModeLabel"),
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
  ctxRenderMode: document.getElementById("ctxRenderMode"),
  ctxRenderModeIcon: document.getElementById("ctxRenderModeIcon"),
  lblCtxRenderMode: document.getElementById("lblCtxRenderMode"),
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

// Translation Helper Function
function t(key, params = {}) {
  const dict = I18N[state.lang] || I18N.en;
  let str = dict[key] !== undefined ? dict[key] : (I18N.en[key] !== undefined ? I18N.en[key] : key);
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }
  return str;
}

function setLanguage(lang) {
  if (lang !== "en" && lang !== "vi") lang = "en";
  state.lang = lang;
  localStorage.setItem("imgv_lang", lang);
  updateLanguageUI();
}

function toggleLanguage() {
  const nextLang = state.lang === "en" ? "vi" : "en";
  setLanguage(nextLang);
}

function updateLanguageUI() {
  // Update language button
  if (DOM.btnLang) {
    DOM.btnLang.textContent = state.lang === "en" ? "🌐 EN" : "🌐 VI";
    DOM.btnLang.title = state.lang === "en" ? "Change Language (English / Tiếng Việt)" : "Đổi ngôn ngữ (English / Tiếng Việt)";
  }

  // Update elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      el.textContent = t(key);
    }
  });

  // Update elements with data-i18n-title
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (key) {
      el.title = t(key);
    }
  });

  // Update elements with data-i18n-placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      el.placeholder = t(key);
    }
  });

  // Dynamic status updates
  if (state.images) {
    const animCount = state.images.filter((img) => img.is_animated).length;
    DOM.headerAnimatedCount.textContent = `${animCount} ${t("badgeAnim")}`;
  }

  if (state.filteredImages && state.images) {
    DOM.filteredStats.textContent = t("statsFiltered", {
      filtered: state.filteredImages.length.toLocaleString(),
      total: state.images.length.toLocaleString(),
    });
  }

  // Toolbar & Context Menu Play/Pause Labels
  DOM.playPauseLabel.textContent = state.isPaused ? t("play") : t("pause");
  DOM.ctxPlayPauseLabel.textContent = state.isPaused ? t("play") : t("pause");

  applyRenderMode(false);

  // Re-render properties modal if currently open
  if (DOM.propsModal && DOM.propsModal.style.display === "flex") {
    showImageProperties();
  }
}

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
    DOM.headerAnimatedCount.textContent = `${data.animated_count} ${t("badgeAnim")}`;
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
  DOM.filteredStats.textContent = t("statsFiltered", {
    filtered: list.length.toLocaleString(),
    total: state.images.length.toLocaleString(),
  });

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
  DOM.previewDimensions.textContent = img.width && img.height ? `${img.width} × ${img.height} px` : t("dynamicVector");
  DOM.previewFileSize.textContent = formatBytes(img.size);
  DOM.previewIndex.textContent = `${(index + 1).toLocaleString()} / ${state.filteredImages.length.toLocaleString()}`;

  // Reset Pause state
  state.isPaused = false;
  DOM.freezeCanvas.style.display = "none";
  DOM.previewImg.style.display = "block";
  DOM.playPauseIcon.textContent = "⏸️";
  DOM.playPauseLabel.textContent = t("pause");
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
      activeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
    ctx.imageSmoothingEnabled = state.renderMode !== "pixelated";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    img.style.display = "none";
    canvas.style.display = "block";
    state.isPaused = true;
    DOM.playPauseIcon.textContent = "▶️";
    DOM.playPauseLabel.textContent = t("play");
    showToast(t("toastAnimPaused"));
  } else {
    // Resume animation
    DOM.freezeCanvas.style.display = "none";
    DOM.previewImg.style.display = "block";
    state.isPaused = false;
    DOM.playPauseIcon.textContent = "⏸️";
    DOM.playPauseLabel.textContent = t("pause");
    showToast(t("toastAnimPlaying"));
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
  showToast(t("toastActualSize"));
}

// Image Rendering / Interpolation (Nearest Neighbor vs Smooth)
function applyRenderMode(notify = false) {
  const isPixel = state.renderMode === "pixelated";
  if (isPixel) {
    DOM.canvasContainer.classList.add("render-pixelated");
    DOM.canvasContainer.classList.remove("render-smooth");
    if (DOM.btnRenderMode) {
      DOM.btnRenderMode.classList.add("active");
      DOM.renderModeIcon.textContent = "👾";
      DOM.renderModeLabel.textContent = t("renderModePixel");
      DOM.btnRenderMode.title = t("renderModeTitle");
    }
    if (DOM.lblCtxRenderMode) {
      DOM.lblCtxRenderMode.textContent = t("ctxRenderSmooth");
      DOM.ctxRenderModeIcon.textContent = "✨";
    }
  } else {
    DOM.canvasContainer.classList.remove("render-pixelated");
    DOM.canvasContainer.classList.add("render-smooth");
    if (DOM.btnRenderMode) {
      DOM.btnRenderMode.classList.remove("active");
      DOM.renderModeIcon.textContent = "▦";
      DOM.renderModeLabel.textContent = t("renderModeSmooth");
      DOM.btnRenderMode.title = t("renderModeTitle");
    }
    if (DOM.lblCtxRenderMode) {
      DOM.lblCtxRenderMode.textContent = t("ctxRenderPixel");
      DOM.ctxRenderModeIcon.textContent = "👾";
    }
  }

  localStorage.setItem("imgv_render_mode", state.renderMode);

  if (notify) {
    showToast(isPixel ? t("toastRenderPixel") : t("toastRenderSmooth"));
  }
}

function toggleRenderMode() {
  state.renderMode = state.renderMode === "pixelated" ? "smooth" : "pixelated";
  applyRenderMode(true);
}

function zoom(deltaFactor, clientX, clientY) {
  const oldScale = state.scale;
  let newScale = oldScale * deltaFactor;
  newScale = Math.max(0.05, Math.min(50, newScale));

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
    showToast(t("toastCopiedPath", { name: current.name }));
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
      showToast(t("toastOpenedFileManager"));
    }
  } catch (err) {
    showToast("Failed to open file manager");
  }
}

// Delete Image
async function deleteCurrentImage() {
  const current = state.filteredImages[state.currentIndex];
  if (!current) return;

  if (!confirm(t("toastConfirmDelete", { name: current.name }))) {
    return;
  }

  try {
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: current.path }),
    });
    if (res.ok) {
      showToast(t("toastDeleted", { name: current.name }));
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
      showToast(t("toastOpenedDefault"));
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
  showToast(t("toastCopyingImage"));
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
          showToast(t("toastCopiedImage"));
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
  showToast(state.flipH ? t("toastFlipOn") : t("toastFlipOff"));
}

// Show Image Properties Details Modal
function showImageProperties() {
  const current = state.filteredImages[state.currentIndex];
  if (!current) return;

  const mp = current.width && current.height ? ((current.width * current.height) / 1000000).toFixed(2) + " MP" : "-";
  const modDate = new Date(current.mod_time).toLocaleString();

  DOM.propsBody.innerHTML = `
    <div class="prop-row">
      <span class="prop-label">${t("propName")}</span>
      <span class="prop-value" title="${current.name}">${current.name}</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">${t("propFormat")}</span>
      <span class="prop-value">${current.format.toUpperCase()} (${current.ext})</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">${t("propType")}</span>
      <span class="prop-value">${current.is_animated ? t("typeAnimated") : t("typeStatic")}</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">${t("propDimensions")}</span>
      <span class="prop-value">${current.width && current.height ? `${current.width} × ${current.height} px (${mp})` : t("dynamicVector")}</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">${t("propAspect")}</span>
      <span class="prop-value">${current.aspect_ratio ? current.aspect_ratio.toFixed(2) + " : 1" : "-"}</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">${t("propSize")}</span>
      <span class="prop-value">${formatBytes(current.size)} (${current.size.toLocaleString()} bytes)</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">${t("propModified")}</span>
      <span class="prop-value">${modDate}</span>
    </div>
    <div class="prop-row">
      <span class="prop-label">${t("propPath")}</span>
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
    DOM.ctxPlayPauseLabel.textContent = state.isPaused ? t("play") : t("pause");
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
      setViewMode("split", i);
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
      const idx = parseInt(card.dataset.index, 10);
      if (!isNaN(idx)) return idx;
    }
  }
  return state.currentIndex;
}

function setViewMode(mode, targetIndex = null) {
  if (state.viewMode === mode) {
    if (mode === "split" && typeof targetIndex === "number" && targetIndex >= 0 && targetIndex < state.filteredImages.length) {
      selectImage(targetIndex);
    }
    return;
  }

  state.viewMode = mode;
  if (mode === "grid") {
    DOM.appBody.classList.add("body-grid-view");
    DOM.btnViewGrid.classList.add("active");
    DOM.btnViewSplit.classList.remove("active");
    renderGridGallery();
  } else {
    // Switching to split view: determine which card to display
    const grid = document.getElementById("gridGalleryContainer");
    if (grid) {
      if (typeof targetIndex === "number" && targetIndex >= 0 && targetIndex < state.filteredImages.length) {
        state.currentIndex = targetIndex;
      } else {
        const topIdx = getTopmostVisibleGridCardIndex(grid);
        if (topIdx >= 0 && topIdx < state.filteredImages.length) {
          state.currentIndex = topIdx;
        }
      }
      grid.remove();
    } else if (typeof targetIndex === "number" && targetIndex >= 0 && targetIndex < state.filteredImages.length) {
      state.currentIndex = targetIndex;
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
      case "Enter":
        if (state.viewMode === "grid" && state.currentIndex >= 0) {
          e.preventDefault();
          setViewMode("split", state.currentIndex);
        }
        break;

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

      case "p":
      case "P":
        e.preventDefault();
        toggleRenderMode();
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
  DOM.btnRenderMode.addEventListener("click", toggleRenderMode);
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
  DOM.ctxRenderMode.addEventListener("click", () => { hideContextMenu(); toggleRenderMode(); });
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

  // Language Toggle Button
  if (DOM.btnLang) {
    DOM.btnLang.addEventListener("click", toggleLanguage);
  }

  // Shortcuts Help Modal
  DOM.btnHelp.addEventListener("click", () => DOM.helpModal.style.display = "flex");
  DOM.btnCloseHelpModal.addEventListener("click", () => DOM.helpModal.style.display = "none");
  DOM.btnCloseHelpBtn.addEventListener("click", () => DOM.helpModal.style.display = "none");
}

// Keep-Alive Heartbeat & Instant Shutdown on Window Close
function sendHeartbeat() {
  fetch("/api/heartbeat").catch(() => {});
}

sendHeartbeat();
setInterval(sendHeartbeat, 1500);

function sendShutdownBeacon() {
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/shutdown");
  } else {
    fetch("/api/shutdown", { keepalive: true }).catch(() => {});
  }
}

window.addEventListener("pagehide", sendShutdownBeacon);
window.addEventListener("beforeunload", sendShutdownBeacon);

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  updateLanguageUI();
  setupViewportInteractions();
  setupKeyboardNavigation();
  setupEventListeners();
  loadImages();
});
