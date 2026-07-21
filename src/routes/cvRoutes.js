const express = require('express');
const router = express.Router();
const { getAllCVs, getCVById, createCV, updateCV, deleteCV } = require('../controllers/cvController');

router.get('/', getAllCVs);
router.get('/:id', getCVById);
router.post('/', createCV);
router.put('/:id', updateCV);
router.delete('/:id', deleteCV);

module.exports = router;
