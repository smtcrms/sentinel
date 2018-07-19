let async = require('async');
let schedule = require('node-schedule');
let accountDbo = require('../dbos/account.dbo');
let swixerDbo = require('../dbos/swixer.dbo');
let accountHelper = require('../helpers/account.helper');
let swixerHelper = require('../helpers/swixer.helper');
let { transfer } = require('../../factories/transactions');


let swixTransfer = (fromAccounts, toAddress, amount, coinSymbol, cb) => {
  fromAccounts.sort((x, y) => y.balance < x.balance);
  let txHashes = [], minAmount = (amount / fromAccounts.length);
  if (minAmount > fromAccounts[0].balance) minAmount = Number.POSITIVE_INFINITY;
  async.eachLimit(fromAccounts, 1,
    (fromAccount, next) => {
      let { balance,
        privateKey } = fromAccount;
      let value = Math.min(amount, Math.min(balance, minAmount));
      transfer(privateKey, toAddress, value, coinSymbol,
        (error, txHash) => {
          if (error) next(null);
          else {
            txHashes.push(txHash);
            amount -= value;
            next(null);
          }
        });
    }, () => {
      cb(null, {
        txHashes,
        remainingAmount: amount
      });
    });
};

let getTransferAmount = (address, fromSymbol, toSymbol, cb) => {
  async.waterfall([
    (next) => {
      accountHelper.getBalanceOfAddress(address, fromSymbol,
        (error, balance) => {
          if (error) next({
            code: 201,
            message: 'Error occurred while getting balance details.'
          }, null)
          else if (balance) next(null, balance);
          else next({
            code: 202,
            message: 'Balance is still empty.'
          }, null);
        });
    }, (fromValue, next) => {
      getExchangeRateValue(fromValue, fromSymbol, toSymbol,
        (error, value) => {
          if (error) next({
            code: 203,
            message: 'Error occurred while getting rate value.'
          }, null);
          else next(null, value);
        });
    }
  ], (error, toValue) => {
    if (error) cb(error, null);
    else cb(null, toValue);
  });
};

let getFromAccounts = (toAddress, toSymbol, accountsCount, amount, cb) => {
  async.waterfall([
    (next) => {
      accountDbo.getAccounts([toSymbol],
        (error, accounts) => {
          if (error) next({
            code: 401,
            message: 'Error occurred while getting from accounts.'
          }, null);
          else if (accounts.length) {
            accounts = accounts.filter((account) => account.address !== toAddress);
            next(null, accounts);
          } else next({
            code: 402,
            message: 'From accounts list is empty.'
          }, null);
        });
    }, (accounts, next) => {
      let addresses = lodash.map(accounts, 'address');
      accountHelper.getBalanceOfAddresses(addresses, toSymbol,
        (error, balances) => {
          if (error) next({
            code: 403,
            message: 'Error occurred while getting balances of from addresses.'
          }, null);
          else {
            lodash.map(accounts, (account) => lodash.assign(account, {
              balance: balances[account.address]
            }));
            next(null, accounts);
          }
        });
    }, (accounts, next) => {
      accounts = accounts.filter((account) => account.balance > 0);
      accounts.sort((x, y) => x.balance < y.balance);
      let balanceSum = 0, index = 0;
      for (index = 0; index < accountsCount; balanceSum += accounts[index].balance, ++index);
      for (index = accountsCount; index < accounts.length && balanceSum < amount; balanceSum += accounts[index].balance, ++index);
      accountsCount = index;
      if (accountsCount > accounts.length) next({
        code: 404,
        message: 'Not possible to transfer amount.'
      }, null);
      else {
        accounts = accounts.slice(0, accountsCount);
        next(null, accounts);
      }
    }
  ], (error, accounts) => {
    if (error) cb(error, null);
    else cb(null, accounts);
  });
};

let swixIt = (swixHash, cb) => {
  let swix = null;
  async.waterfall([
    (next) => {
      swixerDbo.getSwix({ swixHash },
        (error, _swix) => {
          if (error) next({
            code: 301,
            message: 'Error occurred while getting swix.'
          }, null);
          else if (_swix && _swix.status === 1) {
            swix = _swix;
            next(null);
          } else next({
            code: 302,
            message: 'Swix not found or Wrong swix status.'
          }, null);
        });
    }, (next) => {
      let { toAddress,
        toSymbol,
        fromAccountsCount,
        remainingAmount } = swix;
      getFromAccounts(toAddress, toSymbol, fromAccountsCount, remainingAmount,
        (error, accounts) => {
          if (error) next({
            code: 303,
            message: 'Error occurred while getting from accounts.'
          }, null);
          else next(null, accounts);
        });
    }, (fromAccounts, next) => {
      let { destinationAddress,
        remainingAmount,
        toSymbol } = swix;
      swixTransfer(fromAccounts, destinationAddress, remainingAmount, toSymbol,
        (error, info) => {
          if (error) next({
            code: 304,
            message: 'Error occurred while initiating swix transfer.'
          });
          else next(null, info);
        });
    }, (info, next) => {
      Object.assign(info, {
        status: info.remainingAmount === 0 ? 3 : 2
      });
      swixerDbo.updateSwix({ swixHash }, info,
        (error, result) => {
          if (error) next({
            code: 305,
            swixHash,
            info,
            message: 'Error occurred while updating swix status.'
          }, null);
          else next(null, {
            code: 300,
            swixHash,
            info,
            message: 'Swix done successfully.'
          });
        });
    }
  ], (error, success) => {
    if (error) cb(error, null);
    else cb(null, success);
  });
};

let scheduleIt = (swixHash, cb) => {
  let swix = null;
  async.waterfall([
    (next) => {
      swixerDbo.getSwix({ swixHash },
        (error, _swix) => {
          if (error) next({
            code: 101,
            message: 'Error occurred while getting swix.'
          }, null);
          else if (_swix && _swix.status === 0) {
            swix = _swix;
            next(null);
          } else next({
            code: 102,
            message: 'Swix not found or Wrong swix status.'
          }, null);
        });
    }, (next) => {
      let { fromSymbol,
        toAddress,
        inTxHash,
        receivedAmount } = swix;
      if (receivedAmount) next(null);
      else {
        swixerHelper.isValidInTx(toAddress, fromSymbol, inTxHash,
          (error, result) => {
            if (error) next({
              code: 103,
              message: 'Error occurred while checking tx.'
            });
            else if (result) {
              swix.receivedAmount = result.amount;
              next(null);
            } else next({
              code: 104,
              message: 'Failed or Invalid tx.'
            }, null);
          });
      }
    }, (next) => {
      let { toAddress,
        fromSymbol,
        toSymbol,
        remainingAmount } = swix;
      if (remainingAmount) {
        swix.delayInSeconds = 15;
        next(null);
      } else {
        getTransferAmount(toAddress, fromSymbol, toSymbol,
          (error, result) => {
            if (error) next({
              code: 105,
              message: 'Error occurred while getting transfer amount.'
            }, null);
            else {
              swix.exchangeRate = result.exchangeRate;
              swix.remainingAmount = result.remainingAmount;
              next(null);
            }
          });
      }
    }, (next) => {
      let { remainingAmount,
        receivedAmount,
        exchangeRate } = swix;
      swixerDbo.updateSwix({ swixHash }, {
        receivedAmount,
        remainingAmount,
        exchangeRate
      }, (error, result) => {
        if (error) next({
          code: 106,
          message: 'Error occurred while updating amount details.'
        }, null);
        else next(null);
      });
    }, (next) => {
      let { delayInSeconds } = swix;
      try {
        let scheduleDate = new Date(Date.now() + (delayInSeconds * 1000));
        schedule.scheduleJob(scheduleDate, swixIt(swixHash,
          (error, success) => { }));
        next(null);
      } catch (error) {
        next({
          code: 107,
          message: 'Error occurred while scheduling swix.'
        }, null);
      }
    }, (next) => {
      swixerDbo.updateSwix({ swixHash }, {
        status: 1
      }, (error, result) => {
        if (error) next({
          statcodeus: 108,
          message: 'Error occurred while updating swix status.'
        }, null); // TODO: Remove schedule if updation is failed.
        else next(null, {
          code: 100,
          message: 'Swix scheduled successfully.'
        });
      });
    }
  ], (error, success) => {
    if (error) cb(error, null);
    else cb(null, success);
  });
};

module.exports = {
  scheduleIt
};
