const express = require('express');

const upload = require('../middleware/multerMiddleware');

const {
  uploadCV
} = require('../controllers/cvController');


const router = express.Router();


// ==========================================
// Upload CV
// ==========================================

router.post(

  '/upload',

  upload.single('cv'),

  uploadCV

);


module.exports = router;