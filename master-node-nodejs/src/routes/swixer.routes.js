import {
  Router
} from 'express'
import swixerController from '../controllers/swixer.controller';
import swixerValidation from "../validations/swixer.validation";

let routes = Router()

routes.get('/', (req, res) => {
  res.status(200).send({
    'status': 'Up'
  })
});


routes.post('/', swixerValidation.getSwixDetails, swixerController.getSwixDetails);
routes.get('/rate', swixerValidation.getExchangeValue, swixerController.getExchangeValue);
routes.get('/status', swixerValidation.getSwixStatus, swixerController.getSwixStatus);
routes.get('/list', swixerController.getSwixerNodesList);
routes.post('/register', swixerValidation.registerSwixerNode, swixerController.registerSwixerNode);
routes.post('/deregister', swixerValidation.deRegisterSwixerNode, swixerController.deRegisterSwixerNode);
routes.post('/update-nodeinfo', swixerController.updateSwixerNodeInfo);

export default routes