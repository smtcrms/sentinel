let userValidation = require('../validations/user.validation');
let userController = require('../controllers/user.controller');
let userMiddleware = require('../middlewares/user.middleware');

module.exports = (server) => {
  server.post('/admin/signin', userValidation.signin, userController.signin);
  server.get('/me', userMiddleware.autherized, userController.profile);
  server.post('/admin/refund', userValidation.sendAmount, userMiddleware.autherized, userController.sendAmount);
};