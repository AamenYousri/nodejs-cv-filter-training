const pool = require('../db/index');


// ======================================================
// Get Candidates
// ======================================================

const getCandidates = async ({
  search,
  skills,
  city,
  job_title,
  min_experience,
  max_experience
}) => {

  let query = `
    SELECT
      c.id,
      c.name,
      c.email,
      c.city,
      c.job_title,
      c.years_of_experience,
      c.skills,
      c.status,
      c.created_at,

      cv.id AS cv_id,
      cv.file_name,
      cv.file_path,
      cv.uploaded_at

    FROM candidates c

    LEFT JOIN cv_files cv
      ON c.id = cv.candidate_id

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
      )
    `;

    values.push(`%${search}%`);

    parameterIndex++;

  }


  // ======================================================
  // Multiple Skills
  // ======================================================

  if (
    Array.isArray(skills) &&
    skills.length > 0
  ) {

    query += `
      AND c.skills && $${parameterIndex}::TEXT[]
    `;

    values.push(skills);

    parameterIndex++;

  }


  // ======================================================
  // City
  // ======================================================

  if (city) {

    query += `
      AND c.city ILIKE $${parameterIndex}
    `;

    values.push(`%${city}%`);

    parameterIndex++;

  }


  // ======================================================
  // Job Title
  // ======================================================

  if (job_title) {

    query += `
      AND c.job_title ILIKE $${parameterIndex}
    `;

    values.push(`%${job_title}%`);

    parameterIndex++;

  }


  // ======================================================
  // Minimum Experience
  // ======================================================

  if (
    min_experience !== undefined &&
    min_experience !== ''
  ) {

    query += `
      AND c.years_of_experience >= $${parameterIndex}
    `;

    values.push(
      Number(min_experience)
    );

    parameterIndex++;

  }


  // ======================================================
  // Maximum Experience
  // ======================================================

  if (
    max_experience !== undefined &&
    max_experience !== ''
  ) {

    query += `
      AND c.years_of_experience <= $${parameterIndex}
    `;

    values.push(
      Number(max_experience)
    );

    parameterIndex++;

  }


  // ======================================================
  // Order
  // ======================================================

  query += `
    ORDER BY c.created_at DESC
  `;


  const result = await pool.query(
    query,
    values
  );


  return result.rows;

};


module.exports = {
  getCandidates
};