let {
  scheduleJob
} = require('node-schedule');
let {
  waterfall,
  eachLimit
} = require('async');
let {
  getBalancesOfAccount
} = require('../server/helpers/account.helper')
let {
  updateAccount
} = require('../server/dbos/account.dbo')

let coins = ['ETH', 'BTC']

const balanceUpdate = (addresses, cb) => {
  eachLimit(addresses, 1, (address, iterate) => {
    let balances = null
    waterfall([
      (next) => {
        getBalancesOfAccount(address, (error, _balances) => {
          if (error) {
            next({}, null)
          } else {
            balances = _balances
            next();
          }
        })
      }, (next) => {
        updateAccount({
          address: address
        }, {
          balances: balances
        }, (error, resp) => {
          if (error) next({}, null)
          else next()
        })
      }
    ], (error, resp) => {
      iterate()
    })
  }, () => {
    cb()
  })
}

const balance = () => {
  scheduleJob('0 0 * * *', () => {
    accountDbo.getAccounts(coins, (error, accounts) => {
      if (error) {
        console.log('error in getting accounts')
      } else {
        addresses = lodash.map(accounts, 'address');
        balanceUpdate(addresses, () => {
          console.log('balanca update job')
        })
      }
    })
  })
}

module.exports = {
  balance
}