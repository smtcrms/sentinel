let async = require('async');
let accounts = require('../../factories/accounts');


let getAccount = (coinSymbol, cb) => {
  accounts.getAccount(coinSymbol,
    (error, account) => {
      cb(error, account);
    });
};

let getBalanceOfAddress = (address, coinSymbol, cb) => {
  accounts.getBalance(address, coinSymbol,
    (error, balance) => {
      cb(error, balance);
    });
};

let getBalanceOfAddresses = (addresses, coinSymbol, cb) => {
  let balances = {};
  async.each(addresses,
    (address, next) => {
      getBalanceOfAddress(address, coinSymbol,
        (error, balance) => {
          if (error) next(error);
          else {
            balances[address] = balance;
            next(null);
          }
        });
    }, (error) => {
      if (error) cb(error, null);
      else cb(null, balances);
    });
};

let getBalancesOfAddress = (address, coinSymbols, cb) => {
  let balances = {};
  async.each(coinSymbols,
    (coinSymbol, next) => {
      getBalanceOfAddress(address, coinSymbol,
        (error, balance) => {
          if (error) next(error);
          else {
            balances[coinSymbol] = balance;
            next(null);
          }
        });
    }, (error) => {
      if (error) cb(error, null);
      else cb(null, balances);
    });
};

let getBalancesOfAddresses = (addresses, coinSymbols, cb) => {
  let balances = {};
  async.each(addresses,
    (address, next) => {
      getBalancesOfAddress(address, coinSymbols,
        (error, _balances) => {
          if (error) next(error);
          else {
            balances[address] = _balances;
            next(null);
          }
        });
    }, (error) => {
      if (error) cb(error, null);
      else cb(null, balances);
    });
};

module.exports = {
  getAccount,
  getBalanceOfAddress,
  getBalanceOfAddresses,
  getBalancesOfAddress,
  getBalancesOfAddresses
};
