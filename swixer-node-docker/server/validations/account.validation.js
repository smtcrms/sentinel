let joi = require('joi');


let createAccount = (req, res, next) => {
  let createAccountSchema = joi.object().keys({
    fromSymbol: joi.string().required(),
    toSymbol: joi.string().required(),
    //clientAddress: req.body['fromSymbol'] !== 'PIVX' ? joi.string().regex(/^0x[a-fA-F0-9]{40}$/).required() : joi.string().regex(/^D[a-km-zA-HJ-NP-z1-9]{25,34}$/).required(),
    clientAddress: req.body['fromSymbol'] !== 'PIVX' ? joi.string().regex(/^0x[a-fA-F0-9]{40}$/).required() : joi.string().required(),
    destinationAddress: joi.string().required(),
    delayInSeconds: joi.number().required(),
    refundAddress: req.body['fromSymbol'] !== 'PIVX' ? joi.string().regex(/^0x[a-fA-F0-9]{40}$/).required() : joi.string().required(),
    // refundAddress: req.body['fromSymbol'] !== 'PIVX' ? joi.string().regex(/^0x[a-fA-F0-9]{40}$/).required() : joi.string().regex(/^D[a-km-zA-HJ-NP-z1-9]{25,34}$/).required(),
    rate: joi.number().required()
  });
  let {
    error
  } = joi.validate(req.body, createAccountSchema, { allowUnknown: true });
  if (error) res.status(422).send({
    success: false,
    error
  });
  else next();
};

module.exports = {
  createAccount
};