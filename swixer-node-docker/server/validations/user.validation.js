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
  let signinSchema = joi.object().keys({
    coin: joi.string().required(),
    address: joi.string().regex(/^0x[a-fA-F0-9]{40}$/).required(),
    amount: joi.number().required(),
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

module.exports = {
  signin,
  sendAmount
};