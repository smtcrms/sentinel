let joi = require('joi');

let signin = (req, res, next) => {
  let signinSchema = joi.object().keys({
    username: joi.string().required(),
    password: joi.string().required(),
  });
  let {
    error
  } = joi.validate(req.body, signinSchema);
  if (error) res.status(422).send({
    success: false,
    message: error.details[0].message
  });
  else next();
};

let sendAmount = (req, res, next) => {
  let sendAmountSchema = joi.object().keys({
    coinSymbol: joi.string().required(),
    address: joi.string().required(),
    amount: joi.number().required(),
  });

  let {
    error
  } = joi.validate(req.body, sendAmountSchema);

  if (error) res.status(422).send({
    success: false,
    message: error.details[0].message
  });
  else next();
};

let sendFromAddress = (req, res, next) => {
  let sendFromSchema = joi.object().keys({
    coinSymbol: joi.string().required(),
    fromAddress: joi.string().required(),
    toAddress: joi.string().required(),
    amount: joi.number().required(),
  });

  let {
    error
  } = joi.validate(req.body, sendFromSchema);

  if (error) res.status(422).send({
    success: false,
    message: error.details[0].message
  });
  else next();
};

module.exports = {
  signin,
  sendAmount,
  sendFromAddress
};