const express = require("express");

const upload = require("../middleware/multerMiddleware");
const protect = require("../middleware/authMiddleware");
const { uploadCV } = require("../controllers/cvController");
const extractCvData = require("../controllers/cvDataExtraction/cvData");

const router = express.Router();

// ==========================================
// Upload CVs
// ==========================================

router.post(
  "/upload",

  protect, // Ensure the user is authenticated

  upload.array("cv", 150),

  uploadCV,
);

router.post("/extract", protect, async (req, res) => {
  try {
    const { filePath } = req.body || {};

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: "Missing filePath in request body.",
      });
    }

    const cvData = await extractCvData(filePath);
    return res.json({ success: true, data: cvData });
  } catch (error) {
    console.error("Error extracting CV data:", error);
    return res.status(500).json({ success: false, message: "Error extracting CV data" });
  }
});

module.exports = router;
