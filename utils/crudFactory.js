const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('./errorResponse');
const logActivity = require('./logActivity');

/**
 * Generates standard CRUD handlers (getAll, getOne, create, update, remove) for a given Mongoose model.
 * Use for simple modules (Skill, Experience, Education, Tool) that don't need file upload handling.
 *
 * @param {mongoose.Model} Model
 * @param {string} moduleName - human-readable name for activity logs (e.g. "Skill")
 * @param {object} options - { defaultSort, requiredFields }
 */
const createCrudController = (Model, moduleName, options = {}) => {
  const { defaultSort = { displayOrder: 1 }, requiredFields = [] } = options;

  const getAll = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    const items = await Model.find(filter).sort(defaultSort);
    res.status(200).json({ success: true, count: items.length, data: items });
  });

  const getOne = asyncHandler(async (req, res, next) => {
    const item = await Model.findById(req.params.id);
    if (!item) return next(new ErrorResponse(`${moduleName} not found`, 404));
    res.status(200).json({ success: true, data: item });
  });

  const create = asyncHandler(async (req, res, next) => {
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === '') {
        return next(new ErrorResponse(`${field} is required`, 400));
      }
    }
    const item = await Model.create(req.body);
    await logActivity('created', moduleName, `${moduleName} "${item.name || item.title || item.degree || item.company || item._id}" was created`);
    res.status(201).json({ success: true, data: item });
  });

  const update = asyncHandler(async (req, res, next) => {
    let item = await Model.findById(req.params.id);
    if (!item) return next(new ErrorResponse(`${moduleName} not found`, 404));

    item = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await logActivity('updated', moduleName, `${moduleName} "${item.name || item.title || item.degree || item.company || item._id}" was updated`);
    res.status(200).json({ success: true, data: item });
  });

  const remove = asyncHandler(async (req, res, next) => {
    const item = await Model.findById(req.params.id);
    if (!item) return next(new ErrorResponse(`${moduleName} not found`, 404));

    const label = item.name || item.title || item.degree || item.company || item._id;
    await item.deleteOne();
    await logActivity('deleted', moduleName, `${moduleName} "${label}" was deleted`);

    res.status(200).json({ success: true, data: {} });
  });

  const reorder = asyncHandler(async (req, res, next) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return next(new ErrorResponse('order must be an array of { id, displayOrder }', 400));
    }
    const bulkOps = order.map((o) => ({
      updateOne: { filter: { _id: o.id }, update: { $set: { displayOrder: o.displayOrder } } },
    }));
    if (bulkOps.length > 0) await Model.bulkWrite(bulkOps);

    const items = await Model.find().sort(defaultSort);
    res.status(200).json({ success: true, data: items });
  });

  return { getAll, getOne, create, update, remove, reorder };
};

module.exports = createCrudController;
