const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidateController");

const getCandidatesHandler =
  typeof candidateController.getAllCandidates === "function"
    ? candidateController.getAllCandidates
    : (req, res) => {
        res.status(501).json({ success: false, message: "getAllCandidates is not implemented yet." });
      };

const deleteCandidateHandler =
  typeof candidateController.deleteCandidate === "function"
    ? candidateController.deleteCandidate
    : (req, res) => {
        res.status(501).json({ success: false, message: "deleteCandidate is not implemented yet." });
      };

router.get("/", getCandidatesHandler);
router.delete("/:id", deleteCandidateHandler);

module.exports = router;