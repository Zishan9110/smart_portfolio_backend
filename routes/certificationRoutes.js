const express = require('express');
const router = express.Router();
const {
  getCertifications,
  getCertification,
  createCertification,
  updateCertification,
  deleteCertification,
} = require('../controllers/certificationController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/', getCertifications);
router.get('/:id', getCertification);
router.post('/', protect, authorize('admin'), uploadImage.single('image'), createCertification);
router.put('/:id', protect, authorize('admin'), uploadImage.single('image'), updateCertification);
router.delete('/:id', protect, authorize('admin'), deleteCertification);

module.exports = router;
