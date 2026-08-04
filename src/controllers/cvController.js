const pool = require("../db/index");
const extractCvData = require("./cvDataExtraction/cvData");
const { findCandidateByEmail } = require("../models/candidateModel");

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
    // Check for duplicates BEFORE starting transaction
    // =====================================

    const confirmReplace =
      req.body.confirmReplace === "true" || req.body.confirmReplace === true;
    const duplicates = []; 
      const extractedDataList = [];

    for (const file of files) {
      const cvData = await extractCvData(file.path);
      extractedDataList.push({ file, cvData });

      if (cvData.email) {
        const existing = await findCandidateByEmail(cvData.email);

        if (existing && !confirmReplace) {
          duplicates.push({
            fileName: file.originalname,
            existingCandidateId: existing.id,
            existingCandidateName: existing.name,
            existingFileName: existing.file_name,
          });
        }
      }
    }

    if (duplicates.length > 0) {
      return res.status(409).json({
        success: false,
        message: "One or more candidates already exist",
        duplicates,
      });
    }

    // =====================================
    // 4. Start transaction
    // =====================================

    await client.query("BEGIN");

    const createdCandidates = [];
    const createdCVs = [];
    let replacedCount = 0;

for (const { file, cvData } of extractedDataList) {
  // =====================================
  // 4. Create candidate automatically
  // (البيانات already مستخرجة من فوق، مش محتاجين نستخرجها تاني)
  // =====================================

  if (cvData.email && confirmReplace) {
        const existing = await findCandidateByEmail(cvData.email);
        if (existing) {
          await client.query("DELETE FROM candidates WHERE id = $1", [
            existing.id,
          ]);
          replacedCount++;
        }
      }
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
    const newCount = files.length - replacedCount;
    let message = "";

    if (replacedCount > 0 && newCount > 0) {
      message = `${newCount} new CV${newCount === 1 ? "" : "s"} uploaded, ${replacedCount} existing CV${replacedCount === 1 ? "" : "s"} replaced`;
    } else if (replacedCount > 0) {
      message = `${replacedCount} CV${replacedCount === 1 ? "" : "s"} replaced successfully`;
    } else {
      message = `${files.length} CV${files.length === 1 ? "" : "s"} uploaded and candidate${files.length === 1 ? "" : "s"} created successfully`;
    }

    return res.status(201).json({
      success: true,
      message,
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
