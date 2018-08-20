let async = require('async');
let crypto = require('crypto')
let accountDbo = require('../dbos/account.dbo')
let userDbo = require('../dbos/user.dbo');
let jwt = require('../helpers/user.helper');
let accountHelper = require('../helpers/account.helper');
let lodash = require('lodash')
let coins = require('../../config/coins')
let {
  algorithm,
  passwd,
  decimals
} = require('../../config/vars');
let {
  transfer
} = require('../../factories/transactions')

let refundDbo = require('../dbos/refund.dbo')


const signin = (req, res) => {
  let {
    username,
    password
  } = req.body

  async.waterfall([
    (next) => {
      let queryObject = {
        username: username
      }

      userDbo.findUser(queryObject, (error, user) => {
        if (error) next(error, null);
        else if (!user) next({
          message: 'User not found'
        }, null);
        else next(null, user)
      })
    }, (user, next) => {
      var cipher = crypto.createCipher(algorithm, passwd);
      var encrypted = cipher.update(password.toString(), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      if (encrypted === user.password) {
        next(null, user)
      } else {
        next({
          message: 'Password does not match'
        }, null)
      }
    }, (user, next) => {
      user = user.toObject()
      delete user.password

      try {
        let accessToken = jwt.getToken(user, 'access')
        let refreshToken = jwt.getToken(user, 'refresh')

        next(null, {
          accessToken,
          refreshToken
        })
      } catch (error) {
        next({
          'message': 'Error in creating tokens'
        }, null)
      }
    }
  ], (error, resp) => {
    if (error) {
      res.status(400).send({
        success: false,
        message: error.message
      })
    } else {
      res.status(200).send({
        success: true,
        message: 'Logged in successfully',
        accessToken: resp.accessToken,
        refreshToken: resp.refreshToken
      })
    }
  })
}

const profile = (req, res) => {
  res.status(200).send(req.user)
}

const sendAmount = (req, res) => {
  let {
    coinSymbol,
    amount,
    refundAddress
  } = req.body
  let coinType = coins[coinSymbol].type;
  let accounts = null;
  let addresses = null;
  let balancesOfAddresses = null
  let remainingAmount = amount * Math.pow(10, decimals[coinSymbol])

  async.waterfall([
    (next) => {
      accountDbo.getAccounts([coinType],
        (error, _accounts) => {
          if (error) next({
            status: 500,
            message: 'Error occurred while getting accounts.'
          }, null);
          else {
            accounts = _accounts;
            addresses = lodash.map(_accounts, 'address');
            next(null);
          }
        });
    }, (next) => {
      accountHelper.getBalancesOfAccounts(addresses,
        (error, _balancesOfAddresses) => {
          if (error) next({
            status: 500,
            message: 'Error occurred while getting balances of accounts.'
          }, null);
          else {
            let _balances = {}
            _balances[coinSymbol] = lodash.sum(lodash.map(_balancesOfAddresses, coinSymbol))
            console.log('balances of coinSymbol', _balancesOfAddresses, _balances)
            balances = _balances
            next(null);
          }
        });
    }, (next) => {
      remainingAmount = parseFloat(remainingAmount)
      if (remainingAmount > balances[coinSymbol]) {
        next({
          success: false,
          message: 'Insufficient amount'
        }, null)
      } else {
        async.eachLimit(addresses, 1, (address, iterate) => {
          let account = lodash.filter(accounts, item => item.address === address)[0];
          let _balances = balancesOfAddresses[address]
          let gas = 41e9 * 50e3;
          if (coinSymbol === 'ETH' && _balances.SENT > 10)
            gas = 41e9 * 50e3 * 6;

          if ((coinType === 'BTC' && _balances[coinSymbol] > 0) ||
            (coinType === 'ETH' && _balances.ETH > gas && _balances[coinSymbol] > 0 && remainingAmount > 0)) {
            let value1 = _balances[coinSymbol];

            if (coinSymbol === 'ETH') {
              value1 = _balances[coinSymbol] - gas
            }
            let value = Math.min(value1, remainingAmount);

            async.waterfall([
              (l2Next) => {
                transfer(account.privateKey, destinationAddress, value, coinSymbol,
                  (error, txHash) => {
                    console.log(error, txHash);
                    if (txHash || coinSymbol === 'PIVX') {
                      remainingAmount -= value;
                    }
                    l2Next(null, {
                      value,
                      txHash,
                      fromAddress: address,
                      timestamp: Date.now()
                    }, remainingAmount);
                  });
              }, (txInfo, remainingAmount, l2Next) => {
                let queryObject = {
                  address: refundAddress
                }
                let updateObject = {
                  '$push': {
                    'txInfos': txInfo
                  },
                  '$set': {
                    'remainingAmount': remainingAmount,
                    'amount': amount,
                    'time': Date.now()
                  }
                }
                refundDbo.updateRefund(queryObject, updateObject,
                  (error, result) => {
                    l2Next(null);
                  });
              }
            ], () => {
              iterate()
            })
          } else {
            iterate()
          }
        }, () => {
          next()
        })
      }
    },
  ], (error, resp) => {
    if (error) {
      res.status(400).send({
        success: false,
        error
      })
    } else {
      res.status(200).send(resp)
    }
  })
}

const sendAmountFromAddress = (req, res) => {
  let {
    fromAddress,
    toAddress,
    amount,
    coinSymbol
  } = req.body
  let account = null
  let balances = null
  let coinType = coins[coinSymbol].type;

  amount = amount * decimals[coinSymbol]

  async.waterfall([
    (next) => {
      let errorMessage = {
        success: false,
        message: 'Error in fetching account'
      }

      accountDbo.getAccount({
        address: fromAddress
      }, (error, _account) => {
        if (error) next(errorMessage, null)
        else {
          account = _account
          next(null)
        }
      })
    }, (next) => {
      let errorMessage = {
        success: false,
        message: 'Error in fetching balances'
      }

      accountHelper.getBalancesOfAccount(account.address, (error, _balances) => {
        if (error) next(errorMessage, null)
        else {
          balances = _balances
          next(null)
        }
      })
    }, (next) => {
      let errorMessage = {
        success: false,
        message: 'Insufficient funds'
      }
      let gas = 41 * 5e4 * 1e9

      if (coinType === 'ETH' && balances['ETH'] > gas && amount > balances[coinSymbol] ||
        coinType === 'BTC' && balances[coinSymbol]) {

        errorMessage.message = 'Error in sending amount'
        transfer(account.privateKey, toAddress, amount, coinSymbol, (error, txHash) => {
          if (error) next(errorMessage, null)
          else {
            let txInfo = {
              value: amount,
              fromAddress: fromAddress,
              txHash,
              timestamp: Date.now()
            }
            let queryObject = {
              address: fromAddress
            }
            let updateObject = {
              '$push': {
                'txInfos': txInfo
              },
              '$set': {
                'amount': amount,
                'remainingAmount': 0,
                'time': Date.now()
              }
            }

            refundDbo.updateRefund(queryObject, updateObject, (error, resp) => {
              errorMessage.message = 'Error in storing DB'
              if (error) next(errorMessage, null)
              else next(null, {
                success: true,
                txHash
              })
            })
          }
        })
      } else {
        next(errorMessage, null)
      }
    }
  ], (error, resp) => {
    if (error) res.status(400).send(error)
    else res.status(200).send(resp)
  })
}

module.exports = {
  signin,
  profile,
  sendAmount,
  sendAmountFromAddress
}