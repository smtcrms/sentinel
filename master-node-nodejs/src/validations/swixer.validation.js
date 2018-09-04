import joi from 'joi';
import utils from '../utils/validation';

const getSwixDetails = (req, res, next) => {
  let getVpnSchema = joi.object().keys({
    node_address: joi.string().required(),
    from_symbol: joi.string().required(),
    to_symbol: joi.string().required(),
    client_address: joi.string().required(),
    destination_address: joi.string().required(),
    delay_in_seconds: joi.number().required(),
    refund_address: joi.string()
  })

  let validation = utils.validate(req.body, getVpnSchema);
  if (validation.isValid) {
    next();
  } else {
    res.status(422).send(validation);
  }
}

const getExchangeValue = (req, res, next) => {
  let getVpnSchema = joi.object().keys({
    node: joi.string().required(),
    from: joi.string().required(),
    to: joi.string().required(),
    value: joi.string().required(),
  })

  let validation = utils.validate(req.query, getVpnSchema);
  if (validation.isValid) {
    next();
  } else {
    res.status(422).send(validation);
  }
}

const getSwixStatus = (req, res, next) => {
  let getVpnSchema = joi.object().keys({
    hash: joi.string().required(),
  })

  let validation = utils.validate(req.query, getVpnSchema);
  if (validation.isValid) {
    next();
  } else {
    res.status(422).send(validation);
  }
}

const deRegisterSwixerNode = (req, res, next) => {
  let getVpnSchema = joi.object().keys({
    account_addr: joi.string().required(),
    token: joi.string().required()
  })

  let validation = utils.validate(req.body, getVpnSchema);
  if (validation.isValid) {
    next();
  } else {
    res.status(422).send(validation);
  }
}

const updateSwixerNodeInfo = (req, res, next) => {
  let getVpnSchema = joi.object().keys({
    token: joi.string().required(),
    account_addr: joi.string().required(),
    info: joi.object().required()
  })

  let validation = utils.validate(req.body, getVpnSchema);
  if (validation.isValid) {
    next();
  } else {
    res.status(422).send(validation);
  }
}

const registerSwixerNode = (req, res, next) => {
  let getVpnSchema = joi.object().keys({
    account_addr: joi.string().required(),
    ip: joi.string().required(),
    service_charge: joi.number().required(),
    joined_on: joi.number().required(),
    swixer: joi.object().required()
  })

  let validation = utils.validate(req.body, getVpnSchema);
  if (validation.isValid) {
    next();
  } else {
    res.status(422).send(validation);
  }
}

export default {
  getSwixDetails,
  getExchangeValue,
  getSwixStatus,
  deRegisterSwixerNode,
	updateSwixerNodeInfo,
	registerSwixerNode
}
