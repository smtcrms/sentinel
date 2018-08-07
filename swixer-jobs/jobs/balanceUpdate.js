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
let accountDbo = require('../server/dbos/account.dbo')

let coins = ['ETH', 'BTC']

const balanceUpdate = (accounts, cb) => {
  eachLimit(accounts, 1, (account, iterate) => {
    account = account.toObject()
    let address = account.address;
    let balances = null
    console.log('accounts', account)
    let hasLocked = 'lockedBalances' in account ? true : false
    console.log('haslocked', hasLocked)
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
        if (hasLocked) {
          let lockedBalances = account['lockedBalances']
          console.log('locked', lockedBalances)
          let keys = Object.keys(lockedBalances);
          keys.map((key) => {
            balances[key] -= lockedBalances[key]
          })
        }
        console.log('balances', balances)
        accountDbo.updateAccount({
          address: address
        }, {
          availableBalances: balances
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
  scheduleJob('0 */6 * * *', () => {
    accountDbo.getAccounts(coins, (error, accounts) => {
      if (error) {
        console.log('error in getting accounts')
      } else {
        balanceUpdate(accounts, () => {
          console.log('balanca update job')
        })
      }
    })
  })
}

module.exports = {
  balance
}