// ======================================================
// CandidateStatusRepository
// ------------------------------------------------------
// Responsibility (SRP): talk to the database ONLY, for
// everything related to a candidate's status.
// - No validation here (e.g. "is this a valid status?").
// - No knowledge of which statuses are allowed.
// That logic belongs to the Service layer.
// ======================================================

class CandidateStatusRepository {
  constructor(pool) {
    this.pool = pool;
  }

  // ====================================================
  // findById
  // ----------------------------------------------------
  // Used by the Service to check the candidate exists
  // before attempting an update.
  // ====================================================
  async findById(candidateId) {
    const query = `
      SELECT id, status
      FROM candidates
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [candidateId]);

    return result.rows[0] || null;
  }

  // ====================================================
  // updateStatus
  // ----------------------------------------------------
  // Sets the new status and returns the updated row.
  // ====================================================
  async updateStatus(candidateId, newStatus) {
    const query = `
      UPDATE candidates
      SET status = $1
      WHERE id = $2
      RETURNING id, name, status
    `;

    const result = await this.pool.query(query, [newStatus, candidateId]);

    return result.rows[0] || null;
  }
}

module.exports = CandidateStatusRepository;