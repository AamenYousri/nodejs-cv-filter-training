const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==========================================
// 1. Define upload folder
// ==========================================

const uploadPath = "uploads/cvs";

// ==========================================
// 2. Create folder if it doesn't exist
// ==========================================

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

// ==========================================
// 3. Configure storage
// ==========================================

const storage = multer.diskStorage({
  // Where to save the file
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  // How to name the file
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

    const extension = path.extname(file.originalname);

    cb(null, uniqueName + extension);
  },
});

// ==========================================
// 4. Check file type
// ==========================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // PDF
    "application/pdf",

    // DOC
    "application/msword",

    // DOCX
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    // Accept file
    cb(null, true);
  } else {
    // Reject file
    cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
  }
};

// ==========================================
// 5. Create Multer upload configuration
// ==========================================

const upload = multer({
  storage: storage,

  fileFilter: fileFilter,

  limits: {
    // Maximum file size = 10 MB
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = upload;
