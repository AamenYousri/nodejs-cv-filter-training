const pool = require('../db');

const getAllCVs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cvs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch CVs' });
  }
};

const getCVById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM cvs WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json(result.rows[0]);
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
    const result = await pool.query(
      `INSERT INTO cvs (name, email, phone, skills, experience)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, phone || null, skills || null, experience || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create CV' });
  }
};

const updateCV = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, skills, experience } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cvs SET name=$1, email=$2, phone=$3, skills=$4, experience=$5
       WHERE id=$6 RETURNING *`,
      [name, email, phone || null, skills || null, experience || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update CV' });
  }
};

const deleteCV = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cvs WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json({ message: 'CV deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete CV' });
  }
};

module.exports = { getAllCVs, getCVById, createCV, updateCV, deleteCV };
