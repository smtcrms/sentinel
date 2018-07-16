let swixContoller = require('../controllers/swixer.controller');
let swixValidation = require('../validations/swixer.validation');
let swixer = require('../../swixer');


module.exports = (server) => {
  server.put('/swix', swixValidation.addInTxHash, swixContoller.addInTxHash, swixer.scheduleIt);

  server.get('/status', swixValidation.getStatus, swixContoller.getStatus);
};