const uploadModal = document.getElementById("uploadModal");

document.addEventListener("open-upload-modal", () => {
    uploadModal.classList.add("show");
});

document
    .getElementById("closeUploadModal")
    .addEventListener("click", () => {
        uploadModal.classList.remove("show");
    });

uploadModal.addEventListener("click", (e) => {
    if (e.target === uploadModal) {
        uploadModal.classList.remove("show");
    }
});


const fileInput = document.getElementById("cvFiles");
const selectedFiles = document.getElementById("selectedFiles");

fileInput.addEventListener("change", () => {

    selectedFiles.innerHTML = "";

    [...fileInput.files].forEach(file => {

        const div = document.createElement("div");

        div.className = "file-item";
        div.textContent = file.name;

        selectedFiles.appendChild(div);

    });

});


document
    .getElementById("uploadCvBtn")
    .addEventListener("click", async () => {

        const files = fileInput.files;

        if (!files.length) {
            alert("Select at least one CV.");
            return;
        }

        const formData = new FormData();

        [...files].forEach(file => {
            formData.append("cv", file);
        });

        const token = window.TokenStorage.get();

        const response = await fetch("/api/cv/upload", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData,
            
        });

        const result = await response.json();

        console.log(result);

        uploadModal.classList.remove("show");

        fileInput.value = "";
        selectedFiles.innerHTML = "";
        
        if (window.loadCandidates) {
            window.loadCandidates();
        }

    });