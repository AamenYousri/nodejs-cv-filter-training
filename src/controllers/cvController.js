const pool = require("../db/index");
const extractCvData = require("./cvDataExtraction/cvData");

const uploadCV = async (req, res) => {
  // Start database transaction
  const client = await pool.connect();

  try {
    // =====================================
    // 1. Check CV files
    // =====================================

    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload one or more CV files",
      });
    }

    // =====================================
    // 2. Get uploaded user
    // =====================================

    const uploaded_by = req.user.id;

    if (!uploaded_by) {
      return res.status(400).json({
        success: false,
        message: "uploaded_by is required",
      });
    }

    // =====================================
    // 3. Validate uploader exists
    // =====================================

    const uploaderResult = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [uploaded_by],
    );

    if (uploaderResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "uploaded_by user not found",
      });
    }

    // =====================================
    // 4. Start transaction
    // =====================================

    await client.query("BEGIN");

    const createdCandidates = [];
    const createdCVs = [];

    for (const file of files) {
      // =====================================
      // 4. Create candidate automatically
      // =====================================

      const cvData = await extractCvData(file.path);

      const candidateResult = await client.query(
        `
        INSERT INTO candidates
        (
          name,
          email,
          created_by,
          job_title,
          city,
          years_of_experience,
          skills
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
        RETURNING *
        `,
        [
          cvData.name,
          cvData.email,
          uploaded_by,
          cvData.jobTitle ? cvData.jobTitle.raw : null,
          cvData.city,
          String(Math.floor(cvData.yearsOfExperience)),
          cvData.skills,
        ],
      );

      const candidate = candidateResult.rows[0];

      // =====================================
      // 5. Add CV information
      // =====================================

      const cvResult = await client.query(
        `
        INSERT INTO cv_files
        (
          candidate_id,
          file_path,
          file_name,
          uploaded_by
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4
        )
        RETURNING *
        `,
        [candidate.id, file.path, file.originalname, uploaded_by],
      );

      createdCandidates.push(candidate);
      createdCVs.push(cvResult.rows[0]);
    }

    // =====================================
    // 6. Commit transaction
    // =====================================

    await client.query("COMMIT");

    // =====================================
    // 7. Return success
    // =====================================

    return res.status(201).json({
      success: true,
      message: `${files.length} CV${files.length === 1 ? "" : "s"} uploaded and candidate${files.length === 1 ? "" : "s"} created successfully`,
      candidates: createdCandidates,
      cvs: createdCVs,
    });
  } catch (error) {
    // =====================================
    // Rollback if error
    // =====================================

    await client.query("ROLLBACK");

    console.error("CV Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload CV",
      error: error.message,
    });
  } finally {
    // Release database connection
    client.release();
  }
};

const { getLibraryCVs } = require("../models/cvModel");

// ======================================================
// Get CV Library
// ======================================================

const getAllLibraryCVs = async (req, res) => {
  try {
    const { search, status, from_date, to_date } = req.query;

    const cvs = await getLibraryCVs({
      search,

      status,

      from_date,

      to_date,
    });

    return res.status(200).json({
      success: true,

      count: cvs.length,

      cvs,
    });
  } catch (error) {
    console.error("Library Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to get CV library",

      error: error.message,
    });
  }
};

module.exports = {
  uploadCV,
  getAllLibraryCVs,
};

