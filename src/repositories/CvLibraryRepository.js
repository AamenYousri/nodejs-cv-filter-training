// ======================================================
// CvLibraryRepository
// ------------------------------------------------------
// Responsibility (SRP): talk to the database ONLY.
// - No business logic here (no "document type" derivation,
//   no response shaping, no validation).
// - Receives its DB connection via constructor (Dependency
//   Injection) instead of requiring the pool itself, so it
//   can be unit-tested with a fake/mock pool later.
// ======================================================

class CvLibraryRepository {
  constructor(pool) {
    this.pool = pool;
  }

  // ====================================================
  // findAll
  // ----------------------------------------------------
  // Joins cv_files with candidates and returns raw rows.
  // Accepts optional filters: search, status, from_date, to_date
  // ====================================================
  async findAll({ search, status, from_date, to_date } = {}) {
    let query = `
      SELECT
        cv.id,
        cv.candidate_id,
        cv.file_path,
        cv.file_name,
        cv.uploaded_by,
        cv.uploaded_at,

        c.name AS candidate_name,
        c.email,
        c.city,
        c.job_title,
        c.years_of_experience,
        c.skills,
        c.status

      FROM cv_files cv

      JOIN candidates c
        ON cv.candidate_id = c.id

      WHERE 1 = 1
    `;

    const values = [];
    let parameterIndex = 1;

    // --------------------------------------------------
    // Search (candidate name, email, or file name)
    // --------------------------------------------------
    if (search) {
      query += `
        AND (
          c.name ILIKE $${parameterIndex}
          OR c.email ILIKE $${parameterIndex}
          OR cv.file_name ILIKE $${parameterIndex}
        )
      `;
      values.push(`%${search}%`);
      parameterIndex++;
    }

    // --------------------------------------------------
    // Status
    // --------------------------------------------------
    if (status) {
      query += `
        AND c.status = $${parameterIndex}
      `;
      values.push(status);
      parameterIndex++;
    }

    // --------------------------------------------------
    // From Date
    // --------------------------------------------------
    if (from_date) {
      query += `
        AND cv.uploaded_at >= $${parameterIndex}::DATE
      `;
      values.push(from_date);
      parameterIndex++;
    }

    // --------------------------------------------------
    // To Date
    // --------------------------------------------------
    if (to_date) {
      query += `
        AND cv.uploaded_at < ($${parameterIndex}::DATE + INTERVAL '1 day')
      `;
      values.push(to_date);
      parameterIndex++;
    }

    query += `
      ORDER BY cv.uploaded_at DESC
    `;

    const result = await this.pool.query(query, values);

    return result.rows;
  }
}

module.exports = CvLibraryRepository;