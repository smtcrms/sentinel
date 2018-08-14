let {
  scheduleJob
} = require('node-schedule');
let {
  waterfall,
  eachLimit
} = require('async');
let {
  updateSwix
} = require('../server/dbos/swixer.dbo')
let SwixerModel = require('../server/models/swixer.model');
let {
  getBalance
} = require('../factories/accounts')

const inputCheck = (list, cb) => { //check for deposit of funds
  eachLimit(list, 1, (item, iterate) => {
    let address = item.toAddress; //deposit address
    let fromSymbol = item.fromSymbol; // from coin symbol of swix transaction
    let balance = 0; //deposited balance

    waterfall([
      (next) => {
        getBalance(address, fromSymbol, (error, _balance) => { //checking the balance of deposit address
          if (error) {
            next({
              message: 'error in getting balance',
              error
            }, null)
          } else {
            balance = _balance // deposited amount
            next();
          }
        })
      }, (next) => {
        if (balance > 0) { //checking for the amount deposited is greater or not
          let queryObject = {
            toAddress: address
          }

          let updateObject = {
            status: 'gotFunds',
            receivedValue: balance,
            receivedTime: Date.now()
          }
          
          updateSwix(queryObject, updateObject, (error, resp) => { //updating received time and received value for swix
            if (error) {
              next({
                message: 'Error in updating swix of input check tx',
                error
              }, null)
            } else {
              next()
            }
          })
        } else {
          next()
        }
      }
    ], (error, resp) => {
      if (error)
        console.log('inTransactionJob', error)
      iterate();
    })
  }, () => {
    cb();
  })
}

const input = () => {
  scheduleJob('0 * * * * *', () => {

    let queryObject = {
      'status': 'wait',
      'isScheduled': false,
      '$or': [{
        'remainingAmount': {
          '$exists': false
        }
      }, {
        'remainingAmount': {
          '$gt': 0
        }
      }],
      'tries': {
        '$lt': 10
      }
    }

    SwixerModel.find(queryObject, {
      '_id': 0
    }, (error, result) => {
      if (error) {
        console.log('Error at in transaction check job', error);
      } else if (result.length > 0) {

        inputCheck(result, () => {})
      }
    });
  })
}

module.exports = {
  input
}