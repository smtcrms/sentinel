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
  updateSwix
} = require('../server/dbos/swixer.dbo')
let SwixerModel = require('../server/models/swixer.model');
let {
  getBalance
} = require('../factories/accounts')

const inputCheck = (list, cb) => {
  eachLimit(list, 1, (item, iterate) => {
    let address = item.toAddress;
    let fromSymbol = item.fromSymbol;
    let balance = 0;

    waterfall([
      (next) => {
        getBalance(address, fromSymbol, (error, _balance) => {
          if (error) {
            next({
              message: 'error in getting balance'
            }, null)
          } else {
            balance = _balance
            next();
          }
        })
      }, (next) => {

        updateSwix({
          toAddress: address
        }, {
          status: 'gotFunds',
          receivedValue: balance,
          receivedTime: Date.now()
        }, (err, resp) => {
          if (err) {
            console.log('error at updating swix status in resend job');
            next({}, null)
          } else {
            next()
          }
        })
      }
    ], (err, resp) => {
      iterate();
    })
  }, () => {
    cb();
  })
}

const input = () => {
  scheduleJob('0 0 * * *', () => {
    SwixerModel.find({
      status: 'wait',
      isScheduled: false,
      $or: [{
          'remainingAmount': {
            $exists: false
          }
        },
        {
          'remainingAmount': {
            $gt: 0
          }
        }
      ],
      'tries': {
        $lt: 10
      }
    }, {
      '_id': 0
    }, (error, result) => {
      inputCheck(result, () => {
        console.log('input check job');
      })
    });
  })
}

module.exports = {
  input
}