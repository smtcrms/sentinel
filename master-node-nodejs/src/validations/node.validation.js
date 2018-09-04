import joi from 'joi';
import utils from '../utils/validation';

const updateNodeInfo = (req, res, next) => {
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

const deRegisterNode = (req, res, next) => {
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

const updateConnections = (req, res, next) => {
  let getVpnSchema = joi.object().keys({
    token: joi.string().required(),
    account_addr: joi.string().required(),
    connections: joi.array().required()
  })
  let validation = utils.validate(req.body, getVpnSchema);
  if (validation.isValid) {
    next();
  } else {
    res.status(422).send(validation);
  }
}

const registerNode = (req, res, next) => {
  let getVpnSchema = joi.object().keys({
    account_addr: joi.string().required(),
    price_per_gb: joi.number(),
    price_per_GB: joi.number(),
    ip: joi.string().required(),
    location: joi.object().required(),
    net_speed: joi.object().required(),
    vpn_type: joi.string(),
    enc_method: joi.string()
  })
  let validation = utils.validate(req.body, getVpnSchema);
  if (validation.isValid) {
    next();
  } else {
    res.status(422).send(validation);
  }
}

export default {
  updateNodeInfo,
  deRegisterNode,
	updateConnections,
	registerNode
}
