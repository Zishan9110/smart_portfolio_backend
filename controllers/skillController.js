const createCrudController = require('../utils/crudFactory');
const Skill = require('../models/Skill');

const controller = createCrudController(Skill, 'Skill', {
  defaultSort: { category: 1, displayOrder: 1 },
  requiredFields: ['name', 'proficiency', 'category'],
});

module.exports = controller;
