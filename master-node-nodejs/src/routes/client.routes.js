import {
  Router
} from 'express';

import AccountController from '../controllers/account.controller';
import VpnController from '../controllers/vpn.controller';
import TransactionController from '../controllers/transactions';
import AccountValidation from "../validations/account.validation";
import VpnValidation from "../validations/vpn.validation";

const routes = new Router();

routes.post('/account', AccountValidation.validateCreateAccount, AccountController.createAccount);
routes.post('/account/balance', AccountValidation.getBalance, AccountController.getBalance);
routes.post('/raw-transaction', AccountValidation.rawTransaction, TransactionController.rawTransaction);
routes.post('/vpn', VpnValidation.getVpnCredentials, VpnController.getVpnCredentials);
routes.post('/vpn/current', VpnValidation.getCurrentVpnUsage, VpnController.getCurrentVpnUsage);
routes.get('/vpn/list', VpnController.getVpnsList);
routes.get('/vpn/socks-list', VpnController.getSocksList);
routes.post('/vpn/usage', VpnValidation.getVpnUsage, VpnController.getVpnUsage);
routes.post('/vpn/pay', VpnValidation.payVpnUsage, VpnController.payVpnUsage);
routes.post('/vpn/report', VpnValidation.reportPayment, VpnController.reportPayment);
routes.post('/update-connection', VpnController.updateConnection, VpnController.updateConnection);
routes.get('/app/stats', VpnController.getStats);

export default routes;
