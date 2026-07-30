const express = require("express");

const upload = require("../middleware/multerMiddleware");

const { uploadCV } = require("../controllers/cvController");

const router = express.Router();

// ==========================================
// Upload CVs
// ==========================================

router.post(
  "/upload",

  upload.array("cv", 150),

  uploadCV,
);

module.exports = router;
