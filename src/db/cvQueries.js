const pool = require('./index');

const getAllCVs = async () => {
  const result = await pool.query('SELECT * FROM cvs ORDER BY created_at DESC');
  return result.rows;
};

const getCVById = async (id) => {
  const result = await pool.query('SELECT * FROM cvs WHERE id = $1', [id]);
  return result.rows[0];
};

const createCV = async (name, email, phone, skills, experience) => {
  const result = await pool.query(
    `INSERT INTO cvs (name, email, phone, skills, experience)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, email, phone || null, skills || null, experience || null]
  );
  return result.rows[0];
};

const updateCV = async (id, name, email, phone, skills, experience) => {
  const result = await pool.query(
    `UPDATE cvs SET name=$1, email=$2, phone=$3, skills=$4, experience=$5
     WHERE id=$6 RETURNING *`,
    [name, email, phone || null, skills || null, experience || null, id]
  );
  return result.rows[0];
};

const deleteCV = async (id) => {
  const result = await pool.query('DELETE FROM cvs WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
};

module.exports = { getAllCVs, getCVById, createCV, updateCV, deleteCV };
