let alwaysShow = false;

function updateSettings() {
  chrome.storage.sync.get("alwaysShow", (data) => {
    alwaysShow = !!data.alwaysShow;
    document.querySelectorAll(".media-overlay, .media-download-btn").forEach(el => el.remove());
    initOverlays();
  });
}

chrome.storage.onChanged.addListener(updateSettings);

function createOverlay(el, type) {
  const label = document.createElement("div");
  label.className = "media-overlay";

  const updateText = () => {
    const w = type === "img" ? el.naturalWidth : el.videoWidth;
    const h = type === "img" ? el.naturalHeight : el.videoHeight;
    label.textContent = `${w}×${h}`;
  };

  updateText();
  document.body.appendChild(label);

  const position = () => {
    const rect = el.getBoundingClientRect();
    label.style.top = `${window.scrollY + rect.top + 5}px`;
    label.style.left = `${window.scrollX + rect.left + 5}px`;
  };

  position();
  window.addEventListener("scroll", position);
  window.addEventListener("resize", position);

  if (!alwaysShow) {
    label.style.display = "none";
    el.addEventListener("mouseenter", () => label.style.display = "block");
    el.addEventListener("mouseleave", () => label.style.display = "none");
  }

  const observer = new ResizeObserver(() => {
    updateText();
    position();
  });
  observer.observe(el);

  return label;
}

function createDownloadButton(el) {  
  const btn = document.createElement("button");
  btn.textContent = "⬇️";
  btn.className = "media-download-btn";
  document.body.appendChild(btn);

  const position = () => {
    const rect = el.getBoundingClientRect();
    btn.style.top = `${window.scrollY + rect.top + 5}px`;
    btn.style.left = `${window.scrollX + rect.right - 30}px`;
  };

  position();
  window.addEventListener("scroll", position);
  window.addEventListener("resize", position);

  btn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = el.currentSrc || el.src;
    const filename = url.split("/").pop().split("?")[0];
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "media";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return btn;
}

function attachOverlay(el, type) {
  if (el.dataset.overlayAttached === "true") return;
  el.dataset.overlayAttached = "true";

  const overlay = createOverlay(el, type);

  const btn = createDownloadButton(el);

  if (!alwaysShow) {
    btn.style.display = "none";
    el.addEventListener("mouseenter", () => btn.style.display = "block");
    el.addEventListener("mouseleave", () => btn.style.display = "none");
  }
}

function initOverlays() {
  document.querySelectorAll("img").forEach((img) => {

    if(img.getBoundingClientRect().height < 250 || img.getBoundingClientRect().width < 250){
      console.log("image too small");
      return;
    }

    if (img.complete){
      attachOverlay(img, "img");
    } 
    else {
      img.onload = () => attachOverlay(img, "img");
    } 

  });

  document.querySelectorAll("video").forEach((vid) => {
    if (vid.readyState >= 1) attachOverlay(vid, "video");
    else vid.onloadedmetadata = () => attachOverlay(vid, "video");
  });
}

// Watch for new images/videos
const observer = new MutationObserver(() => {
  initOverlays();
});
observer.observe(document.body, { childList: true, subtree: true });

updateSettings(); // initial load
