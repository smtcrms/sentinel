let swixController = require('../controllers/swixer.controller');
let swixValidation = require('../validations/swixer.validation');


module.exports = (server) => {
  server.get('/status', swixValidation.getStatus, swixController.getStatus);
  server.get('/pending',swixController.getPendingSwixes);
};
