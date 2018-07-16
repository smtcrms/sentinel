let joi = require('joi');


let createAccount = (req, res, next) => {
  let createAccountSchema = joi.object().keys({
    fromSymbol: joi.string().required(),
    toSymbol: joi.string().required(),
    refundAddress: joi.string().required(),
    destinationAddress: joi.string().required(),
    delayInSeconds: joi.number().required(),
    fromAccountsCount: joi.number()
  });
  let { error } = joi.validate(req.body, createAccountSchema);
  if (error) res.status(422).send({
    success: false,
    error
  });
  else next();
};

module.exports = {
  createAccount
};