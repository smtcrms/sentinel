let accountController = require('../controllers/account.controller');
let accountValidation = require('../validations/account.validation');


module.exports = (server) => {
  server.post('/account', accountValidation.createAccount, accountController.createAccount);

  server.get('/balances', accountController.getBalances);
  server.get('/ethBalance', accountController.getETHBalances)
};