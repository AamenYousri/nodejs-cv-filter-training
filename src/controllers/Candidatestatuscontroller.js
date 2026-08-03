const pool = require("../db/index");
const CandidateStatusRepository = require("../repositories/CandidateStatusRepository");
const CandidateStatusService = require("../services/CandidateStatusService");

// ======================================================
// CandidateStatusController
// ------------------------------------------------------
// Responsibility (SRP): HTTP layer only.
// - Reads candidateId from the URL and newStatus from the body
// - Calls the service
// - Translates thrown errors (statusCode) into HTTP responses
// ======================================================

class CandidateStatusController {
  constructor(candidateStatusService) {
    this.candidateStatusService = candidateStatusService;

    this.updateStatus = this.updateStatus.bind(this);
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "status is required in the request body",
        });
      }

      const updatedCandidate = await this.candidateStatusService.updateStatus(
        id,
        status
      );

      return res.status(200).json({
        success: true,
        message: "Status updated successfully",
        candidate: updatedCandidate,
      });
    } catch (error) {
      // --------------------------------------------------
      // The Service throws errors with a statusCode (400 for
      // invalid status, 404 for candidate not found). Any
      // other error falls back to 500.
      // --------------------------------------------------
      const statusCode = error.statusCode || 500;

      if (statusCode === 500) {
        console.error("Update Candidate Status Error:", error);
      }

      return res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update candidate status",
      });
    }
  }
}

// ======================================================
// Composition Root
// ======================================================

const candidateStatusRepository = new CandidateStatusRepository(pool);
const candidateStatusService = new CandidateStatusService(candidateStatusRepository);
const candidateStatusController = new CandidateStatusController(candidateStatusService);

module.exports = candidateStatusController;