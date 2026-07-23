const cvQueries = require('../db/cvQueries');

const getAllCVs = async (req, res) => {
  try {
    const cvs = await cvQueries.getAllCVs();
    res.json(cvs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch CVs' });
  }
};

const getCVById = async (req, res) => {
  const { id } = req.params;
  try {
    const cv = await cvQueries.getCVById(id);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json(cv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch CV' });
  }
};

const createCV = async (req, res) => {
  const { name, email, phone, skills, experience } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  try {
    const cv = await cvQueries.createCV(name, email, phone, skills, experience);
    res.status(201).json(cv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create CV' });
  }
};

const updateCV = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, skills, experience } = req.body;
  try {
    const cv = await cvQueries.updateCV(id, name, email, phone, skills, experience);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json(cv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update CV' });
  }
};

const deleteCV = async (req, res) => {
  const { id } = req.params;
  try {
    const cv = await cvQueries.deleteCV(id);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json({ message: 'CV deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete CV' });
  }
};

module.exports = { getAllCVs, getCVById, createCV, updateCV, deleteCV };
