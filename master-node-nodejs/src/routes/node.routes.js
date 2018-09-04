import {
  Router
} from 'express';
import NodeController from '../controllers/node.controller';
import AccountController from '../controllers/account.controller';
import AccountValidator from "../validations/account.validation";
import NodeValidator from "../validations/node.validation";

const routes = new Router();

routes.post('/account', AccountValidator.validateCreateAccount, AccountController.createAccount);
routes.post('/account/balance', AccountValidator.getBalance, AccountController.getBalance);
routes.post('/register', NodeValidator.registerNode, NodeController.registerNode);
routes.post('/update-nodeinfo', NodeValidator.updateNodeInfo, NodeController.updateNodeInfo);
routes.post('/deregister', NodeValidator.deRegisterNode, NodeController.deRegisterNode);
routes.post('/update-connections', NodeValidator.updateConnections, NodeController.updateConnections);
routes.get('/list', NodeController.getNodesList);

export default routes;
