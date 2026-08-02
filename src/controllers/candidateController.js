const {
  getCandidates
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


module.exports = {
  getAllCandidates
};