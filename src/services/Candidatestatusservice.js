// ======================================================
// CandidateStatusService
// ------------------------------------------------------
// Responsibility (SRP): business logic for changing a
// candidate's status. Knows NOTHING about SQL — it only
// knows it has a "repository" with findById/updateStatus.
// ======================================================

// The only 4 values allowed anywhere in the app.
// Single source of truth: if a 5th status is ever added,
// this is the only line that needs to change.
const ALLOWED_STATUSES = ["Review", "Accepted", "Rejected", "Done"];

class CandidateStatusService {
  constructor(candidateStatusRepository) {
    this.candidateStatusRepository = candidateStatusRepository;
  }

  // ====================================================
  // updateStatus
  // ----------------------------------------------------
  // Validates everything BEFORE touching the database:
  // 1) Is newStatus one of the 4 allowed values?
  // 2) Does the candidate actually exist?
  // Throws a typed error the Controller can translate
  // into the right HTTP status code.
  // ====================================================
  async updateStatus(candidateId, newStatus) {
    // --------------------------------------------------
    // 1) Validate the requested status value
    // --------------------------------------------------
    if (!ALLOWED_STATUSES.includes(newStatus)) {
      const error = new Error(
        `Invalid status "${newStatus}". Allowed values: ${ALLOWED_STATUSES.join(", ")}`
      );
      error.statusCode = 400;
      throw error;
    }

    // --------------------------------------------------
    // 2) Make sure the candidate exists
    // --------------------------------------------------
    const candidate = await this.candidateStatusRepository.findById(candidateId);

    if (!candidate) {
      const error = new Error(`Candidate with id ${candidateId} not found`);
      error.statusCode = 404;
      throw error;
    }

    // --------------------------------------------------
    // 3) Perform the update
    // --------------------------------------------------
    const updatedCandidate = await this.candidateStatusRepository.updateStatus(
      candidateId,
      newStatus
    );

    return updatedCandidate;
  }
}

module.exports = CandidateStatusService;