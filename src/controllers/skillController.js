const {
  searchSkills
} = require('../models/skillModel');


// ======================================================
// Search Skills
// ======================================================

const getSkills = async (req, res) => {

  try {

    const {
      search
    } = req.query;


    const skills =
      searchSkills(search);


    return res.status(200).json({

      success: true,

      count: skills.length,

      skills

    });


  } catch (error) {

    console.error(
      'Skills Search Error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to search skills',

      error:
        error.message

    });

  }

};


module.exports = {
  getSkills
};