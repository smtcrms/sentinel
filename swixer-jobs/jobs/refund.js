let {
  scheduleJob
} = require('node-schedule');
let {
  waterfall,
  eachLimit
} = require('async');
let {
  getBalance
} = require('../factories/accounts');
let {
  getAccount,
  updateBalances
} = require('../server/dbos/account.dbo');
let {
  transfer
} = require('../factories/transactions');
let {
  updateSwix
} = require('../server/dbos/swixer.dbo')
let {
  getExchangeRate
} = require('../factories/exchange');
let SwixerModel = require('../server/models/swixer.model');
let {
  decimals
} = require('../config/vars')

const resend = (list, cb) => {
  eachLimit(list, 1, (swix, iterate) => {
    let address = swix.toAddress; // deposit address
    let fromSymbol = swix.fromSymbol; // from coin symbol
    let toSymbol = swix.toSymbol; // to coin symbol
    let refundAddress = swix.refundAddress; // refund address of the user
    let refundingBalance = null;
    let accountDetails = null;
    let rate = swix.rate; // rate of the swix txn at the time raising a swix request

    waterfall([
      (next) => {
        let remainAmount = 'remainingAmount' in swix ? true : false // checking whether the remaingAmount field exist in swix object
        // if remainAmount not present send total amount back no need of conversion
        if (!remainAmount) {
          refundingBalance = swix.receivedValue
          next()
        } else {
          // some amount transferred. some amount got struck to transfer for more than 2 hours. so we need to recalculate of from coin symbol 
          let amount = swix.remainingAmount
          let fromDecimals = Math.pow(10, decimals[fromSymbol]); // from coin decimals
          let toDecimals = Math.pow(10, decimals[toSymbol]) // to coin decimals
          amount = ((amount / toDecimals) * fromDecimals) / rate // calculation of from coin from remaining amount of to coin
          refundingBalance = amount
          next()
        }
      }, (next) => {
        // fetching the amount of deposit address
        getAccount(address, (error, details) => {
          if (error) {
            next({
              message: 'Error at getAccount in resend job',
              error
            }, null)
          } else {
            accountDetails = details;
            next()
          }
        })
      }, (next) => {
        let queryObject = {
          toAddress: address
        }
        let updateObject = {
          isScheduled: true,
          status: 'refunded',
          message: 'refunded to the client'
        }

        // updating swix as refunding amount to the user
        updateSwix(queryObject, updateObject, (error, resp) => {
          if (error) {
            next({
              message: 'Error at updating swix status in resend job',
              error
            }, null)
          } else {
            next()
          }
        })
      }, (next) => {
        let keyLocked = `lockedBalances.${swix.fromSymbol}`
        let keyAvailable = `availableBalances.${swix.fromSymbol}`
        let findData = {
          address: swix.toAddress
        };
        let updateData = {}
        updateData[keyLocked] = -swix.receivedValue
        updateData[keyAvailable] = swix.receivedValue - refundingBalance
        // updating the balances of deposit address after refunding
        updateBalances(findData, updateData, (error, resp) => {
          if (error) {
            next({
              message: 'Error at updateBalnces in resend job',
              error
            }, null)
          } else {
            next()
          }
        })
      }, (next) => {
        let privateKey = accountDetails.privateKey; // private key of deposit address
        // transfering the amount from deposit address
        transfer(privateKey, refundAddress, refundingBalance, fromSymbol, (error, resp) => {
          if (error) {
            console.log('')
            next({
              message: 'Error at transfer in resend job',
              error
            }, null)
          } else {
            next()
          }
        })
      }
    ], (error, resp) => {
      if (error)
        console.log('error in refund job', error)
      iterate();
    })
  }, () => {
    cb();
  })
}

const refund = () => {
  scheduleJob('*/10 * * * *', () => {
    let time = Date.now() - 2 * 60 * 60 * 1000
    let queryObject = {
      "tries": {
        '$gte': 10
      },
      '$or': [{
        'remainingAmount': {
          '$exists': false
        }
      }, {
        'remainingAmount': {
          '$gt': 0
        }
      }],
      "isScheduled": false,
      "lastUpdateOn": {
        '$lte': new Date(time)
      }
    }
    //fetching the swix txns which are deposited funds and no money sent back to user since more than 2 hours
    SwixerModel.find(queryObject, (error, list) => {
      if (error) {
        console.log('Error occured in resend job', error)
      } else if (list.length) {
        resend(list, () => {})
      }
    })
  })
}

module.exports = {
  refund
}