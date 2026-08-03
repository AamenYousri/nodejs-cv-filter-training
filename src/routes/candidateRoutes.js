const express = require('express');
const protect = require("../middleware/authMiddleware");

const {
  getAllCandidates
} = require('../controllers/candidateController');


const router = express.Router();


router.get(
  '/', protect,
  getAllCandidates
);


module.exports = router;