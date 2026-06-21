const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  deleteProjectImage,
  reorderProjects,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/', getProjects);

// Static path must be registered before the dynamic '/:id' path
router.put('/reorder', protect, authorize('admin'), reorderProjects);

router.get('/:id', getProject);
router.post('/', protect, authorize('admin'), uploadImage.array('images', 10), createProject);
router.put('/:id', protect, authorize('admin'), uploadImage.array('images', 10), updateProject);
router.delete('/:id', protect, authorize('admin'), deleteProject);
router.delete('/:id/images/:imageId', protect, authorize('admin'), deleteProjectImage);

module.exports = router;
