const express = require('express');
const {
  createComplaint,
  getUserComplaints,
  getComplaint,
  searchComplaints
} = require('../controllers/complaintController');
const { getImage, deleteImage } = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const handleUpload = require('../middleware/upload');
const { validateComplaint, checkValidation } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(auth);

// Create a new complaint with image upload
router.post('/', 
  handleUpload, 
  validateComplaint, 
  checkValidation, 
  createComplaint
);

// Get all complaints for user
router.get('/', getUserComplaints);

// Get a specific complaint
router.get('/:id', getComplaint);

// Search complaints
router.get('/search', searchComplaints);

// Get complaint image
router.get('/images/:filename', getImage);

// Delete complaint image
router.delete('/:complaintId/images/:filename', deleteImage);

module.exports = router;