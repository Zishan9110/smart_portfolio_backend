const createCrudController = require('../utils/crudFactory');
const Tool = require('../models/Tool');

const controller = createCrudController(Tool, 'Tool', {
  defaultSort: { displayOrder: 1 },
  requiredFields: ['name'],
});

module.exports = controller;
