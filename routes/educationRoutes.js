const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove, reorder } = require('../controllers/educationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAll);
router.put('/reorder', protect, authorize('admin'), reorder);
router.get('/:id', getOne);
router.post('/', protect, authorize('admin'), create);
router.put('/:id', protect, authorize('admin'), update);
router.delete('/:id', protect, authorize('admin'), remove);

module.exports = router;
