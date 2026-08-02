const {
  getCandidates,
  deleteCandidateById
} = require('../models/candidateModel');


// ======================================================
// Get Candidates
// ======================================================

const getAllCandidates = async (req, res) => {

  try {

    const {
      search,
      city,
      job_title,
      min_experience,
      max_experience
    } = req.query;


    // ==================================================
    // Multiple Skills
    // ==================================================

    let skills = req.query.skills;


    if (skills) {

      if (!Array.isArray(skills)) {

        skills = [skills];

      }

    } else {

      skills = [];

    }


    // ==================================================
    // Get Candidates
    // ==================================================

    const candidates =
      await getCandidates({

        search,

        skills,

        city,

        job_title,

        min_experience,

        max_experience

      });


    return res.status(200).json({

      success: true,

      count: candidates.length,

      candidates

    });


  } catch (error) {

    console.error(
      'Candidates Error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to get candidates',

      error:
        error.message

    });

  }

};


// ======================================================
// Delete Candidate
// ======================================================

const deleteCandidate = async (req, res) => {

  try {

    const { id } = req.params;

    const deleted = await deleteCandidateById(id);

    if (!deleted) {

      return res.status(404).json({

        success: false,

        message: 'Candidate not found'

      });

    }

    return res.status(200).json({

      success: true,

      message: 'Candidate deleted successfully'

    });

  } catch (error) {

    console.error(
      'Delete Candidate Error:',
      error
    );

    return res.status(500).json({

      success: false,

      message: 'Failed to delete candidate',

      error: error.message

    });

  }

};


module.exports = {
  getAllCandidates,
  deleteCandidate
};