const createCrudController = require('../utils/crudFactory');
const Education = require('../models/Education');

const controller = createCrudController(Education, 'Education', {
  defaultSort: { startDate: -1 },
  requiredFields: ['degree', 'institution', 'startDate'],
});

module.exports = controller;
