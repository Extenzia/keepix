const checkbox = document.getElementById("alwaysShow");

chrome.storage.sync.get("alwaysShow", (data) => {
  checkbox.checked = !!data.alwaysShow;
});

checkbox.addEventListener("change", () => {
  chrome.storage.sync.set({ alwaysShow: checkbox.checked });
});
