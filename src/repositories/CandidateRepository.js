const pool = require("../db/index");

class CandidateRepository {
  constructor(dbPool) {
    this.pool = dbPool;
  }
}

const findCandidateByEmail = async (email) => {

  const query = `
    SELECT
      c.id,
      c.name,
      c.email,
      cv.file_name

    FROM candidates c

    LEFT JOIN cv_files cv
      ON c.id = cv.candidate_id

    WHERE c.email = $1

    ORDER BY c.created_at DESC

    LIMIT 1
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0];

};
module.exports = new CandidateRepository(pool);