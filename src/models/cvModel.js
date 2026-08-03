const pool = require('../db/index');


// ======================================================
// Get CV Library
// ======================================================

const getLibraryCVs = async ({
  search,
  status,
  from_date,
  to_date
}) => {

  let query = `
    SELECT
      cv.id,
      cv.candidate_id,
      cv.file_path,
      cv.file_name,
      cv.uploaded_by,
      cv.uploaded_at,

      c.name,
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


  // ======================================================
  // Search
  // ======================================================

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


  // ======================================================
  // Status
  // ======================================================

  if (status) {

    query += `
      AND c.status = $${parameterIndex}
    `;

    values.push(status);

    parameterIndex++;

  }


  // ======================================================
  // From Date
  // ======================================================

  if (from_date) {

    query += `
      AND cv.uploaded_at >= $${parameterIndex}::DATE
    `;

    values.push(from_date);

    parameterIndex++;

  }


  // ======================================================
  // To Date
  // ======================================================

  if (to_date) {

    query += `
      AND cv.uploaded_at < ($${parameterIndex}::DATE + INTERVAL '1 day')
    `;

    values.push(to_date);

    parameterIndex++;

  }


  // ======================================================
  // Sort
  // ======================================================

  query += `
    ORDER BY cv.uploaded_at DESC
  `;


  const result = await pool.query(
    query,
    values
  );


  return result.rows;

};


module.exports = {
  getLibraryCVs
};