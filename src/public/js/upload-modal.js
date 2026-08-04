const uploadModal = document.getElementById("uploadModal");
const fileInput = document.getElementById("cvFiles");
const selectedFiles = document.getElementById("selectedFiles");
const uploadButton = document.getElementById("uploadCvBtn");
const closeButton = document.getElementById("closeUploadModal");
const cancelButton = document.getElementById("cancelUploadBtn");
const statusMessage = document.getElementById("uploadStatus");

let isUploading = false;

function setStatus(message = "", isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function setUploading(uploading) {
  isUploading = uploading;
  uploadButton.disabled = uploading;
  closeButton.disabled = uploading;
  cancelButton.disabled = uploading;
  uploadButton.classList.toggle("is-loading", uploading);
  uploadButton.querySelector(".button-label").textContent = uploading ? "Uploading..." : "Upload CVs";
}

function closeModal() {
  if (!isUploading) uploadModal.classList.remove("show");
}

function resetFiles() {
  fileInput.value = "";
  selectedFiles.innerHTML = "";
  setStatus();
}

document.addEventListener("open-upload-modal", () => {
  resetFiles();
  uploadModal.classList.add("show");
  fileInput.focus();
});

closeButton.addEventListener("click", closeModal);
cancelButton.addEventListener("click", closeModal);

uploadModal.addEventListener("click", (event) => {
  if (event.target === uploadModal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && uploadModal.classList.contains("show")) closeModal();
});

fileInput.addEventListener("change", () => {
  selectedFiles.innerHTML = "";
  setStatus();

  [...fileInput.files].forEach((file) => {
    const item = document.createElement("div");
    item.className = "file-item";
    item.textContent = file.name;
    selectedFiles.appendChild(item);
  });
});

uploadButton.addEventListener("click", async () => {
  const files = fileInput.files;
  if (!files.length) {
    setStatus("Choose at least one CV before uploading.", true);
    fileInput.focus();
    return;
  }

  const formData = new FormData();
  [...files].forEach((file) => formData.append("cv", file));

  try {
    setUploading(true);
    setStatus(`Uploading ${files.length} ${files.length === 1 ? "file" : "files"}. This may take a moment.`);

    const token = window.TokenStorage?.get();
    const response = await fetch("/api/cv/upload", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || result.message || "Upload failed. Please try again.");

    uploadModal.classList.remove("show");
    resetFiles();
    if (window.loadCandidates) await window.loadCandidates();
  } catch (error) {
    setStatus(error.message || "Upload failed. Please try again.", true);
  } finally {
    setUploading(false);
  }
});
