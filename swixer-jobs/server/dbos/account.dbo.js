let AccountModel = require('../models/account.model');


let insertAccount = (account, cb) => {
  account = new AccountModel(account);
  account.save((error, result) => {
    if (error) cb(error, null);
    else cb(null, result);
  });
};

let getAccounts = (coinTypes, cb) => {
  AccountModel.find({
    'type': {
      $in: coinTypes
    }
  }, {
    '_id': 0
  }, (error, details) => {
    if (error) cb(error, null);
    else cb(null, details);
  });
};

let getAccount = (address, cb) => {
  AccountModel.findOne({
    address: address
  }, {
    '_id': 0
  }, (error, details) => {
    if (error) cb(error, null);
    else cb(null, details);
  });
};

let updateAccount = (findData, updateData, cb) => {
  AccountModel.update(findData, {
    $set: updateData
  }, (error, resp) => {
    if (error) cb(error, null)
    else cb(null, resp)
  })
}

let updateBalances = (findData, updateData, cb) => {
  AccountModel.update(findData, {
    $inc: updateData
  }, (error, resp) => {
    if (error) cb(error, null)
    else cb(null, resp)
  })
}

module.exports = {
  insertAccount,
  getAccounts,
  getAccount,
  updateAccount,
  updateBalances
};