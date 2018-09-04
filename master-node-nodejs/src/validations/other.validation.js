import joi from 'joi';
import utils from '../utils/validation';

const logError = (req, res, next) => {
  let createSchema = joi.object().keys({
    os: joi.string().required(),
    account_addr: joi.string().required(),
    error_str: joi.string().required(),
  })
  let validation = utils.validate(req.body, createSchema);
  if (validation.isValid) {
    next();
  } else {
    res.status(422).send(validation);
  }
}


const getFreeAmount = (req, res, next) => {
  let createSchema = joi.object().keys({
    account_addr: joi.string().required(),
  })
  let validation = utils.validate(req.body, createSchema);
  if (validation.isValid) {
    next();
  } else {
    res.status(422).send(validation);
  }
}

export default {
	logError,
	getFreeAmount
}
