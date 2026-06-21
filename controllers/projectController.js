const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Project = require('../models/Project');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const logActivity = require('../utils/logActivity');

// @desc    Get all projects (search, filter, sort, pagination)
// @route   GET /api/projects
// @access  Public
// Query params: search, category, featured, sortBy, order, page, limit
exports.getProjects = asyncHandler(async (req, res) => {
  const { search, category, featured, sortBy, order, page = 1, limit = 12 } = req.query;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }
  if (category) {
    query.category = category;
  }
  if (featured !== undefined) {
    query.featured = featured === 'true';
  }

  const sortField = sortBy || 'displayOrder';
  const sortOrder = order === 'desc' ? -1 : 1;
  const sortOptions = { [sortField]: sortOrder };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 12, 1);
  const skip = (pageNum - 1) * limitNum;

  const [projects, total] = await Promise.all([
    Project.find(query).sort(sortOptions).skip(skip).limit(limitNum),
    Project.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: projects.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: projects,
  });
});

// @desc    Get single project by ID (also increments view count)
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorResponse('Project not found', 404));

  project.views += 1;
  await project.save();

  res.status(200).json({ success: true, data: project });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = asyncHandler(async (req, res, next) => {
  const { title, description, category, technologies, githubLink, liveLink, featured, displayOrder } =
    req.body;

  if (!title || !description) {
    return next(new ErrorResponse('Title and description are required', 400));
  }

  let parsedTechnologies = technologies;
  if (typeof technologies === 'string') {
    try {
      parsedTechnologies = JSON.parse(technologies);
    } catch {
      parsedTechnologies = technologies.split(',').map((t) => t.trim());
    }
  }

  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'projects');
      images.push({ url: result.url, public_id: result.public_id });
    }
  }

  const project = await Project.create({
    title,
    description,
    category,
    technologies: parsedTechnologies || [],
    githubLink,
    liveLink,
    images,
    featured: featured === 'true' || featured === true,
    displayOrder: displayOrder || 0,
  });

  await logActivity('created', 'Project', `Project "${project.title}" was created`);

  res.status(201).json({ success: true, data: project });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorResponse('Project not found', 404));

  const { title, description, category, technologies, githubLink, liveLink, featured, displayOrder } =
    req.body;

  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  if (category !== undefined) project.category = category;
  if (githubLink !== undefined) project.githubLink = githubLink;
  if (liveLink !== undefined) project.liveLink = liveLink;
  if (featured !== undefined) project.featured = featured === 'true' || featured === true;
  if (displayOrder !== undefined) project.displayOrder = displayOrder;

  if (technologies !== undefined) {
    let parsedTechnologies = technologies;
    if (typeof technologies === 'string') {
      try {
        parsedTechnologies = JSON.parse(technologies);
      } catch {
        parsedTechnologies = technologies.split(',').map((t) => t.trim());
      }
    }
    project.technologies = parsedTechnologies;
  }

  // Append new images if uploaded
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'projects');
      project.images.push({ url: result.url, public_id: result.public_id });
    }
  }

  await project.save();
  await logActivity('updated', 'Project', `Project "${project.title}" was updated`);

  res.status(200).json({ success: true, data: project });
});

// @desc    Delete a single image from a project
// @route   DELETE /api/projects/:id/images/:imageId
// @access  Private/Admin
exports.deleteProjectImage = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorResponse('Project not found', 404));

  const image = project.images.id(req.params.imageId);
  if (!image) return next(new ErrorResponse('Image not found', 404));

  await deleteFromCloudinary(image.public_id);
  image.deleteOne();
  await project.save();

  res.status(200).json({ success: true, data: project });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorResponse('Project not found', 404));

  for (const image of project.images) {
    await deleteFromCloudinary(image.public_id);
  }

  await project.deleteOne();
  await logActivity('deleted', 'Project', `Project "${project.title}" was deleted`);

  res.status(200).json({ success: true, data: {} });
});

// @desc    Reorder projects (drag & drop)
// @route   PUT /api/projects/reorder
// @access  Private/Admin
// Body: { order: [{ id, displayOrder }, ...] }
exports.reorderProjects = asyncHandler(async (req, res, next) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return next(new ErrorResponse('order must be an array of { id, displayOrder }', 400));
  }

  const bulkOps = order.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { displayOrder: item.displayOrder } },
    },
  }));

  if (bulkOps.length > 0) {
    await Project.bulkWrite(bulkOps);
  }

  const projects = await Project.find().sort({ displayOrder: 1 });
  res.status(200).json({ success: true, data: projects });
});
