const Fuse = require('fuse.js');

const {
  CONSTANT_SKILLS
} = require('../constants/skills');


// ======================================================
// Fuse.js Configuration
// ======================================================

const fuse = new Fuse(

  CONSTANT_SKILLS.map(skill => ({
    name: skill
  })),

  {
    keys: ['name'],

    threshold: 0.3,

    distance: 100,

    minMatchCharLength: 1,

    includeScore: true

  }

);


// ======================================================
// Search Skills
// ======================================================

const searchSkills = (search) => {

  // Return all skills if no search
  if (!search) {

    return CONSTANT_SKILLS;

  }


  // Fuse fuzzy search

  const results = fuse.search(search);


  // Return skill names

  return results.map(
    result => result.item.name
  );

};


module.exports = {
  searchSkills
};