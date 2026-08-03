console.log("CV routes loaded")

const express = require("express");
const upload = require("../middleware/multerMiddleware");
const protect = require("../middleware/authMiddleware");
const { uploadCV } = require("../controllers/cvController");
const extractCvData = require("../controllers/cvDataExtraction/cvData");
const cvLibraryController = require("../controllers/cvLibraryController");
const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.array("cv", 150),
  uploadCV,
);

// ======================================================
// GET /api/cvs/library
// ------------------------------------------------------
// Returns the CV Library table data (filename, document
// type, candidate name, status, date...). All the logic
// lives in CvLibraryController -> Service -> Repository.
// ======================================================
router.get("/library", (req, res, next) => {
  console.log("Library route hit!");
  next();
}, protect, cvLibraryController.getLibrary);

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