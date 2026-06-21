const createCrudController = require('../utils/crudFactory');
const Experience = require('../models/Experience');

const controller = createCrudController(Experience, 'Experience', {
  defaultSort: { startDate: -1 },
  requiredFields: ['company', 'position', 'startDate'],
});

module.exports = controller;
