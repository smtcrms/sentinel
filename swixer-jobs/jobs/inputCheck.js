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
        if (balance > 0) {
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
        } else {
          next()
        }
      }
    ], (err, resp) => {
      iterate();
    })
  }, () => {
    cb();
  })
}

const input = () => {
  scheduleJob('0 * * * * *', () => {
    SwixerModel.find({
      status: 'wait',
      isScheduled: false,
      $or: [{
        'remainingAmount': {
          $exists: false
        }
      }, {
        'remainingAmount': {
          $gt: 0
        }
      }],
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

/* let a = {
  "_id": ObjectId("5b5997de0ef787c3fdee2357"),
  "tries": 0,
  "isScheduled": false,
  "status": "wait",
  "message": "Swix is complete.",
  "txInfos": [],
  "fromSymbol": "SENT",
  "toSymbol": "PIVX",
  "clientAddress": "0x47bd80a152d0d77664d65de5789df575c9cabbdb",
  "destinationAddress": "DQvWbq96oxPH1tkKrscXFaRkxsMBZwoEx8",
  "delayInSeconds": 60,
  "rate": 0.0038829435635694266,
  "refundAddress": "0x47bd80a152d0d77664d65de5789df575c9cabbdb",
  "toAddress": "0x178fbac45338a185f9d1340f73bab200592bb67d",
  "swixHash": "4d430453aee15fb889b13e6163e43272",
  "insertedOn": new Date(),
  "lastUpdateOn": new Date(),
} */